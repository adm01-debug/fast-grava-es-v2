import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireCronSecret } from "../_shared/cronAuth.ts";

serve(async (req) => {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayStartISO = todayStart.toISOString();
    const metrics: Record<string, any> = {};

    // Jobs metrics
    const { count: totalJobs } = await supabase.from("jobs").select("*", { count: "exact", head: true });
    const { count: activeJobs } = await supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "production");
    const { count: completedToday } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "finished")
      .gte("actual_end_time", todayStartISO);

    metrics.jobs = { total: totalJobs, active: activeJobs, completedToday };

    // Operators metrics. The profiles table has no "status" column, so an
    // operator is considered "active" when they scanned a job today.
    const { count: totalOperators } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    const { data: scansToday } = await supabase
      .from("qr_scan_history")
      .select("operator_id")
      .gte("scanned_at", todayStartISO)
      .not("operator_id", "is", null);
    const activeOperators = new Set((scansToday ?? []).map((s: { operator_id: string }) => s.operator_id)).size;

    metrics.operators = { total: totalOperators, active: activeOperators };

    // Machines metrics. The machines table has no "status" column, so a machine
    // is considered "running" when it currently has a job in production.
    const { count: totalMachines } = await supabase
      .from("machines")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);
    const { data: productionJobs } = await supabase
      .from("jobs")
      .select("machine_id")
      .eq("status", "production")
      .not("machine_id", "is", null);
    const runningMachines = new Set((productionJobs ?? []).map((j: { machine_id: string }) => j.machine_id)).size;

    metrics.machines = { total: totalMachines, running: runningMachines };

    // Store metrics
    await supabase.from("system_metrics").insert({
      collected_at: new Date().toISOString(),
      metrics,
    });

    return new Response(JSON.stringify({ success: true, metrics }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
