import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

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
    return new Response(null, { headers: getCorsHeaders(req) })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Verify the requesting user is a coordinator
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user: requestingUser } } = await supabaseClient.auth.getUser()
    if (!requestingUser) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    // Check if requesting user is coordinator/admin. Fetch all role rows: a
    // user may have more than one, and .single() would error in that case.
    const { data: roleRows, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .eq('is_active', true)

    if (roleError) {
      // Backend failure must not be reported as an authorization denial.
      return new Response(JSON.stringify({ error: 'Falha ao verificar permissão' }), {
        status: 500,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    const requesterRoles = (roleRows ?? []).map((r: { role: string }) => r.role)
    if (!requesterRoles.some((role) => ['coordinator', 'admin'].includes(role))) {
      return new Response(JSON.stringify({ error: 'Apenas coordenadores e administradores podem criar operadores' }), {
        status: 403,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    const { email, password, full_name, phone } = await req.json()

    if (!email || !password || !full_name) {
      return new Response(JSON.stringify({ error: 'Email, senha e nome são obrigatórios' }), {
        status: 400,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Formato de email inválido' }), {
        status: 400,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    // Minimum password length
    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'A senha deve ter no mínimo 8 caracteres' }), {
        status: 400,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    // Create user with admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    // Update profile with phone if provided
    if (phone && newUser.user) {
      await supabaseAdmin
        .from('profiles')
        .update({ phone })
        .eq('id', newUser.user.id)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: { id: newUser.user?.id, email: newUser.user?.email } 
    }), {
      status: 200,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})