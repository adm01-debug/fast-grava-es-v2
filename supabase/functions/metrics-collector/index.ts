import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date();
    const metrics: Record<string, any> = {};

    // Jobs metrics
    const { count: totalJobs } = await supabase.from("jobs").select("*", { count: "exact", head: true });
    const { count: activeJobs } = await supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "in_progress");
    const { count: completedToday } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("completed_at", new Date(now.setHours(0, 0, 0, 0)).toISOString());

    metrics.jobs = { total: totalJobs, active: activeJobs, completedToday };

    // Operators metrics
    const { count: totalOperators } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    const { count: activeOperators } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "active");

    metrics.operators = { total: totalOperators, active: activeOperators };

    // Machines metrics
    const { count: totalMachines } = await supabase.from("machines").select("*", { count: "exact", head: true });
    const { count: runningMachines } = await supabase.from("machines").select("*", { count: "exact", head: true }).eq("status", "running");

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
