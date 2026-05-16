import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const payload = await req.json();
    
    console.log('[send-loss-risk-alert] Payload received:', payload);
    
    const { record, event_type } = payload;
    
    if (event_type !== 'INSERT' || !record) {
      return new Response(JSON.stringify({ message: 'Ignore non-insert events' }), { status: 200 });
    }

    const alert = record;
    
    // 1. Fetch execution and machine info
    const { data: execution } = await supabase
      .from('tpm_executions')
      .select(`
        *,
        machine:machines(id, name, code)
      `)
      .eq('id', alert.execution_id)
      .single();

    if (!execution) {
      console.error('Execution not found:', alert.execution_id);
      return new Response(JSON.stringify({ error: 'Execution not found' }), { status: 404 });
    }

    const machine = (execution as any).machine;

    // 2. Find users with critical notification enabled
    const { data: subscribers } = await supabase
      .from('user_notification_settings')
      .select('user_id, email_enabled')
      .eq('email_enabled', true);

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ message: 'No email subscribers found' }), { status: 200 });
    }

    // 3. Get subscriber emails
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    const subscriberEmails = subscribers
      .map(s => usersData.users.find(u => u.id === s.user_id)?.email)
      .filter((email): email is string => !!email);

    if (subscriberEmails.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriber emails found' }), { status: 200 });
    }

    // 4. Send email via Resend
    if (resendApiKey) {
      const evidenceHtml = alert.evidence_urls && alert.evidence_urls.length > 0
        ? `<p><strong>Evidências:</strong></p><div style="display: flex; gap: 10px; margin-top: 10px;">
           ${alert.evidence_urls.map((url: string) => `<img src="${url}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;" />`).join('')}
           </div>`
        : '<p><em>Nenhuma foto de evidência anexada.</em></p>';

      const htmlContent = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #fee2e2; border-radius: 8px; border-left: 6px solid #ef4444;">
          <h2 style="color: #ef4444;">⚠️ ALERTA: Risco de Perda Detectado</h2>
          <p>Olá,</p>
          <p>Um novo alerta de risco crítico foi registrado durante a execução de uma manutenção TPM:</p>
          <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Máquina:</strong> ${machine?.name} (${machine?.code})</p>
            <p><strong>Evento:</strong> ${alert.description}</p>
            <p><strong>Valor Registrado:</strong> ${alert.actual_value}</p>
            <p><strong>Range Esperado:</strong> ${alert.expected_range}</p>
            <p><strong>Horário da Ocorrência:</strong> ${new Date(alert.created_at).toLocaleString('pt-BR')}</p>
            <p><strong>Operador:</strong> ${execution.performed_by_name || 'N/A'}</p>
          </div>
          ${evidenceHtml}
          <div style="margin-top: 25px;">
            <a href="${Deno.env.get('PUBLIC_URL') || '#'}/tpm" style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Investigar Ocorrência</a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">52 STÚDIOS DE GRAVAÇÃO - Sistema de Gestão de Produção</p>
        </div>
      `;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Alertas de Risco 52 STÚDIOS DE GRAVAÇÃO <notifications@resend.dev>',
          to: subscriberEmails,
          subject: `🚨 RISCO DE PERDA: ${machine?.code} - ${alert.parameter_name || 'Parâmetro'} fora do range`,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to send email: ${error}`);
      }
    }

    return new Response(JSON.stringify({ success: true, notified: subscriberEmails.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('[send-loss-risk-alert] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
