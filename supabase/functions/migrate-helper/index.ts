import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const accessKey = req.headers.get("x-access-key");
    const validKey = Deno.env.get("MIGRATE_HELPER_KEY");

    if (!validKey || accessKey !== validKey) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid or missing access key" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { action } = await req.json();

    if (action === "check-env") {
      return new Response(
        JSON.stringify({
          success: true,
          env: {
            has_url: !!Deno.env.get("SUPABASE_URL"),
            has_service_role: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
            has_db_url: !!Deno.env.get("SUPABASE_DB_URL")
          }
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});