import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const checks = {
      database: false,
      storage: false,
      auth: false,
    };

    // Check database
    const { error: dbError } = await supabase.from("health_check").select("id").limit(1);
    checks.database = !dbError;

    // Check storage
    const { error: storageError } = await supabase.storage.listBuckets();
    checks.storage = !storageError;

    // Check auth
    const { error: authError } = await supabase.auth.getSession();
    checks.auth = !authError;

    const allHealthy = Object.values(checks).every(Boolean);
    const responseTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        status: allHealthy ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        checks,
        version: "1.0.0",
      }),
      {
        status: allHealthy ? 200 : 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        status: "unhealthy",
        error: message,
        timestamp: new Date().toISOString(),
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
});
