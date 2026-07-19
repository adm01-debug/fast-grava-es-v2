import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { WebhookPayloadSchema, WebhookResponseSchema, validateContract } from "../_shared/contracts.ts";
import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts";

export const handler = async (req: Request): Promise<Response> => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

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
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
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
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { source, event, data } = validation.data;
    const sanitizedData = data;

    // HMAC verification — fail-closed by default.
    // Every webhook source must have a configured secret (WEBHOOK_SECRET_<SOURCE>).
    // Accepting webhooks without signature verification allows forged payloads.
    const secret = Deno.env.get(`WEBHOOK_SECRET_${source.toUpperCase()}`);
    if (!secret) {
      console.error(`No HMAC secret configured for webhook source: ${source}. Rejecting.`);
      return new Response(JSON.stringify({ error: "Webhook source not configured" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

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
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
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

    const responsePayload = {
      ...result,
      source,
      event,
      timestamp: new Date().toISOString()
    };

    const responseValidation = WebhookResponseSchema.safeParse(responsePayload);
    if (!responseValidation.success) {
      console.error("Outgoing webhook response failed contract validation:", responseValidation.error.format());
    }

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook Error:", error instanceof Error ? error.message : String(error));
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
};

if (import.meta.main) {
  serve(handler);
}

async function processBitrix24Webhook(supabase: any, event: string, data: any) {
  console.log(`Bitrix24 event received: ${event}`);

  // Rastreabilidade: registrar tentativa de sincronização. O mapeamento real
  // Bitrix24 → jobs ainda não foi implementado — retornamos `processed: false`
  // para que o emissor não considere o evento como aplicado.
  // The event is only logged here — the Bitrix24 → jobs mapping is not applied
  // yet — so record it as 'partial', not 'success', or the sync-history UI would
  // show logging-only events as completed syncs.
  const { error: logError } = await supabase.from("bitrix24_sync_history").insert({
    sync_type: 'webhook',
    status: 'partial',
    triggered_by: 'webhook',
    error_message: 'logged_only: Bitrix24 → jobs mapping not yet implemented',
    details: { event, data },
    completed_at: new Date().toISOString(),
  });
  if (logError) {
    console.error("Failed to log Bitrix24 webhook to sync history:", logError.message);
  }

  return {
    source: "bitrix24",
    event,
    processed: false,
    status: 'logged_only',
    detail: 'Bitrix24 → jobs mapping not yet implemented',
    timestamp: new Date().toISOString(),
  };
}

async function processStripeWebhook(supabase: any, event: string, data: any) {
  console.log(`Stripe event received: ${event}`);

  // Handler real de Stripe ainda não implementado.
  return {
    source: "stripe",
    event,
    processed: false,
    status: 'logged_only',
    detail: event === 'checkout.session.completed'
      ? 'Stripe checkout handler not yet implemented'
      : 'No handler for this Stripe event',
    timestamp: new Date().toISOString(),
  };
}
