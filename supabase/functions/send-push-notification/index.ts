import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  Deno.env.get('APP_URL') || 'https://fastgravacoes.com.br',
  'https://xxroejpvloldkmqdydar.lovableproject.com',
].filter(Boolean);

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature, x-api-key',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Vary': 'Origin',
  };
}

interface PushNotificationRequest {
  user_id?: string;
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
  broadcast?: boolean;
}

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id: string;
}

type PushResult = "sent" | "expired" | "failed";

// Web Push implementation using fetch API.
// Returns "expired" ONLY for 404/410 (the push service says the subscription is
// gone). Any other failure (transient 5xx/429, VAPID/key errors, network) is
// "failed" and must NOT cause the subscription to be deleted.
async function sendWebPush(
  subscription: PushSubscription,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<PushResult> {
  try {
    // Create JWT for VAPID
    const header = { alg: "ES256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const audience = new URL(subscription.endpoint).origin;
    
    const claims = {
      aud: audience,
      exp: now + 12 * 60 * 60, // 12 hours
      sub: vapidSubject,
    };

    // Base64url encode
    const base64UrlEncode = (data: string | Uint8Array): string => {
      const base64 = typeof data === "string" 
        ? btoa(data) 
        : btoa(String.fromCharCode(...data));
      return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(claims));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;

    // Import private key and sign
    const privateKeyBuffer = Uint8Array.from(atob(vapidPrivateKey.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
    
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      privateKeyBuffer,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: { name: "SHA-256" } },
      cryptoKey,
      new TextEncoder().encode(unsignedToken)
    );

    const token = `${unsignedToken}.${base64UrlEncode(new Uint8Array(signature))}`;

    // Send push notification
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        "TTL": "86400",
        "Authorization": `vapid t=${token}, k=${vapidPublicKey}`,
      },
      body: new TextEncoder().encode(payload),
    });

    if (response.status === 201 || response.status === 200) {
      console.log(`Push sent successfully to ${subscription.endpoint.substring(0, 50)}...`);
      return "sent";
    } else if (response.status === 410 || response.status === 404) {
      console.log(`Subscription expired: ${subscription.endpoint.substring(0, 50)}...`);
      return "expired";
    } else {
      console.error(`Push failed with status ${response.status}: ${await response.text()}`);
      return "failed";
    }
  } catch (error) {
    console.error("Web Push error:", error);
    return "failed";
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@fastgrava.com";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Require authenticated caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: callerUser } } = await supabaseAuth.auth.getUser();
    if (!callerUser) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const { user_id, title, body, icon, data, broadcast }: PushNotificationRequest = await req.json();

    // Only coordinators/admins can broadcast; operators can only notify themselves
    if (broadcast || (user_id && user_id !== callerUser.id)) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", callerUser.id)
        .single();
      if (!["coordinator", "admin"].includes(roleData?.role ?? "")) {
        return new Response(
          JSON.stringify({ error: "Sem permissão para enviar notificações a outros usuários" }),
          { status: 403, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
        );
      }
    }

    console.log("Sending push notification:", { user_id, title, broadcast });

    // Fetch subscriptions
    let subscriptionsQuery = supabase.from("push_subscriptions").select("*");
    
    if (!broadcast && user_id) {
      subscriptionsQuery = subscriptionsQuery.eq("user_id", user_id);
    }

    const { data: subscriptions, error: subError } = await subscriptionsQuery;

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No subscriptions found");
      return new Response(
        JSON.stringify({ success: true, message: "No subscriptions found", sent: 0 }),
        { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${subscriptions.length} subscriptions`);

    // Create notification record
    const { data: notification, error: notifError } = await supabase
      .from("push_notifications")
      .insert({
        user_id: broadcast ? null : user_id,
        title,
        body,
        icon,
        data,
        status: "sending",
      })
      .select()
      .single();

    if (notifError) {
      console.error("Error creating notification record:", notifError);
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || "/pwa-icons/icon-192x192.png",
      data,
      timestamp: Date.now(),
    });

    // Send to each subscription
    let successCount = 0;
    const expiredEndpoints: string[] = [];

    for (const sub of subscriptions as PushSubscription[]) {
      try {
        if (vapidPublicKey && vapidPrivateKey) {
          const result = await sendWebPush(sub, payload, vapidPublicKey, vapidPrivateKey, vapidSubject);
          if (result === "sent") {
            successCount++;
          } else if (result === "expired") {
            // Only 404/410 means the subscription is truly gone — safe to delete.
            expiredEndpoints.push(sub.endpoint);
          }
          // result === "failed": transient/config error — keep the subscription.
        } else {
          // Fallback: log that push would be sent (VAPID not configured)
          console.log(`[VAPID not configured] Would send to: ${sub.endpoint.substring(0, 50)}...`);
          successCount++;
        }
      } catch (error) {
        console.error(`Error sending to ${sub.endpoint}:`, error);
      }
    }

    // Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      const { error: deleteError } = await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints);

      if (deleteError) {
        console.error("Error deleting expired subscriptions:", deleteError);
      } else {
        console.log(`Deleted ${expiredEndpoints.length} expired subscriptions`);
      }
    }

    // Update notification status
    if (notification) {
      await supabase
        .from("push_notifications")
        .update({
          status: successCount > 0 ? "sent" : "failed",
          sent_at: new Date().toISOString(),
        })
        .eq("id", notification.id);
    }

    console.log(`Push notification sent to ${successCount}/${subscriptions.length} subscribers`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        total: subscriptions.length,
        notification_id: notification?.id,
        vapid_configured: !!(vapidPublicKey && vapidPrivateKey),
      }),
      {
        status: 200,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  }
});
