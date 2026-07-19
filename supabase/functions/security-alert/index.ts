import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { requireCronSecret } from '../_shared/cronAuth.ts';

import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  // Writes to the security_events audit table with the service-role key, so
  // gate it behind CRON_SECRET when configured (prevents forged audit records).
  // Writes to security_events (the audit trail) — fail closed so forged
  // records can't be planted just because CRON_SECRET isn't configured yet.
  const unauthorized = requireCronSecret(req, { failClosed: true, corsHeaders: getCorsHeaders(req) });
  if (unauthorized) return unauthorized;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();

    const { data: event, error } = await supabase
      .from('security_events')
      .insert({
        event_type: payload.event_type,
        severity: payload.severity,
        user_id: payload.user_id,
        user_email: payload.user_email,
        ip_address: payload.ip_address,
        user_agent: payload.user_agent,
        details: payload.details || {},
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, event_id: event.id }),
      { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: unknown) {
    console.error('Error in security-alert:', err instanceof Error ? err.message : err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
