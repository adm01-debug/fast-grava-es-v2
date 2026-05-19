import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  ERPJobRequestSchema, 
  ERPJobResponseSchema, 
  ERPListResponseSchema,
  ERPLotRequestSchema,
  validateContract,
  ErrorResponseSchema
} from "../_shared/contracts.ts";
import { handler } from "./handler.ts";


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// API Documentation
const API_DOCS = {
  version: "1.0.0",
  title: "API de Integração ERP - FAST GRAVAÇÕES",
  description: "API REST para integração com sistemas ERP externos",
  baseUrl: "/functions/v1/erp-api",
  authentication: "Bearer token ou x-api-key header",
  endpoints: [
    {
      method: "GET",
      path: "/jobs",
      description: "Lista todos os jobs de produção",
      params: {
        status: "Filtrar por status (queue, scheduled, in_progress, completed, cancelled)",
        date: "Filtrar por data (YYYY-MM-DD)",
        limit: "Limite de registros (default: 100)",
        offset: "Offset para paginação"
      }
    },
    {
      method: "GET",
      path: "/jobs/:id",
      description: "Busca um job específico por ID"
    },
    {
      method: "POST",
      path: "/jobs",
      description: "Cria um novo job de produção",
      body: {
        order_number: "string (required)",
        client: "string (required)",
        product: "string (required)",
        quantity: "number (required)",
        technique_id: "string (required)",
        priority: "string (low, medium, high, urgent)",
        scheduled_date: "string (YYYY-MM-DD)",
        notes: "string"
      }
    },
    {
      method: "PATCH",
      path: "/jobs/:id",
      description: "Atualiza um job existente"
    },
    {
      method: "GET",
      path: "/machines",
      description: "Lista todas as máquinas"
    },
    {
      method: "GET",
      path: "/operators",
      description: "Lista todos os operadores"
    },
    {
      method: "GET",
      path: "/production/summary",
      description: "Resumo de produção do dia",
      params: {
        date: "Data do resumo (YYYY-MM-DD, default: hoje)"
      }
    },
    {
      method: "GET",
      path: "/lots",
      description: "Lista lotes de produção"
    },
    {
      method: "POST",
      path: "/lots",
      description: "Cria um novo lote"
    },
    {
      method: "GET",
      path: "/kpis",
      description: "Retorna KPIs de produção"
    }
  ]
};

serve(handler);

