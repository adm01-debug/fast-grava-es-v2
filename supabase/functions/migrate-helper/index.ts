import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const accessKey = Deno.env.get("MIGRATE_HELPER_KEY")
    const providedKey = req.headers.get("x-access-key")

    if (!accessKey || providedKey !== accessKey) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { action } = await req.json()

    if (action === "ping") {
      return new Response(
        JSON.stringify({ 
          status: "online",
          version: "2.0.1",
          env: {
            has_url: !!Deno.env.get("SUPABASE_URL"),
            has_service_role: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
