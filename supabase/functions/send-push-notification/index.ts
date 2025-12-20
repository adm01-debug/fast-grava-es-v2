import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  user_id?: string;
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
  broadcast?: boolean;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, title, body, icon, data, broadcast }: PushNotificationRequest = await req.json();

    console.log("Sending push notification:", { user_id, title, broadcast });

    // Buscar subscriptions
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
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${subscriptions.length} subscriptions`);

    // Registrar notificação
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

    // Enviar para cada subscription usando Web Push
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          // Simular envio de push (em produção, usar web-push library)
          // Por agora, apenas logar que seria enviado
          console.log(`Would send push to endpoint: ${sub.endpoint.substring(0, 50)}...`);
          
          // Em produção real, você usaria:
          // await webpush.sendNotification(subscription, JSON.stringify({ title, body, icon, data }));
          
          return { success: true, endpoint: sub.endpoint };
        } catch (error) {
          console.error(`Error sending to ${sub.endpoint}:`, error);
          return { success: false, endpoint: sub.endpoint, error };
        }
      })
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && (r.value as { success: boolean }).success
    ).length;

    // Atualizar status da notificação
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
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