/*
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
*/


  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // Remove 'functions/v1/erp-api' prefix
  const apiPath = pathParts.slice(pathParts.indexOf('erp-api') + 1);
  const endpoint = apiPath[0] || '';
  const resourceId = apiPath[1];

  console.log(`[ERP-API] ${req.method} /${apiPath.join('/')} - ${new Date().toISOString()}`);

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check authentication (API key or Bearer token)
  const authHeader = req.headers.get('authorization');
  const apiKey = req.headers.get('x-api-key');
  
  // For now, accept service role requests or validate API key
  // In production, implement proper API key validation
  if (!authHeader && !apiKey) {
    // Allow docs endpoint without auth
    if (endpoint !== 'docs' && endpoint !== '') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Missing authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  try {
    // Route handling
    switch (endpoint) {
      case '':
      case 'docs':
        return new Response(
          JSON.stringify(API_DOCS, null, 2),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'jobs':
        return await handleJobs(req, supabase, resourceId, url);

      case 'machines':
        return await handleMachines(req, supabase);

      case 'operators':
        return await handleOperators(req, supabase);

      case 'lots':
        return await handleLots(req, supabase, resourceId, url);

      case 'production':
        if (apiPath[1] === 'summary') {
          return await handleProductionSummary(req, supabase, url);
        }
        break;

      case 'kpis':
        return await handleKPIs(req, supabase, url);

      default:
        return new Response(
          JSON.stringify({ error: 'Not Found', message: `Endpoint /${endpoint} not found` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ERP-API] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Not Found' }),
    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});

async function handleJobs(req: Request, supabase: any, jobId: string | undefined, url: URL) {
  const method = req.method;

  if (method === 'GET') {
    if (jobId) {
      // Get single job
      const { data, error } = await supabase
        .from('jobs')
        .select(`*, machine:machines(name, code), technique:techniques(name)`)
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return jsonResponse(data);
    }

    // List jobs with filters
    const status = url.searchParams.get('status');
    const date = url.searchParams.get('date');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabase
      .from('jobs')
      .select(`*, machine:machines(name, code), technique:techniques(name)`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (date) query = query.eq('scheduled_date', date);

    const { data, error, count } = await query;
    if (error) throw error;

    return jsonResponse({ data, total: count, limit, offset });
  }

  if (method === 'POST') {
    const body = await req.json();
    
    const validation = await validateContract(ERPJobRequestSchema, body);
    if (!validation.success) {
      return jsonResponse({ 
        error: validation.error, 
        message: "Invalid job data",
        details: validation.details 
      }, 400);
    }

    const jobData = validation.data;

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        order_number: jobData.order_number,
        client: jobData.client,
        product: jobData.product,
        quantity: jobData.quantity,
        technique_id: jobData.technique_id,
        priority: jobData.priority,
        scheduled_date: jobData.scheduled_date,
        machine_id: jobData.machine_id,
        notes: jobData.notes,
        status: 'queue'
      })
      .select()
      .single();

    if (error) throw error;
    
    // Validate outgoing response
    const responseValidation = ERPJobResponseSchema.safeParse(data);
    if (!responseValidation.success) {
      console.warn("[ERP-API] Outgoing job response failed validation:", responseValidation.error.format());
    }

    return jsonResponse(data, 201);
  }

  if (method === 'PATCH' && jobId) {
    const body = await req.json();
    const { data, error } = await supabase
      .from('jobs')
      .update(body)
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;
    return jsonResponse(data);
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

async function handleMachines(req: Request, supabase: any) {
  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const { data, error } = await supabase
    .from('machines')
    .select(`*, technique:techniques(name)`)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return jsonResponse(data);
}

async function handleOperators(req: Request, supabase: any) {
  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(`id, full_name, phone, created_at`)
    .order('full_name');

  if (error) throw error;
  return jsonResponse(data);
}

async function handleLots(req: Request, supabase: any, lotId: string | undefined, url: URL) {
  if (req.method === 'GET') {
    if (lotId) {
      const { data, error } = await supabase
        .from('production_lots')
        .select('*')
        .eq('id', lotId)
        .single();

      if (error) throw error;
      return jsonResponse(data);
    }

    const limit = parseInt(url.searchParams.get('limit') || '100');
    const { data, error } = await supabase
      .from('production_lots')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return jsonResponse(data);
  }

  if (req.method === 'POST') {
    const body = await req.json();
    
    const validation = await validateContract(ERPLotRequestSchema, body);
    if (!validation.success) {
      return jsonResponse({ 
        error: validation.error, 
        message: "Invalid lot data",
        details: validation.details 
      }, 400);
    }

    const { data, error } = await supabase
      .from('production_lots')
      .insert(validation.data)
      .select()
      .single();

    if (error) throw error;
    return jsonResponse(data, 201);
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

async function handleProductionSummary(req: Request, supabase: any, url: URL) {
  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('status, quantity, produced_quantity, lost_pieces')
    .eq('scheduled_date', date);

  if (error) throw error;

  const summary = {
    date,
    total_jobs: jobs.length,
    completed: jobs.filter((j: any) => j.status === 'completed').length,
    in_progress: jobs.filter((j: any) => j.status === 'in_progress').length,
    pending: jobs.filter((j: any) => ['queue', 'scheduled'].includes(j.status)).length,
    total_planned: jobs.reduce((sum: number, j: any) => sum + (j.quantity || 0), 0),
    total_produced: jobs.reduce((sum: number, j: any) => sum + (j.produced_quantity || 0), 0),
    total_losses: jobs.reduce((sum: number, j: any) => sum + (j.lost_pieces || 0), 0),
    efficiency: 0
  };

  if (summary.total_planned > 0) {
    summary.efficiency = Math.round((summary.total_produced / summary.total_planned) * 100);
  }

  return jsonResponse(summary);
}

async function handleKPIs(req: Request, supabase: any, url: URL) {
  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const today = new Date().toISOString().split('T')[0];
  
  // Get today's jobs
  const { data: todayJobs } = await supabase
    .from('jobs')
    .select('status, quantity, produced_quantity, lost_pieces, actual_start_time, actual_end_time')
    .eq('scheduled_date', today);

  // Get machines count
  const { count: machinesCount } = await supabase
    .from('machines')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // Get active alerts
  const { count: alertsCount } = await supabase
    .from('spc_alerts')
    .select('*', { count: 'exact', head: true })
    .is('resolved_at', null);

  const jobs = todayJobs || [];
  const totalPlanned = jobs.reduce((sum: number, j: any) => sum + (j.quantity || 0), 0);
  const totalProduced = jobs.reduce((sum: number, j: any) => sum + (j.produced_quantity || 0), 0);
  const totalLosses = jobs.reduce((sum: number, j: any) => sum + (j.lost_pieces || 0), 0);

  return jsonResponse({
    date: today,
    production: {
      jobs_total: jobs.length,
      jobs_completed: jobs.filter((j: any) => j.status === 'completed').length,
      jobs_in_progress: jobs.filter((j: any) => j.status === 'in_progress').length,
      planned_quantity: totalPlanned,
      produced_quantity: totalProduced,
      losses: totalLosses,
      efficiency_percent: totalPlanned > 0 ? Math.round((totalProduced / totalPlanned) * 100) : 0,
      yield_percent: totalProduced > 0 ? Math.round(((totalProduced - totalLosses) / totalProduced) * 100) : 100
    },
    resources: {
      machines_active: machinesCount || 0,
      active_alerts: alertsCount || 0
    }
  });
}

function jsonResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      } 
    }
  );
}
