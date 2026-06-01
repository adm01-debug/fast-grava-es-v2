import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    // Guard with a shared secret so only cron infrastructure can trigger this
    const apiKey = Deno.env.get("CRON_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const provided = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    if (provided !== apiKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const results = {
      deletedLogs: 0,
      deletedNotifications: 0,
      deletedSessions: 0,
      archivedJobs: 0,
    };

    // Delete old audit logs (> 90 days)
    const { count: logsCount } = await supabase
      .from("audit_logs")
      .delete()
      .lt("created_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
    results.deletedLogs = logsCount || 0;

    // Delete old notifications (> 30 days)
    const { count: notifsCount } = await supabase
      .from("notifications")
      .delete()
      .eq("read", true)
      .lt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    results.deletedNotifications = notifsCount || 0;

    // Delete expired sessions
    const { count: sessionsCount } = await supabase
      .from("sessions")
      .delete()
      .lt("expires_at", new Date().toISOString());
    results.deletedSessions = sessionsCount || 0;

    // Archive finished jobs older than 6 months
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
    const { data: oldJobs } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "finished")
      .lt("actual_end_time", sixMonthsAgo);

    if (oldJobs?.length) {
      await supabase.from("archived_jobs").insert(oldJobs);
      await supabase.from("jobs").delete().in("id", oldJobs.map((j: any) => j.id));
      results.archivedJobs = oldJobs.length;
    }

    console.log("Cleanup completed:", results);
    return new Response(JSON.stringify({ success: true, results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
