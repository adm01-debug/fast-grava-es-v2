import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  Deno.env.get('APP_URL') || 'https://fastgravacoes.com.br',
  'https://xxroejpvloldkmqdydar.lovableproject.com',
].filter(Boolean);

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-webhook-signature, x-forwarded-for, x-real-ip',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Vary': 'Origin',
  };
}

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
  blockDurationMinutes: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowSeconds: 60,
  blockDurationMinutes: 15,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { endpoint, user_id, user_email } = body;

    // Get client IP from headers
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('x-real-ip') 
      || '0.0.0.0';

    console.log(`Rate limit check for IP: ${ip}, endpoint: ${endpoint}`);

    // Check if IP is blocked. Use limit(1)+maybeSingle so the common
    // "not blocked" (0 rows) case doesn't raise an error, and duplicate block
    // rows don't accidentally let a blocked IP through.
    const { data: blockedIP } = await supabase
      .from('blocked_ips')
      .select('id, expires_at, is_permanent')
      .eq('ip_address', ip)
      .is('unblocked_at', null)
      .limit(1)
      .maybeSingle();

    if (blockedIP) {
      // Check if block has expired
      if (!blockedIP.is_permanent && blockedIP.expires_at) {
        const expiresAt = new Date(blockedIP.expires_at);
        if (expiresAt > new Date()) {
          console.log(`IP ${ip} is blocked until ${blockedIP.expires_at}`);
          return new Response(
            JSON.stringify({ 
              allowed: false, 
              reason: 'ip_blocked',
              expires_at: blockedIP.expires_at 
            }),
            { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }, status: 429 }
          );
        }
      } else if (blockedIP.is_permanent) {
        console.log(`IP ${ip} is permanently blocked`);
        return new Response(
          JSON.stringify({ allowed: false, reason: 'ip_blocked_permanent' }),
          { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }, status: 429 }
        );
      }
    }

    // Get rate limit config for endpoint
    let config = DEFAULT_CONFIG;
    const { data: settings } = await supabase
      .from('rate_limit_settings')
      .select('*')
      .eq('is_active', true)
      .order('endpoint_pattern');

    if (settings) {
      // Find matching config (most specific first)
      for (const setting of settings) {
        const pattern = setting.endpoint_pattern;
        if (pattern === endpoint || 
            (pattern.endsWith('*') && endpoint.startsWith(pattern.slice(0, -1))) ||
            pattern === '*') {
          config = {
            maxRequests: setting.max_requests,
            windowSeconds: setting.window_seconds,
            blockDurationMinutes: setting.block_duration_minutes,
          };
          break;
        }
      }
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowSeconds * 1000);

    // Count requests in current window
    const { count, error: countError } = await supabase
      .from('rate_limit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .eq('endpoint', endpoint)
      .gte('created_at', windowStart.toISOString());

    if (countError) {
      console.error('Error counting requests:', countError);
    }

    const requestCount = (count || 0) + 1;

    // Log this request
    await supabase.from('rate_limit_logs').insert({
      ip_address: ip,
      endpoint: endpoint,
      user_id: user_id,
      user_email: user_email,
      request_count: requestCount,
      window_start: windowStart.toISOString(),
      window_end: now.toISOString(),
      is_blocked: requestCount > config.maxRequests,
    });

    // Check if rate limit exceeded
    if (requestCount > config.maxRequests) {
      console.log(`Rate limit exceeded for IP ${ip}: ${requestCount}/${config.maxRequests}`);

      // Auto-block the IP
      const expiresAt = new Date(now.getTime() + config.blockDurationMinutes * 60 * 1000);
      
      await supabase.from('blocked_ips').insert({
        ip_address: ip,
        reason: `Rate limit exceeded: ${requestCount} requests in ${config.windowSeconds}s on ${endpoint}`,
        expires_at: expiresAt.toISOString(),
        is_permanent: false,
        request_count_at_block: requestCount,
      });

      // Log security event
      await supabase.from('security_events').insert({
        event_type: 'rate_limit_exceeded',
        severity: 'warning',
        user_id: user_id,
        user_email: user_email,
        ip_address: ip,
        details: {
          endpoint,
          request_count: requestCount,
          max_requests: config.maxRequests,
          window_seconds: config.windowSeconds,
          block_duration_minutes: config.blockDurationMinutes,
        },
      });

      return new Response(
        JSON.stringify({ 
          allowed: false, 
          reason: 'rate_limit_exceeded',
          retry_after: config.blockDurationMinutes * 60,
        }),
        { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    return new Response(
      JSON.stringify({ 
        allowed: true, 
        remaining: config.maxRequests - requestCount,
        reset_at: new Date(now.getTime() + config.windowSeconds * 1000).toISOString(),
      }),
      { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Rate limit check error:', message);
    
    // On error, allow the request (fail open)
    return new Response(
      JSON.stringify({ allowed: true, error: message }),
      { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
