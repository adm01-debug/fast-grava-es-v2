import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OAuth credentials from environment (initial values)
const BITRIX24_WEBHOOK_URL = Deno.env.get('BITRIX24_WEBHOOK_URL');
const BITRIX24_CLIENT_ID = Deno.env.get('BITRIX24_CLIENT_ID');
const BITRIX24_CLIENT_SECRET = Deno.env.get('BITRIX24_CLIENT_SECRET');
const BITRIX24_ACCESS_TOKEN_ENV = Deno.env.get('BITRIX24_ACCESS_TOKEN');
const BITRIX24_REFRESH_TOKEN_ENV = Deno.env.get('BITRIX24_REFRESH_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Base URL for Bitrix24 REST API
const BITRIX24_DOMAIN = 'https://promobrindes.bitrix24.com.br';

// Token refresh buffer (refresh 5 minutes before expiry)
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

interface OAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: Date;
}

// Get current valid tokens from database or environment
async function getValidTokens(supabase: any): Promise<OAuthTokens | null> {
  // First, check database for stored tokens
  const { data: storedTokens, error } = await supabase
    .from('bitrix24_oauth_tokens')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (storedTokens) {
    const expiresAt = new Date(storedTokens.expires_at);
    const now = new Date();
    
    // Check if token is still valid (with buffer)
    if (expiresAt.getTime() - now.getTime() > TOKEN_REFRESH_BUFFER_MS) {
      console.log('Using stored token, expires at:', expiresAt.toISOString());
      return {
        access_token: storedTokens.access_token,
        refresh_token: storedTokens.refresh_token,
        expires_at: expiresAt
      };
    }
    
    // Token expired or about to expire, try to refresh
    console.log('Stored token expired or expiring soon, refreshing...');
    const refreshed = await refreshAccessToken(storedTokens.refresh_token, supabase);
    if (refreshed) {
      return refreshed;
    }
  }

  // No stored tokens or refresh failed, try environment variables
  if (BITRIX24_ACCESS_TOKEN_ENV && BITRIX24_REFRESH_TOKEN_ENV) {
    console.log('Using environment tokens...');
    // Store initial tokens from environment with 1 hour expiry
    const expiresAt = new Date(Date.now() + 3600 * 1000);
    
    await saveTokens(supabase, {
      access_token: BITRIX24_ACCESS_TOKEN_ENV,
      refresh_token: BITRIX24_REFRESH_TOKEN_ENV,
      expires_at: expiresAt
    });
    
    return {
      access_token: BITRIX24_ACCESS_TOKEN_ENV,
      refresh_token: BITRIX24_REFRESH_TOKEN_ENV,
      expires_at: expiresAt
    };
  }

  return null;
}

// Refresh access token using refresh token
async function refreshAccessToken(refreshToken: string, supabase: any): Promise<OAuthTokens | null> {
  try {
    console.log('Refreshing Bitrix24 access token...');
    
    const refreshUrl = `${BITRIX24_DOMAIN}/oauth/token/?` + new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: BITRIX24_CLIENT_ID || '',
      client_secret: BITRIX24_CLIENT_SECRET || '',
      refresh_token: refreshToken
    });

    const response = await fetch(refreshUrl, { method: 'POST' });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token refresh failed:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('Token refresh error:', data.error, data.error_description);
      return null;
    }

    // Bitrix24 returns expires_in in seconds (usually 3600)
    const expiresIn = data.expires_in || 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const tokens: OAuthTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: expiresAt
    };

    // Save new tokens to database
    await saveTokens(supabase, tokens);
    
    console.log('Token refreshed successfully, expires at:', expiresAt.toISOString());
    return tokens;
  } catch (error) {
    console.error('Token refresh exception:', error);
    return null;
  }
}

