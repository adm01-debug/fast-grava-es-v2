import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Cleanup error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
