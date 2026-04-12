import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_FAILED_ATTEMPTS = 5;
const BASE_LOCKOUT_MINUTES = 1; // First lockout: 1 minute

interface LockoutRequest {
  email: string;
  ip_address?: string;
  action: 'check' | 'record_failure' | 'record_success';
}

interface LockoutRecord {
  id: string;
  identifier: string;
  identifier_type: string;
  failed_attempts: number;
  last_failed_at: string | null;
  locked_until: string | null;
  lockout_count: number;
}

// Calculate lockout duration with exponential backoff
function calculateLockoutMinutes(lockoutCount: number): number {
  // 1, 2, 4, 8, 16, 32... minutes (max 24 hours)
  const minutes = BASE_LOCKOUT_MINUTES * Math.pow(2, lockoutCount);
  return Math.min(minutes, 24 * 60); // Max 24 hours
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, ip_address, action }: LockoutRequest = await req.json();

    if (!email || !action) {
      return new Response(
        JSON.stringify({ error: 'Email and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Get current lockout status for email
    const { data: emailLockout, error: emailError } = await supabase
      .from('login_lockouts')
      .select('*')
      .eq('identifier', normalizedEmail)
      .eq('identifier_type', 'email')
      .maybeSingle();

    if (emailError) {
      console.error('Error fetching email lockout:', emailError);
      throw emailError;
    }

    // Get current lockout status for IP (if provided)
    let ipLockout: LockoutRecord | null = null;
    if (ip_address) {
      const { data, error: ipError } = await supabase
        .from('login_lockouts')
        .select('*')
        .eq('identifier', ip_address)
        .eq('identifier_type', 'ip')
        .maybeSingle();
      
      if (ipError) {
        console.error('Error fetching IP lockout:', ipError);
      } else {
        ipLockout = data;
      }
    }

    const now = new Date();

    // CHECK action - verify if account is locked
    if (action === 'check') {
      // Check email lockout
      if (emailLockout?.locked_until) {
        const lockedUntil = new Date(emailLockout.locked_until);
        if (lockedUntil > now) {
          const remainingSeconds = Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000);
          const remainingMinutes = Math.ceil(remainingSeconds / 60);
          
          console.log(`Account ${normalizedEmail} is locked until ${lockedUntil.toISOString()}`);
          
          return new Response(
            JSON.stringify({
              locked: true,
              locked_until: emailLockout.locked_until,
              remaining_seconds: remainingSeconds,
              remaining_minutes: remainingMinutes,
              failed_attempts: emailLockout.failed_attempts,
              message: `Conta bloqueada por ${remainingMinutes} minuto(s) devido a múltiplas tentativas falhas.`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Check IP lockout
      if (ipLockout?.locked_until) {
        const lockedUntil = new Date(ipLockout.locked_until);
        if (lockedUntil > now) {
          const remainingSeconds = Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000);
          const remainingMinutes = Math.ceil(remainingSeconds / 60);
          
          console.log(`IP ${ip_address} is locked until ${lockedUntil.toISOString()}`);
          
          return new Response(
            JSON.stringify({
              locked: true,
              locked_until: ipLockout.locked_until,
              remaining_seconds: remainingSeconds,
              remaining_minutes: remainingMinutes,
              failed_attempts: ipLockout.failed_attempts,
              message: `IP bloqueado por ${remainingMinutes} minuto(s) devido a múltiplas tentativas falhas.`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Not locked
      return new Response(
        JSON.stringify({
          locked: false,
          failed_attempts: emailLockout?.failed_attempts || 0,
          attempts_remaining: MAX_FAILED_ATTEMPTS - (emailLockout?.failed_attempts || 0)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // RECORD_FAILURE action - increment failed attempts
    if (action === 'record_failure') {
      const currentAttempts = (emailLockout?.failed_attempts || 0) + 1;
      const currentLockoutCount = emailLockout?.lockout_count || 0;

      let updateData: Record<string, string | number> = {
        failed_attempts: currentAttempts,
        last_failed_at: now.toISOString(),
      };

      // Check if we should lock the account
      if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockoutMinutes = calculateLockoutMinutes(currentLockoutCount);
        const lockedUntil = new Date(now.getTime() + lockoutMinutes * 60 * 1000);
        
        updateData.locked_until = lockedUntil.toISOString();
        updateData.lockout_count = currentLockoutCount + 1;
        updateData.failed_attempts = 0; // Reset attempts after lockout

        console.log(`Locking account ${normalizedEmail} for ${lockoutMinutes} minutes (lockout #${currentLockoutCount + 1})`);

        // Log security event
        await supabase.from('security_events').insert({
          event_type: 'account_locked',
          user_email: normalizedEmail,
          ip_address: ip_address || '0.0.0.0',
          severity: 'high',
          details: {
            lockout_minutes: lockoutMinutes,
            lockout_count: currentLockoutCount + 1,
            locked_until: lockedUntil.toISOString()
          }
        });
      }

      // Upsert the lockout record
      const { error: upsertError } = await supabase
        .from('login_lockouts')
        .upsert({
          identifier: normalizedEmail,
          identifier_type: 'email',
          ...updateData,
        }, {
          onConflict: 'identifier,identifier_type'
        });

      if (upsertError) {
        console.error('Error upserting lockout:', upsertError);
        throw upsertError;
      }

      // Also track IP failures
      if (ip_address) {
        const ipAttempts = (ipLockout?.failed_attempts || 0) + 1;
        const ipLockoutCount = ipLockout?.lockout_count || 0;

        let ipUpdateData: Record<string, string | number> = {
          failed_attempts: ipAttempts,
          last_failed_at: now.toISOString(),
        };

        if (ipAttempts >= MAX_FAILED_ATTEMPTS * 2) { // More lenient for IP
          const lockoutMinutes = calculateLockoutMinutes(ipLockoutCount);
          const lockedUntil = new Date(now.getTime() + lockoutMinutes * 60 * 1000);
          
          ipUpdateData.locked_until = lockedUntil.toISOString();
          ipUpdateData.lockout_count = ipLockoutCount + 1;
          ipUpdateData.failed_attempts = 0;

          console.log(`Locking IP ${ip_address} for ${lockoutMinutes} minutes`);
        }

        await supabase
          .from('login_lockouts')
          .upsert({
            identifier: ip_address,
            identifier_type: 'ip',
            ...ipUpdateData,
          }, {
            onConflict: 'identifier,identifier_type'
          });
      }

      const isNowLocked = currentAttempts >= MAX_FAILED_ATTEMPTS;
      const lockoutMinutes = isNowLocked ? calculateLockoutMinutes(currentLockoutCount) : 0;

      return new Response(
        JSON.stringify({
          recorded: true,
          failed_attempts: isNowLocked ? 0 : currentAttempts,
          locked: isNowLocked,
          lockout_minutes: lockoutMinutes,
          attempts_remaining: isNowLocked ? 0 : MAX_FAILED_ATTEMPTS - currentAttempts,
          message: isNowLocked 
            ? `Conta bloqueada por ${lockoutMinutes} minuto(s) devido a ${MAX_FAILED_ATTEMPTS} tentativas falhas.`
            : `Tentativa falha. ${MAX_FAILED_ATTEMPTS - currentAttempts} tentativa(s) restante(s).`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // RECORD_SUCCESS action - reset failed attempts
    if (action === 'record_success') {
      if (emailLockout) {
        const { error: updateError } = await supabase
          .from('login_lockouts')
          .update({
            failed_attempts: 0,
            locked_until: null,
            // Keep lockout_count for exponential backoff history
          })
          .eq('identifier', normalizedEmail)
          .eq('identifier_type', 'email');

        if (updateError) {
          console.error('Error resetting lockout:', updateError);
        }
      }

      // Also reset IP on successful login
      if (ip_address && ipLockout) {
        await supabase
          .from('login_lockouts')
          .update({
            failed_attempts: 0,
            locked_until: null,
          })
          .eq('identifier', ip_address)
          .eq('identifier_type', 'ip');
      }

      console.log(`Reset lockout for ${normalizedEmail} after successful login`);

      return new Response(
        JSON.stringify({ reset: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Lockout check error:', error);
    
    // Fail open - don't block login if there's an error
    return new Response(
      JSON.stringify({ locked: false, error: 'Internal error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