// Save tokens to database
async function saveTokens(supabase: any, tokens: OAuthTokens): Promise<void> {
  try {
    // Delete old tokens first
    await supabase.from('bitrix24_oauth_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert new tokens
    const { error } = await supabase.from('bitrix24_oauth_tokens').insert({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at.toISOString()
    });

    if (error) {
      console.error('Error saving tokens:', error);
    } else {
      console.log('Tokens saved to database');
    }
  } catch (error) {
    console.error('Exception saving tokens:', error);
  }
}

interface BitrixDeal {
  ID: string;
  TITLE: string;
  STAGE_ID: string;
  [key: string]: any; // Allow dynamic UF_CRM_* fields
}

// Configurable field mapping - maps Bitrix24 UF_CRM_* fields to our job fields
// These can be customized based on your Bitrix24 configuration
const FIELD_MAPPING = {
  // Job fields <- Bitrix24 UF_CRM_* fields
  client: ['UF_CRM_1702654321_CLIENT', 'UF_CRM_CLIENT', 'UF_CRM_CLIENTE', 'COMPANY_ID'],
  product: ['UF_CRM_1702654321_PRODUCT', 'UF_CRM_PRODUCT', 'UF_CRM_PRODUTO', 'TITLE'],
  quantity: ['UF_CRM_1702654321_QTY', 'UF_CRM_QUANTITY', 'UF_CRM_QUANTIDADE', 'UF_CRM_QTD'],
  technique_id: ['UF_CRM_1702654321_TECHNIQUE', 'UF_CRM_TECHNIQUE', 'UF_CRM_TECNICA', 'UF_CRM_TIPO_GRAVACAO'],
  priority: ['UF_CRM_1702654321_PRIORITY', 'UF_CRM_PRIORITY', 'UF_CRM_PRIORIDADE', 'UF_CRM_URGENCIA'],
  scheduled_date: ['UF_CRM_1702654321_DATE', 'UF_CRM_SCHEDULED_DATE', 'UF_CRM_DATA_AGENDADA', 'UF_CRM_DATA_ENTREGA'],
  gravure_color: ['UF_CRM_1702654321_COLOR', 'UF_CRM_GRAVURE_COLOR', 'UF_CRM_COR_GRAVURA', 'UF_CRM_COR'],
  notes: ['UF_CRM_1702654321_NOTES', 'UF_CRM_NOTES', 'UF_CRM_OBSERVACOES', 'COMMENTS'],
  estimated_duration: ['UF_CRM_1702654321_DURATION', 'UF_CRM_DURATION', 'UF_CRM_TEMPO_ESTIMADO'],
};

// Priority value mapping from Bitrix24 to our system
const PRIORITY_MAPPING: Record<string, string> = {
  'urgente': 'urgent',
  'urgent': 'urgent',
  'alta': 'high',
  'high': 'high',
  'media': 'medium',
  'medium': 'medium',
  'normal': 'medium',
  'baixa': 'low',
  'low': 'low',
};

// Technique ID mapping from Bitrix24 values to our system IDs
const TECHNIQUE_MAPPING: Record<string, string> = {
  'silk_textil': 'silk-textile',
  'silk textil': 'silk-textile',
  'silk têxtil': 'silk-textile',
  'serigrafia_textil': 'silk-textile',
  'silk_vinilico_plano': 'silk-vinyl-flat',
  'silk_vinilico_rotativo': 'silk-vinyl-rotative',
  'silk_decalque': 'silk-decal',
  'fiber_laser': 'fiber-laser',
  'fiber laser': 'fiber-laser',
  'laser_co2': 'laser-co2',
  'laser co2': 'laser-co2',
  'laser_uv': 'laser-uv',
  'laser uv': 'laser-uv',
  'tampografia': 'tampo',
  'tampo': 'tampo',
  'hot_stamping': 'hot-stamp',
  'hot stamping': 'hot-stamp',
  'hot stamp': 'hot-stamp',
  'prensa_termica': 'thermal-press',
  'prensa térmica': 'thermal-press',
  'sublimacao': 'sublimation-mug',
  'sublimação': 'sublimation-mug',
  'sublimacao_caneca': 'sublimation-mug',
  'decalque_forno': 'decal-oven',
  'dtf_textil': 'dtf-textile',
  'dtf têxtil': 'dtf-textile',
  'dtf_uv': 'dtf-uv',
  'dtf uv': 'dtf-uv',
  'dtf_uv_aplicacao': 'dtf-uv-application',
  'corte_midia': 'cut-media',
  'corte mídia': 'cut-media',
};

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

// Helper function to get value from deal using field mapping
function getMappedValue(deal: BitrixDeal, fieldName: keyof typeof FIELD_MAPPING, defaultValue: any = null): any {
  const possibleFields = FIELD_MAPPING[fieldName];
  for (const field of possibleFields) {
    if (deal[field] !== undefined && deal[field] !== null && deal[field] !== '') {
      return deal[field];
    }
  }
  return defaultValue;
}

// Helper to normalize technique value
function normalizeTechnique(value: string | null | undefined): string {
  if (!value) return 'silk-textile';
  const normalized = value.toLowerCase().trim().replace(/\s+/g, '_');
  return TECHNIQUE_MAPPING[normalized] || TECHNIQUE_MAPPING[value.toLowerCase()] || 'silk-textile';
}

// Helper to normalize priority value
function normalizePriority(value: string | null | undefined): string {
  if (!value) return 'medium';
  const normalized = value.toLowerCase().trim();
  return PRIORITY_MAPPING[normalized] || 'medium';
}

async function callBitrix(method: string, params: Record<string, any> = {}, supabase?: any) {
  // Get valid OAuth tokens with automatic refresh
  if (supabase) {
    const tokens = await getValidTokens(supabase);
    if (tokens) {
      const url = `${BITRIX24_DOMAIN}/rest/${method}?auth=${tokens.access_token}`;
      console.log(`Calling Bitrix24 (OAuth with auto-refresh): ${method}`, params);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Bitrix24 API error response:', errorText);
        throw new Error(`Bitrix24 API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Check for expired_token error and try to refresh
      if (data.error === 'expired_token' || data.error === 'invalid_token') {
        console.log('Token expired, attempting refresh...');
        const refreshedTokens = await refreshAccessToken(tokens.refresh_token, supabase);
        if (refreshedTokens) {
          // Retry with new token
          return callBitrix(method, params, supabase);
        }
        throw new Error('Token refresh failed');
      }
      
      if (data.error) {
        console.error('Bitrix24 API error:', data.error, data.error_description);
        throw new Error(`Bitrix24 API error: ${data.error} - ${data.error_description || ''}`);
      }

      console.log(`Bitrix24 response:`, data);
      return data;
    }
  }
  
  // Fallback to webhook URL if no OAuth tokens
  if (BITRIX24_WEBHOOK_URL) {
    const url = `${BITRIX24_WEBHOOK_URL}/${method}`;
    console.log(`Calling Bitrix24 (Webhook): ${method}`, params);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bitrix24 API error response:', errorText);
      throw new Error(`Bitrix24 API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('Bitrix24 API error:', data.error, data.error_description);
      throw new Error(`Bitrix24 API error: ${data.error} - ${data.error_description || ''}`);
    }

    console.log(`Bitrix24 response:`, data);
    return data;
  }
  
  throw new Error('No valid Bitrix24 authentication configured');
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
  }, supabase);

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
      
      // Use configurable field mapping to extract values
      const rawTechnique = getMappedValue(deal, 'technique_id');
      const rawPriority = getMappedValue(deal, 'priority');
      const rawQuantity = getMappedValue(deal, 'quantity');
      const rawDuration = getMappedValue(deal, 'estimated_duration');
      const rawDate = getMappedValue(deal, 'scheduled_date');

      const jobData = {
        order_number: orderNumber,
        client: getMappedValue(deal, 'client', deal.TITLE || 'Cliente Bitrix'),
        product: getMappedValue(deal, 'product', deal.TITLE || 'Produto'),
        quantity: parseInt(rawQuantity) || 1,
        technique_id: normalizeTechnique(rawTechnique),
        status,
        priority: normalizePriority(rawPriority),
        gravure_color: getMappedValue(deal, 'gravure_color'),
        scheduled_date: rawDate ? new Date(rawDate).toISOString().split('T')[0] : null,
        estimated_duration: parseInt(rawDuration) || 60,
        notes: getMappedValue(deal, 'notes', `Importado do Bitrix24 - Deal ID: ${deal.ID}`)
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

  const result = await callBitrix('crm.deal.update', updateData, supabase);

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
    const dealResult = await callBitrix('crm.deal.get', { id: dealId }, supabase);
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
      // Use configurable field mapping to extract values
      const rawTechnique = getMappedValue(deal, 'technique_id');
      const rawPriority = getMappedValue(deal, 'priority');
      const rawQuantity = getMappedValue(deal, 'quantity');
      const rawDuration = getMappedValue(deal, 'estimated_duration');
      const rawDate = getMappedValue(deal, 'scheduled_date');

      const jobData = {
        order_number: orderNumber,
        client: getMappedValue(deal, 'client', deal.TITLE || 'Cliente Bitrix'),
        product: getMappedValue(deal, 'product', deal.TITLE || 'Produto'),
        quantity: parseInt(rawQuantity) || 1,
        technique_id: normalizeTechnique(rawTechnique),
        status,
        priority: normalizePriority(rawPriority),
        gravure_color: getMappedValue(deal, 'gravure_color'),
        scheduled_date: rawDate ? new Date(rawDate).toISOString().split('T')[0] : null,
        estimated_duration: parseInt(rawDuration) || 60,
        notes: getMappedValue(deal, 'notes', `Importado do Bitrix24 - Deal ID: ${dealId}`)
      };

      await supabase.from('jobs').insert(jobData);
      return { created: orderNumber };
    }
  }

  return { ignored: event };
}

