import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts";

// Edge function protegida para verificação de ambiente durante migração.
// IMPORTANTE: Esta função NÃO deve expor segredos sensíveis diretamente.

Deno.serve(async (req) => {
  // Handle CORS
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  const corsHeaders = getCorsHeaders(req, {
    headers: "authorization, x-client-info, apikey, content-type, x-access-key"
  });

  const accessKey = req.headers.get("x-access-key");
  const expectedKey = Deno.env.get("MIGRATE_HELPER_KEY");

  if (!expectedKey || accessKey !== expectedKey) {
    console.error("Tentativa de acesso não autorizado ao migrate-helper");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "ping";

  try {
    if (action === "ping") {
      return new Response(
        JSON.stringify({ 
          status: "online", 
          has_url: !!Deno.env.get("SUPABASE_URL"),
          has_service_role: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
        }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (action === "config-check") {
      // Apenas valida se as variáveis necessárias existem sem retorná-las
      const dbUrl = Deno.env.get("SUPABASE_DB_URL");
      return new Response(
        JSON.stringify({ 
          ready: !!dbUrl,
          message: dbUrl ? "Ambiente configurado" : "Variável SUPABASE_DB_URL ausente"
        }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }), 
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});