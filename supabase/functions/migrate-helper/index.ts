import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * migrate-helper v2.1.0-hardened
 * 
 * Uma função de utilidade para migração técnica de banco de dados.
 * Segurança:
 * - Exige header 'x-access-key' validado contra segredo de ambiente.
 * - Não expõe segredos brutos (SUPABASE_SERVICE_ROLE_KEY).
 * - Usa helper CORS restrito.
 */

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const accessKey = Deno.env.get("MIGRATE_HELPER_KEY");
    const providedKey = req.headers.get("x-access-key");

    if (!accessKey || providedKey !== accessKey) {
      console.warn("Tentativa de acesso não autorizado à Edge Function migrate-helper");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid or missing access key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "ping";

    let result = {};

    switch (action) {
      case "ping":
        result = { 
          status: "online", 
          version: "2.1.0-hardened",
          timestamp: new Date().toISOString()
        };
        break;
      
      case "config-check":
        // Apenas confirma a presença das variáveis sem vazar o conteúdo
        result = {
          has_db_url: !!Deno.env.get("SUPABASE_DB_URL"),
          has_service_role: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
          has_url: !!Deno.env.get("SUPABASE_URL"),
          project_ref: Deno.env.get("SUPABASE_URL")?.split('.')[0].split('//')[1] || "unknown"
        };
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error(`Erro na execução da Edge Function: ${error.message}`);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