// Log sync operation to history
async function logSyncHistory(
  supabase: any,
  syncType: 'pull' | 'push' | 'webhook',
  status: 'success' | 'partial' | 'error',
  jobsSynced: number,
  jobsFailed: number,
  errorMessage: string | null,
  details: any,
  triggeredBy: string
) {
  try {
    await supabase.from('bitrix24_sync_history').insert({
      sync_type: syncType,
      status,
      jobs_synced: jobsSynced,
      jobs_failed: jobsFailed,
      error_message: errorMessage,
      details,
      triggered_by: triggeredBy,
      completed_at: new Date().toISOString()
    });
  } catch (e) {
    console.error('Error logging sync history:', e);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY!
  );

  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const triggeredBy = url.searchParams.get('triggered_by') || 'manual';

  try {
    let result;

    switch (action) {
      case 'pull':
        // Pull deals from Bitrix24
        const categoryId = url.searchParams.get('categoryId') || undefined;
        result = await pullFromBitrix(supabase, categoryId);
        
        // Log the sync
        const pullStatus = result.errors?.length > 0 
          ? (result.synced?.length > 0 ? 'partial' : 'error')
          : 'success';
        await logSyncHistory(
          supabase,
          'pull',
          pullStatus,
          result.synced?.length || 0,
          result.errors?.length || 0,
          result.errors?.join('; ') || null,
          { total: result.total, synced: result.synced },
          triggeredBy
        );
        break;

      case 'push':
        // Push status update to Bitrix24
        const body = await req.json();
        result = await pushToBitrix(body.jobId, body.status, supabase);
        
        if (!result.skipped && result.success !== undefined) {
          await logSyncHistory(
            supabase,
            'push',
            result.success ? 'success' : 'error',
            result.success ? 1 : 0,
            result.success ? 0 : 1,
            null,
            { dealId: result.dealId, newStage: result.newStage },
            'auto'
          );
        }
        break;

      case 'webhook':
        // Handle incoming Bitrix24 webhook
        const webhookPayload = await req.json();
        result = await handleBitrixWebhook(webhookPayload, supabase);
        
        await logSyncHistory(
          supabase,
          'webhook',
          result.error ? 'error' : 'success',
          result.created || result.updated ? 1 : 0,
          result.error ? 1 : 0,
          result.error || null,
          result,
          'bitrix24'
        );
        break;

      case 'test':
        // Test connection
        const testResult = await callBitrix('app.info', {}, supabase);
        result = { connected: true, info: testResult.result };
        break;

      case 'history':
        // Get sync history
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const { data: history, error: historyError } = await supabase
          .from('bitrix24_sync_history')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(limit);
        
        if (historyError) throw historyError;
        result = { history };
        break;

      case 'fields':
        // Get deal custom fields from Bitrix24
        const fieldsResult = await callBitrix('crm.deal.fields', {}, supabase);
        const allFields = fieldsResult.result || {};
        
        // Filter to show only UF_CRM_* fields (custom fields)
        const customFields = Object.entries(allFields)
          .filter(([key]) => key.startsWith('UF_CRM_'))
          .reduce((acc: Record<string, any>, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});
        
        result = { 
          customFields,
          totalCustomFields: Object.keys(customFields).length,
          currentMapping: FIELD_MAPPING,
          techniqueMapping: TECHNIQUE_MAPPING,
          priorityMapping: PRIORITY_MAPPING,
          stageMapping: stageToStatus
        };
        break;

      case 'mapping':
        // Return current field mapping configuration
        result = {
          fieldMapping: FIELD_MAPPING,
          techniqueMapping: TECHNIQUE_MAPPING,
          priorityMapping: PRIORITY_MAPPING,
          stageToStatus,
          statusToStage,
          instructions: {
            pt: 'Para atualizar o mapeamento, edite os valores em FIELD_MAPPING na Edge Function. Cada campo do job pode mapear múltiplos campos UF_CRM_* do Bitrix24, o primeiro encontrado com valor será usado.',
            en: 'To update mapping, edit FIELD_MAPPING values in the Edge Function. Each job field can map to multiple Bitrix24 UF_CRM_* fields, the first one with a value will be used.'
          }
        };
        break;

      default:
        result = { 
          error: 'Invalid action',
          availableActions: ['pull', 'push', 'webhook', 'test', 'history', 'fields', 'mapping']
        };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Bitrix24 sync error:', error);
    
    // Log error to history
    if (action && ['pull', 'push', 'webhook'].includes(action)) {
      await logSyncHistory(
        supabase,
        action as 'pull' | 'push' | 'webhook',
        'error',
        0,
        1,
        error.message,
        { stack: error.stack },
        triggeredBy
      );
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
