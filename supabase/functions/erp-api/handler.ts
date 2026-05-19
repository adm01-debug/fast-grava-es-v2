import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  ERPJobRequestSchema, 
  ERPJobResponseSchema, 
  ERPLotRequestSchema,
  validateContract
} from "../_shared/contracts.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const erpIndex = pathParts.indexOf('erp-api');
  const apiPath = erpIndex !== -1 ? pathParts.slice(erpIndex + 1) : pathParts;
  const endpoint = apiPath[0] || '';
  const resourceId = apiPath[1];

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  try {
    if (endpoint === 'jobs') {
      if (req.method === 'POST') {
        const body = await req.json();
        const validation = await validateContract(ERPJobRequestSchema, body);
        
        if (!validation.success) {
          return new Response(JSON.stringify({ 
            error: validation.error, 
            details: validation.details 
          }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Mocking database insertion for testing if in test mode or just forwarding
        // In actual function, it performs DB operations
        return new Response(JSON.stringify({
          id: crypto.randomUUID(),
          ...validation.data,
          status: 'queue',
          created_at: new Date().toISOString()
        }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    
    if (endpoint === 'lots') {
      if (req.method === 'POST') {
        const body = await req.json();
        const validation = await validateContract(ERPLotRequestSchema, body);
        
        if (!validation.success) {
          return new Response(JSON.stringify({ 
            error: validation.error, 
            details: validation.details 
          }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({
          id: crypto.randomUUID(),
          ...validation.data,
          created_at: new Date().toISOString()
        }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    return new Response(JSON.stringify({ error: "Not Found" }), { 
      status: 404, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
};
