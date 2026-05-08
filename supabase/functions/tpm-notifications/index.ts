import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Iniciando processamento de notificações TPM...')

    // 1. Verificar manutenções que precisam ser notificadas (Regras atuais)
    // Buscamos manutenções pendentes/atrasadas
    const { data: schedules, error: scheduleError } = await supabase
      .from('maintenance_schedules')
      .select(`
        *,
        machine:machines(id, name, code)
      `)
      .eq('is_active', true)

    if (scheduleError) throw scheduleError

    // 2. Processar cada agendamento e verificar regras de severidade
    for (const schedule of schedules) {
      // Lógica de severidade e throttling aqui (simplificada para o exemplo)
      // No mundo real, verificaríamos tpm_severity_configs e tpm_notification_logs
      // para evitar duplicidade e respeitar o throttle.
      
      console.log(`Verificando máquina: ${schedule.machine.code}`)
    }

    // 3. Processar Fila (Retentativas)
    const { data: queueItems, error: queueError } = await supabase
      .from('tpm_notification_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('next_retry_at', new Date().toISOString())
      .lt('retry_count', 3)
      .limit(10)

    if (queueError) throw queueError

    for (const item of queueItems) {
      console.log(`Processando item da fila: ${item.id} (${item.channel})`)
      
      // Simular envio
      try {
        // Aqui chamaria o provedor de Email ou WhatsApp
        await supabase
          .from('tpm_notification_queue')
          .update({ 
            status: 'sent', 
            processed_at: new Date().toISOString() 
          })
          .eq('id', item.id)
          
        // Registrar no log
        await supabase.from('tpm_notification_logs').insert({
          machine_id: item.machine_id,
          channel: item.channel,
          severity: item.severity,
          recipient: item.recipient,
          status: 'success',
          sent_at: new Date().toISOString()
        })
      } catch (e) {
        const nextRetry = new Date()
        nextRetry.setMinutes(nextRetry.getMinutes() + Math.pow(2, item.retry_count + 1)) // Exponential backoff

        await supabase
          .from('tpm_notification_queue')
          .update({ 
            status: 'failed',
            retry_count: item.retry_count + 1,
            next_retry_at: nextRetry.toISOString(),
            error_log: e.message
          })
          .eq('id', item.id)
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: queueItems?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro no processamento TPM:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
