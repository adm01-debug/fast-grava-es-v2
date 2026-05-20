import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  ERPJobRequestSchema, 
  ERPLotRequestSchema,
  validateContract
} from "../_shared/contracts.ts";

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

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: getCorsHeaders(req) });

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const erpIndex = pathParts.indexOf('erp-api');
  const apiPath = erpIndex !== -1 ? pathParts.slice(erpIndex + 1) : pathParts;
  const endpoint = apiPath[0] || '';

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
          }), { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({
          id: crypto.randomUUID(),
          ...validation.data,
          status: 'queue',
          created_at: new Date().toISOString()
        }), { status: 201, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } });
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
          }), { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({
          id: crypto.randomUUID(),
          ...validation.data,
          created_at: new Date().toISOString()
        }), { status: 201, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } });
      }
    }

    return new Response(JSON.stringify({ error: "Not Found" }), { 
      status: 404, 
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), { 
      status: 500, 
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } 
    });
  }
};
