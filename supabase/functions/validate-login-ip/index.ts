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
  user_agent?: string;
  action: 'login_attempt' | 'login_success' | 'login_failed' | 'mfa_required' | 'mfa_failed' | 'mfa_success';
  failure_reason?: string;
}

// IPv4-only general-prefix CIDR match (any /0-/32, not just /8, /16, /24).
function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => Number.isNaN(p) || p < 0 || p > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function ipMatchesCidr(ip: string, cidr: string): boolean {
  if (!cidr.includes('/')) return ip === cidr;
  const [network, bitsStr] = cidr.split('/');
  const bits = parseInt(bitsStr, 10);
  const ipInt = ipv4ToInt(ip);
  const networkInt = ipv4ToInt(network);
  if (ipInt === null || networkInt === null || Number.isNaN(bits) || bits < 0 || bits > 32) return false;
  if (bits === 0) return true;
  const mask = (0xffffffff << (32 - bits)) >>> 0;
  return (ipInt & mask) === (networkInt & mask);
}

// The client cannot be trusted to report its own IP — that defeats the whole
// point of an allowlist. Derive it from the platform-set forwarding header.
function getClientIp(req: Request): string | null {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return null;
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

    const { user_id, user_email, user_agent, action, failure_reason }: ValidateIPRequest = await req.json();
    // Server-derived — never trust a client-supplied IP for an allowlist decision.
    const ip_address = getClientIp(req);

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

        const isAllowed = allowedIPs.some(entry => ipMatchesCidr(ip_address, entry.ip_address));

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
