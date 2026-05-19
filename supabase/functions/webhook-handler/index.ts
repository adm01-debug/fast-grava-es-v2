import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { WebhookPayloadSchema, WebhookResponseSchema, validateContract } from "../_shared/contracts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-signature",
};

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const signature = req.headers.get("x-webhook-signature");
    const bodyText = await req.text();
    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validation = await validateContract(WebhookPayloadSchema, payload);
    
    if (!validation.success) {
      console.warn("Received webhook failed contract validation:", validation.details);
      return new Response(JSON.stringify({ 
        error: validation.error, 
        details: validation.details 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { source, event, data } = validation.data;
    const sanitizedData = data;

    // HMAC verification for security (Always use production keys if available)
    const secret = Deno.env.get(`WEBHOOK_SECRET_${source.toUpperCase()}`);
    if (secret) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      );
      
      const sigBuffer = new Uint8Array(
        signature?.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
      );
      
      const isValid = await crypto.subtle.verify(
        "HMAC",
        key,
        sigBuffer,
        encoder.encode(bodyText)
      );

      if (!isValid) {
        console.error(`Invalid signature for source: ${source}`);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (Deno.env.get("ENFORCE_WEBHOOK_SIGNATURES") === "true") {
       console.error(`Missing secret for source: ${source}`);
       return new Response(JSON.stringify({ error: "Security enforcement active: missing secret" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Log webhook
    const { error: logError } = await supabase.from("webhook_logs").insert({
      source,
      event,
      payload: sanitizedData,
      created_at: new Date().toISOString(),
    });

    if (logError) {
      console.error("Error logging webhook:", logError);
    }

    // Process based on source
    let result = { processed: true };

    switch (source) {
      case "bitrix24":
        result = await processBitrix24Webhook(supabase, event, sanitizedData);
        break;
      case "stripe":
        result = await processStripeWebhook(supabase, event, sanitizedData);
        break;
      default:
        console.log(`Unknown webhook source: ${source}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Webhook Error:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

if (import.meta.main) {
  serve(handler);
}

async function processBitrix24Webhook(supabase: any, event: string, data: any) {
  console.log(`Processing Bitrix24 event: ${event}`);
  
  // Rastreabilidade: registrar tentativa de sincronização
  await supabase.from("bitrix24_sync_history").insert({
    event_type: event,
    payload: data,
    status: 'received',
    sync_date: new Date().toISOString()
  });

  // TODO: Implementar mapeamento dinâmico de campos Bitrix24 -> Hyper-Logistics
  return { source: "bitrix24", event, processed: true, timestamp: new Date().toISOString() };
}

async function processStripeWebhook(supabase: any, event: string, data: any) {
  console.log(`Processing Stripe event: ${event}`);
  
  if (event === 'checkout.session.completed') {
    // Lógica para liberar créditos ou funcionalidades Pro
    console.log("Stripe Checkout Completed - Processing billing update");
  }

  return { source: "stripe", event, processed: true, timestamp: new Date().toISOString() };
}
