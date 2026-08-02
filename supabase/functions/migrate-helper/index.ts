import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Edge Function de hardening para migração técnica.
// ATENÇÃO: Esta função deve ser removida imediatamente após o uso.
// NUNCA exponha credenciais service_role ou URLs de banco diretamente.

serve(async (req) => {
  // Responde a requisições OPTIONS para CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Acesso restrito via chave de segredo configurada no ambiente
    const accessKey = req.headers.get("x-access-key");
    const systemKey = Deno.env.get("MIGRATE_HELPER_KEY");

    if (!systemKey || accessKey !== systemKey) {
      console.error("Tentativa de acesso não autorizado detectada.");
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Invalid or missing access key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action } = await req.json();

    if (action === "config-check") {
      // Apenas confirma se as variáveis estão presentes, sem vazar os valores
      return new Response(
        JSON.stringify({
          status: "ready",
          has_url: !!Deno.env.get("SUPABASE_URL"),
          has_service_role: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
          timestamp: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "ping") {
      return new Response(
        JSON.stringify({ message: "pong", version: "2.0.0-hardened" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro na execução da migrate-helper:", error.message);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
