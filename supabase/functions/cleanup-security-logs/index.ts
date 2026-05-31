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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const apiKey = Deno.env.get('CRON_API_KEY');
    if (apiKey) {
      const provided = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
      if (provided !== apiKey) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('Starting security logs cleanup...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Clean up old rate limit logs
    const { error: rateLimitError } = await supabase
      .from('rate_limit_logs')
      .delete()
      .lt('created_at', sevenDaysAgo.toISOString());

    if (rateLimitError) console.error('Error cleaning rate limit logs:', rateLimitError);

    // Clean up old security events
    const { error: securityError } = await supabase
      .from('security_events')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (securityError) console.error('Error cleaning security events:', securityError);

    // Clean up old login audit logs
    const { error: loginAuditError } = await supabase
      .from('login_audit')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (loginAuditError) console.error('Error cleaning login audit logs:', loginAuditError);

    // Clean up expired blocked IPs
    const { error: blockedError } = await supabase
      .from('blocked_ips')
      .update({ unblocked_at: now.toISOString() })
      .lt('expires_at', now.toISOString())
      .is('unblocked_at', null)
      .eq('is_permanent', false);

    if (blockedError) console.error('Error cleaning expired blocked IPs:', blockedError);

    console.log('Cleanup completed successfully');

    return new Response(
      JSON.stringify({ success: true, timestamp: now.toISOString() }),
      { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Cleanup error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
