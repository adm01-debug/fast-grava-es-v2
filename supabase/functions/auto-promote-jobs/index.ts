import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BUFFER_TARGET = 3

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseClient = createClient(supabaseUrl, serviceRoleKey)

    // Allow cron invocations (no auth header) OR authenticated coordinator/admin calls
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
        global: { headers: { Authorization: authHeader } },
      })
      const { data: { user } } = await userClient.auth.getUser()
      if (!user) {
        return new Response(JSON.stringify({ error: 'Não autorizado' }), {
          status: 401,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        })
      }
      const { data: roleData } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()
      if (!['coordinator', 'admin'].includes(roleData?.role ?? '')) {
        return new Response(JSON.stringify({ error: 'Sem permissão' }), {
          status: 403,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        })
      }
    }

    console.log('Starting auto-promotion check...')

    // 1. Fetch all techniques
    const { data: techniques, error: techError } = await supabaseClient
      .from('techniques')
      .select('id, name')

    if (techError) throw techError

    const results = []

    for (const technique of techniques) {
      // 2. Count current 'ready' jobs for this technique
      const { count: readyCount, error: countError } = await supabaseClient
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('technique_id', technique.id)
        .eq('status', 'ready')

      if (countError) {
        console.error(`Error counting ready jobs for ${technique.name}:`, countError)
        continue
      }

      const neededCount = Math.max(0, BUFFER_TARGET - (readyCount || 0))

      if (neededCount > 0) {
        // 3. Fetch 'queue' jobs to promote
        // Priority order: urgent (0), high (1), medium (2), low (3)
        // We'll use a CASE statement in the order by if possible, or just fetch and sort in JS
        // Since it's a small number of jobs to promote, fetching first 10-20 and sorting is fine
        const { data: queueJobs, error: queueError } = await supabaseClient
          .from('jobs')
          .select('id, priority, created_at, order_number')
          .eq('technique_id', technique.id)
          .eq('status', 'queue')
          .order('created_at', { ascending: true }) // Default fallback
          .limit(20)

        if (queueError) {
          console.error(`Error fetching queue jobs for ${technique.name}:`, queueError)
          continue
        }

        if (queueJobs && queueJobs.length > 0) {
          // Sort by priority (urgent -> high -> medium -> low)
          const priorityMap: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
          const sortedJobs = queueJobs.sort((a, b) => {
            const pA = priorityMap[a.priority as string] ?? 2
            const pB = priorityMap[b.priority as string] ?? 2
            if (pA !== pB) return pA - pB
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          })

          const jobsToPromote = sortedJobs.slice(0, neededCount)
          const jobIds = jobsToPromote.map(j => j.id)

          if (jobIds.length > 0) {
            const { error: updateError } = await supabaseClient
              .from('jobs')
              .update({ 
                status: 'ready',
                updated_at: new Date().toISOString()
              })
              .in('id', jobIds)

            if (updateError) {
              console.error(`Error promoting jobs for ${technique.name}:`, updateError)
            } else {
              console.log(`Promoted ${jobIds.length} jobs for ${technique.name}`)
              results.push({
                technique: technique.name,
                count: jobIds.length,
                jobs: jobsToPromote.map(j => j.order_number)
              })
            }
          }
        }
      }
    }

    // 4. Stuck Jobs Detection (Bonus Excellence)
    // Find jobs in 'ready' status for more than 4 hours that haven't moved
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    const { data: stuckJobs, error: stuckError } = await supabaseClient
      .from('jobs')
      .select('id, order_number, status, updated_at')
      .eq('status', 'ready')
      .lt('updated_at', fourHoursAgo)

    if (stuckError) {
      console.error('Error checking for stuck jobs:', stuckError)
    } else if (stuckJobs && stuckJobs.length > 0) {
      console.warn(`Detected ${stuckJobs.length} stuck jobs in buffer:`, stuckJobs.map(j => j.order_number))
      // In a real scenario, we might want to alert someone or tag them
      // For now, we'll just log it as excellence in monitoring
    }

    return new Response(JSON.stringify({ 
      success: true, 
      promoted: results,
      stuckDetected: stuckJobs?.length || 0
    }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
