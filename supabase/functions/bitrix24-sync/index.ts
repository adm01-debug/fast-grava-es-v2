import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BITRIX24_WEBHOOK_URL = Deno.env.get('BITRIX24_WEBHOOK_URL');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface BitrixDeal {
  ID: string;
  TITLE: string;
  STAGE_ID: string;
  UF_CRM_CLIENT?: string;
  UF_CRM_PRODUCT?: string;
  UF_CRM_QUANTITY?: string;
  UF_CRM_TECHNIQUE?: string;
  UF_CRM_PRIORITY?: string;
}

// Map Bitrix24 stages to our system status
const stageToStatus: Record<string, string> = {
  'NEW': 'queue',
  'PREPARATION': 'queue',
  'PREPAID_INVOICE': 'ready',
  'EXECUTING': 'production',
  'FINAL_INVOICE': 'production',
  'WON': 'finished',
  'LOSE': 'cancelled',
  'APOLOGY': 'cancelled'
};

// Map our system status to Bitrix24 stages
const statusToStage: Record<string, string> = {
  'queue': 'NEW',
  'ready': 'PREPAID_INVOICE',
  'scheduled': 'PREPAID_INVOICE',
  'production': 'EXECUTING',
  'finished': 'WON',
  'cancelled': 'LOSE',
  'delayed': 'EXECUTING',
  'paused': 'EXECUTING',
  'rework': 'EXECUTING'
};

async function callBitrix(method: string, params: Record<string, any> = {}) {
  if (!BITRIX24_WEBHOOK_URL) {
    throw new Error('BITRIX24_WEBHOOK_URL not configured');
  }

  const url = `${BITRIX24_WEBHOOK_URL}/${method}`;
  console.log(`Calling Bitrix24: ${method}`, params);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error(`Bitrix24 API error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`Bitrix24 response:`, data);
  return data;
}

// Pull deals from Bitrix24 and sync to our system
async function pullFromBitrix(supabase: any, categoryId?: string) {
  console.log('Pulling deals from Bitrix24...');
  
  const filter: Record<string, any> = {};
  if (categoryId) {
    filter['CATEGORY_ID'] = categoryId;
  }

  const result = await callBitrix('crm.deal.list', {
    filter,
    select: ['ID', 'TITLE', 'STAGE_ID', 'UF_*']
  });

  const deals = result.result || [];
  const synced: string[] = [];
  const errors: string[] = [];

  for (const deal of deals) {
    try {
      // Check if job already exists by order_number (using deal ID as reference)
      const orderNumber = `BTX-${deal.ID}`;
      
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('id, status')
        .eq('order_number', orderNumber)
        .maybeSingle();

      const status = stageToStatus[deal.STAGE_ID] || 'queue';
      
      const jobData = {
        order_number: orderNumber,
        client: deal.UF_CRM_CLIENT || deal.TITLE || 'Cliente Bitrix',
        product: deal.UF_CRM_PRODUCT || deal.TITLE || 'Produto',
        quantity: parseInt(deal.UF_CRM_QUANTITY) || 1,
        technique_id: deal.UF_CRM_TECHNIQUE || 'silk-textile',
        status,
        priority: deal.UF_CRM_PRIORITY || 'medium',
        notes: `Importado do Bitrix24 - Deal ID: ${deal.ID}`
      };

      if (existingJob) {
        // Update existing job if status changed
        if (existingJob.status !== status) {
          await supabase
            .from('jobs')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', existingJob.id);
        }
      } else {
        // Create new job
        await supabase.from('jobs').insert(jobData);
      }

      synced.push(orderNumber);
    } catch (error: any) {
      console.error(`Error syncing deal ${deal.ID}:`, error);
      errors.push(`${deal.ID}: ${error.message}`);
    }
  }

  return { synced, errors, total: deals.length };
}

// Push status update to Bitrix24
async function pushToBitrix(jobId: string, newStatus: string, supabase: any) {
  console.log(`Pushing status update to Bitrix24: ${jobId} -> ${newStatus}`);

  // Get job details
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error || !job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  // Check if this is a Bitrix-synced job
  if (!job.order_number.startsWith('BTX-')) {
    console.log('Not a Bitrix-synced job, skipping push');
    return { skipped: true };
  }

  const dealId = job.order_number.replace('BTX-', '');
  const newStage = statusToStage[newStatus] || 'EXECUTING';

  // Update deal in Bitrix24
  const updateData: Record<string, any> = {
    id: dealId,
    fields: {
      STAGE_ID: newStage
    }
  };

  // Add completion data if finished
  if (newStatus === 'finished') {
    updateData.fields.UF_CRM_PRODUCED_QTY = job.produced_quantity || job.quantity;
    updateData.fields.UF_CRM_LOST_PIECES = job.lost_pieces || 0;
    updateData.fields.UF_CRM_COMPLETED_AT = new Date().toISOString();
  }

  const result = await callBitrix('crm.deal.update', updateData);

  // Log the sync action
  console.log(`Bitrix24 deal ${dealId} updated to stage ${newStage}`);

  return { 
    success: true, 
    dealId, 
    newStage,
    bitrixResult: result 
  };
}

// Webhook handler for Bitrix24 events
async function handleBitrixWebhook(payload: any, supabase: any) {
  console.log('Received Bitrix24 webhook:', payload);

  const event = payload.event;
  const data = payload.data;

  if (event === 'ONCRMDEALUPDATE' || event === 'ONCRMDEALADD') {
    const dealId = data?.FIELDS?.ID;
    if (!dealId) return { error: 'No deal ID in webhook' };

    // Fetch full deal data
    const dealResult = await callBitrix('crm.deal.get', { id: dealId });
    const deal = dealResult.result;

    if (!deal) return { error: 'Deal not found' };

    const orderNumber = `BTX-${dealId}`;
    const status = stageToStatus[deal.STAGE_ID] || 'queue';

    const { data: existingJob } = await supabase
      .from('jobs')
      .select('id')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (existingJob) {
      await supabase
        .from('jobs')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', existingJob.id);
      
      return { updated: orderNumber };
    } else {
      const jobData = {
        order_number: orderNumber,
        client: deal.UF_CRM_CLIENT || deal.TITLE || 'Cliente Bitrix',
        product: deal.UF_CRM_PRODUCT || deal.TITLE || 'Produto',
        quantity: parseInt(deal.UF_CRM_QUANTITY) || 1,
        technique_id: deal.UF_CRM_TECHNIQUE || 'silk-textile',
        status,
        priority: deal.UF_CRM_PRIORITY || 'medium',
        notes: `Importado do Bitrix24 - Deal ID: ${dealId}`
      };

      await supabase.from('jobs').insert(jobData);
      return { created: orderNumber };
    }
  }

  return { ignored: event };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    let result;

    switch (action) {
      case 'pull':
        // Pull deals from Bitrix24
        const categoryId = url.searchParams.get('categoryId') || undefined;
        result = await pullFromBitrix(supabase, categoryId);
        break;

      case 'push':
        // Push status update to Bitrix24
        const body = await req.json();
        result = await pushToBitrix(body.jobId, body.status, supabase);
        break;

      case 'webhook':
        // Handle incoming Bitrix24 webhook
        const webhookPayload = await req.json();
        result = await handleBitrixWebhook(webhookPayload, supabase);
        break;

      case 'test':
        // Test connection
        const testResult = await callBitrix('app.info');
        result = { connected: true, info: testResult.result };
        break;

      default:
        result = { 
          error: 'Invalid action',
          availableActions: ['pull', 'push', 'webhook', 'test']
        };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Bitrix24 sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
