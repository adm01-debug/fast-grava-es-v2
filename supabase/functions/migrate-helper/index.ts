import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts"

serve(async (req) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  const corsHeaders = getCorsHeaders(req);

  try {
    const accessKey = Deno.env.get("MIGRATE_HELPER_KEY");
    const providedKey = req.headers.get("x-access-key") || req.headers.get("apikey");

    if (!accessKey || providedKey !== accessKey) {
      console.error("Unauthorized access attempt to migrate-helper");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action } = await req.json().catch(() => ({ action: "ping" }));

    if (action === "ping") {
      return new Response(
        JSON.stringify({ 
          status: "online",
          version: "2.1.0",
          timestamp: new Date().toISOString(),
          config: {
            has_url: !!Deno.env.get("SUPABASE_URL"),
            has_service_role: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Action not implemented in hardened version" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in migrate-helper:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
})
