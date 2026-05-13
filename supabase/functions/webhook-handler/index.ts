import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Removed hmac import due to bundle issues, will use Web Crypto API instead

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const signature = req.headers.get("x-webhook-signature");
    const bodyText = await req.text();
    const payload = JSON.parse(bodyText);
    const { source, event, data } = payload;

    // HMAC verification for security
    const secret = Deno.env.get(`WEBHOOK_SECRET_${source.toUpperCase()}`);
    if (secret) {
      const expectedSignature = hmac("sha256", secret, bodyText, "utf8", "hex");
      if (signature !== expectedSignature) {
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
    await supabase.from("webhook_logs").insert({
      source,
      event,
      payload: data,
      received_at: new Date().toISOString(),
    });

    // Process based on source
    let result = { processed: true };

    switch (source) {
      case "bitrix24":
        result = await processBitrix24Webhook(supabase, event, data);
        break;
      case "stripe":
        result = await processStripeWebhook(supabase, event, data);
        break;
      default:
        console.log(`Unknown webhook source: ${source}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function processBitrix24Webhook(supabase: any, event: string, data: any) {
  console.log(`Processing Bitrix24 event: ${event}`);
  return { source: "bitrix24", event, processed: true };
}

async function processStripeWebhook(supabase: any, event: string, data: any) {
  console.log(`Processing Stripe event: ${event}`);
  return { source: "stripe", event, processed: true };
}
