import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  Deno.env.get('APP_URL') || 'https://fastgravacoes.com.br',
  'https://xxroejpvloldkmqdydar.lovableproject.com',
].filter(Boolean);

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  // Only reflect the origin back if it is explicitly allowed; fall back to the
  // primary app URL to avoid echoing arbitrary origins (CORS bypass risk).
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-webhook-signature, x-forwarded-for, x-real-ip',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Vary': 'Origin',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

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

    // Check database (use a table that always exists in this project)
    const { error: dbError } = await supabase.from("profiles").select("id").limit(1);
    checks.database = !dbError;

    // Check storage with timeout
    const storagePromise = supabase.storage.listBuckets();
    const storageResult = await Promise.race([
      storagePromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Storage timeout')), 2000))
    ]).catch(() => ({ error: true }));
    checks.storage = !(storageResult as any).error;

    // Check auth with timeout
    const authPromise = supabase.auth.getSession();
    const authResult = await Promise.race([
      authPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 2000))
    ]).catch(() => ({ error: true }));
    checks.auth = !(authResult as any).error;

    const allHealthy = Object.values(checks).every(Boolean);
    const responseTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        status: allHealthy ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        checks,
        version: "1.0.0",
        fallback: !allHealthy,
      }),
      {
        status: 200,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        status: "unhealthy",
        error: message,
        timestamp: new Date().toISOString(),
        fallback: true,
      }),
      { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
