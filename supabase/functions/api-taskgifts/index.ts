import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key from Task Gifts
    const apiKey = req.headers.get('x-api-key');
    const expectedKey = Deno.env.get('TASKGIFTS_API_KEY');
    
    if (!expectedKey) {
      console.log('Warning: TASKGIFTS_API_KEY not configured');
    }
    
    if (expectedKey && apiKey !== expectedKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // GET /api-taskgifts?action=operators - List all operators with stats
    if (req.method === 'GET') {
      const action = url.searchParams.get('action');

      if (action === 'operators') {
        const { data: rankings, error } = await supabase
          .from('operator_rankings')
          .select('*')
          .order('total_points', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true, 
          data: rankings,
          source: 'gravurapro'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'achievements') {
        const { data: achievements, error } = await supabase
          .from('operator_achievements')
          .select('*')
          .order('achieved_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true, 
          data: achievements,
          source: 'gravurapro'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'kpis') {
        // Get production KPIs
        const { data: jobs, error } = await supabase
          .from('jobs')
          .select('status, produced_quantity, lost_pieces')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        const totalProduced = jobs?.reduce((sum, j) => sum + (j.produced_quantity || 0), 0) || 0;
        const totalLost = jobs?.reduce((sum, j) => sum + (j.lost_pieces || 0), 0) || 0;
        const completedJobs = jobs?.filter(j => j.status === 'completed').length || 0;

        return new Response(JSON.stringify({ 
          success: true, 
          data: {
            totalProduced,
            totalLost,
            completedJobs,
            qualityRate: totalProduced > 0 ? ((totalProduced - totalLost) / totalProduced * 100).toFixed(2) : 0,
            period: '30d'
          },
          source: 'gravurapro'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        error: 'Invalid action. Use: operators, achievements, kpis' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /api-taskgifts - Receive webhooks from Task Gifts
    if (req.method === 'POST') {
      const body = await req.json();
      const { event, data } = body;

      console.log('Received webhook from Task Gifts:', event, data);

      switch (event) {
        case 'reward_redeemed':
          // Task Gifts notifica que operador resgatou reward
          console.log(`Operator ${data.operatorId} redeemed reward: ${data.rewardName}`);
          // Aqui você pode atualizar algo no GravuraPro se necessário
          break;

        case 'badge_earned':
          // Task Gifts notifica novo badge
          console.log(`Operator ${data.operatorId} earned badge: ${data.badgeName}`);
          break;

        case 'sync_request':
          // Task Gifts solicita sincronização de dados
          console.log('Sync request received from Task Gifts');
          break;

        default:
          console.log('Unknown event:', event);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        received: event,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in api-taskgifts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
