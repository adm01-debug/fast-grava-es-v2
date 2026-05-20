import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

interface ValidateIPRequest {
  user_id?: string;
  user_email: string;
  ip_address?: string;
  user_agent?: string;
  action: 'login_attempt' | 'login_success' | 'login_failed' | 'mfa_required' | 'mfa_failed' | 'mfa_success';
  failure_reason?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, user_email, ip_address, user_agent, action, failure_reason }: ValidateIPRequest = await req.json();

    console.log(`[validate-login-ip] Action: ${action}, Email: ${user_email}, IP: ${ip_address}`);

    // Check if IP allowlist is configured and validate
    let ipBlocked = false;
    let blockReason = '';

    if (ip_address) {
      // Get all active IP entries
      const { data: ipList, error: ipError } = await supabase
        .from('ip_allowlist')
        .select('*')
        .eq('is_active', true);

      if (ipError) {
        console.error('[validate-login-ip] Error fetching IP list:', ipError);
      }

      // If there are IPs in the allowlist, we need to check
      if (ipList && ipList.length > 0) {
        // Check global IPs first
        const globalIPs = ipList.filter(ip => ip.is_global);
        
        // Check user-specific IPs if user_id is provided
        const userIPs = user_id 
          ? ipList.filter(ip => ip.user_id === user_id)
          : [];

        const allowedIPs = [...globalIPs, ...userIPs];

        // Simple IP matching (for exact match or CIDR we'd need more complex logic)
        const isAllowed = allowedIPs.some(entry => {
          const entryIP = entry.ip_address;
          // Handle CIDR notation (simplified - just check prefix)
          if (entryIP.includes('/')) {
            const [network, bits] = entryIP.split('/');
            const networkParts = network.split('.');
            const ipParts = ip_address.split('.');
            const mask = parseInt(bits);
            
            // Simplified CIDR check for common cases
            if (mask === 24) {
              return networkParts.slice(0, 3).join('.') === ipParts.slice(0, 3).join('.');
            } else if (mask === 16) {
              return networkParts.slice(0, 2).join('.') === ipParts.slice(0, 2).join('.');
            } else if (mask === 8) {
              return networkParts[0] === ipParts[0];
            }
          }
          
          // Exact match
          return entryIP === ip_address;
        });

        if (!isAllowed) {
          ipBlocked = true;
          blockReason = `IP ${ip_address} não está na lista de IPs permitidos`;
          console.log(`[validate-login-ip] IP blocked: ${ip_address}`);
        }
      }
    }

    // Map action to login_status
    let loginStatus: string;
    switch (action) {
      case 'login_attempt':
        loginStatus = ipBlocked ? 'blocked_ip' : 'success';
        break;
      case 'login_success':
        loginStatus = 'success';
        break;
      case 'login_failed':
        loginStatus = 'failed';
        break;
      case 'mfa_required':
        loginStatus = 'mfa_required';
        break;
      case 'mfa_failed':
        loginStatus = 'mfa_failed';
        break;
      case 'mfa_success':
        loginStatus = 'success';
        break;
      default:
        loginStatus = 'failed';
    }

    // Override status if IP is blocked
    if (ipBlocked) {
      loginStatus = 'blocked_ip';
    }

    // Record the audit entry
    const { error: auditError } = await supabase
      .from('login_audit')
      .insert({
        user_id: user_id || null,
        user_email,
        ip_address: ip_address || null,
        user_agent: user_agent || null,
        login_status: loginStatus,
        failure_reason: ipBlocked ? blockReason : (failure_reason || null),
      });

    if (auditError) {
      console.error('[validate-login-ip] Error recording audit:', auditError);
    }

    return new Response(
      JSON.stringify({
        allowed: !ipBlocked,
        blocked: ipBlocked,
        reason: ipBlocked ? blockReason : null,
        status: loginStatus,
      }),
      {
        status: 200,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[validate-login-ip] Error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      }
    );
  }
});
