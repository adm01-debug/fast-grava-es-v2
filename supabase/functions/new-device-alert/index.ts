import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';

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

interface DeviceInfo {
  user_id: string;
  user_email: string;
  user_name?: string;
  device_fingerprint: string;
  ip_address: string;
  user_agent: string;
  browser_name?: string;
  os_name?: string;
  device_type?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }
    const userClient = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: authError } = await userClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const deviceInfo: DeviceInfo = await req.json();

    // Reject if body claims a different user than the authenticated principal
    if (deviceInfo.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    console.log('Checking device for user:', user.id);
    console.log('Device fingerprint:', deviceInfo.device_fingerprint);

    // Verificar se o dispositivo já existe
    const { data: existingDevice, error: deviceError } = await supabase
      .from('user_devices')
      .select('*')
      .eq('user_id', user.id)
      .eq('device_fingerprint', deviceInfo.device_fingerprint)
      .maybeSingle();

    if (deviceError) {
      console.error('Error checking device:', deviceError);
      throw deviceError;
    }

    const now = new Date().toISOString();
    let isNewDevice = false;
    let deviceId: string;

    if (existingDevice) {
      // Dispositivo conhecido - atualizar last_seen_at
      console.log('Known device, updating last_seen_at');
      
      const { error: updateError } = await supabase
        .from('user_devices')
        .update({ 
          last_seen_at: now,
          ip_address: deviceInfo.ip_address,
          user_agent: deviceInfo.user_agent
        })
        .eq('id', existingDevice.id);

      if (updateError) {
        console.error('Error updating device:', updateError);
      }
      
      deviceId = existingDevice.id;
    } else {
      // Novo dispositivo detectado
      console.log('New device detected!');
      isNewDevice = true;

      const { data: newDevice, error: insertError } = await supabase
        .from('user_devices')
        .insert({
          user_id: user.id,
          device_fingerprint: deviceInfo.device_fingerprint,
          ip_address: deviceInfo.ip_address,
          user_agent: deviceInfo.user_agent,
          browser_name: deviceInfo.browser_name,
          os_name: deviceInfo.os_name,
          device_type: deviceInfo.device_type,
          is_trusted: false
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting device:', insertError);
        throw insertError;
      }

      deviceId = newDevice.id;

      // Criar alerta de novo dispositivo
      const { error: alertError } = await supabase
        .from('new_device_alerts')
        .insert({
          user_id: user.id,
          device_id: deviceId,
          ip_address: deviceInfo.ip_address,
          user_agent: deviceInfo.user_agent
        });

      if (alertError) {
        console.error('Error creating alert:', alertError);
      }

      // Enviar email de alerta
      if (resendApiKey && user.email) {
        try {
          const resend = new Resend(resendApiKey);

          const browserInfo = deviceInfo.browser_name || 'Navegador desconhecido';
          const osInfo = deviceInfo.os_name || 'Sistema operacional desconhecido';
          const deviceTypeInfo = deviceInfo.device_type || 'desktop';
          const loginTime = new Date().toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            dateStyle: 'full',
            timeStyle: 'medium'
          });

          const emailResponse = await resend.emails.send({
            from: 'Segurança <onboarding@resend.dev>',
            to: [user.email],
            subject: '⚠️ Novo dispositivo detectado na sua conta',
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header -->
                  <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🔐</div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Alerta de Segurança</h1>
                  </div>
                  
                  <!-- Content -->
                  <div style="padding: 30px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;">
                      Olá${deviceInfo.user_name ? ` ${deviceInfo.user_name}` : ''},
                    </p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                      Detectamos um acesso à sua conta a partir de um <strong>novo dispositivo</strong>. 
                      Se foi você, pode ignorar este email. Caso contrário, recomendamos que altere sua senha imediatamente.
                    </p>
                    
                    <!-- Device Info Box -->
                    <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
                      <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 16px;">📱 Detalhes do Acesso</h3>
                      
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #78716c; font-size: 14px;">Data/Hora:</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${loginTime}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #78716c; font-size: 14px;">Navegador:</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${browserInfo}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #78716c; font-size: 14px;">Sistema:</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${osInfo}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #78716c; font-size: 14px;">Tipo:</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${deviceTypeInfo === 'mobile' ? '📱 Celular' : deviceTypeInfo === 'tablet' ? '📱 Tablet' : '💻 Computador'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #78716c; font-size: 14px;">Endereço IP:</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${deviceInfo.ip_address || 'Não disponível'}</td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Warning -->
                    <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                      <p style="color: #991b1b; margin: 0; font-size: 14px;">
                        <strong>⚠️ Não reconhece este acesso?</strong><br>
                        Altere sua senha imediatamente e revise os dispositivos conectados à sua conta.
                      </p>
                    </div>
                  </div>
                  
                  <!-- Footer -->
                  <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                      Este é um email automático de segurança. Por favor, não responda.
                    </p>
                  </div>
                </div>
              </body>
              </html>
            `,
          });

          console.log('Alert email sent:', emailResponse);

          // Atualizar alerta com status do email
          await supabase
            .from('new_device_alerts')
            .update({
              email_sent: true,
              email_sent_at: now
            })
            .eq('device_id', deviceId)
            .eq('user_id', user.id);

        } catch (emailError) {
          console.error('Error sending alert email:', emailError);
        }
      }

      // Enviar push notification
      try {
        const browserInfo = deviceInfo.browser_name || 'Navegador desconhecido';
        const osInfo = deviceInfo.os_name || 'Sistema desconhecido';
        
        const pushPayload = {
          user_id: user.id,
          title: '🔐 Novo Dispositivo Detectado',
          body: `Login detectado de ${browserInfo} em ${osInfo}. IP: ${deviceInfo.ip_address || 'desconhecido'}`,
          data: { 
            url: '/seguranca',
            type: 'new_device',
            device_id: deviceId
          }
        };

        // Chamar a edge function de push notification
        const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify(pushPayload)
        });

        if (pushResponse.ok) {
          console.log('Push notification sent successfully');
        } else {
          console.log('Push notification skipped or failed:', await pushResponse.text());
        }
      } catch (pushError) {
        console.error('Error sending push notification:', pushError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        is_new_device: isNewDevice,
        device_id: deviceId
      }),
      { 
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in new-device-alert:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { 
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
