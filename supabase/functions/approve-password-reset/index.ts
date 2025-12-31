import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Verify the requesting user is a coordinator or manager
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user: requestingUser } } = await supabaseClient.auth.getUser()
    if (!requestingUser) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if requesting user is coordinator or manager
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .single()

    if (!roleData || (roleData.role !== 'coordinator' && roleData.role !== 'manager')) {
      return new Response(JSON.stringify({ error: 'Apenas coordenadores e gerentes podem aprovar solicitações' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get reviewer name
    const { data: reviewerProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', requestingUser.id)
      .single()

    const { requestId, action, rejectionReason, redirectUrl } = await req.json()

    if (!requestId || !action) {
      return new Response(JSON.stringify({ error: 'ID da solicitação e ação são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action !== 'approve' && action !== 'reject') {
      return new Response(JSON.stringify({ error: 'Ação inválida' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the request
    const { data: resetRequest, error: fetchError } = await supabaseAdmin
      .from('password_reset_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !resetRequest) {
      console.error('Error fetching request:', fetchError)
      return new Response(JSON.stringify({ error: 'Solicitação não encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (resetRequest.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Solicitação já foi processada' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if expired
    if (new Date(resetRequest.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Solicitação expirada' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Update the request status
    const { error: updateError } = await supabaseAdmin
      .from('password_reset_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: requestingUser.id,
        reviewed_by_name: reviewerProfile?.full_name || requestingUser.email,
        reviewed_at: new Date().toISOString(),
        rejection_reason: action === 'reject' ? rejectionReason : null,
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating request:', updateError)
      return new Response(JSON.stringify({ error: 'Erro ao atualizar solicitação' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // If approved, send the password reset email
    if (action === 'approve') {
      const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
        resetRequest.user_email,
        {
          redirectTo: redirectUrl || `${supabaseUrl.replace('.supabase.co', '')}/reset-password`,
        }
      )

      if (resetError) {
        console.error('Error sending reset email:', resetError)
        return new Response(JSON.stringify({ error: 'Erro ao enviar email de redefinição' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      console.log(`Password reset email sent to ${resetRequest.user_email} after approval by ${reviewerProfile?.full_name}`)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: action === 'approve' 
        ? 'Solicitação aprovada. Email de redefinição enviado.' 
        : 'Solicitação rejeitada.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
