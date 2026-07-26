import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

/**
 * Histórico de saúde das rotinas automáticas (`public.cron_health_history`).
 * Alimentado a cada 15 min por `public.snapshot_cron_health()` e legível
 * apenas por coordenadores/gestores (RLS).
 */
export const cronHealthHistoryRowSchema = z.object({
  id: z.string(),
  jobid: z.number(),
  jobname: z.string().nullable(),
  consecutive_failures: z.number().nullable(),
  last_status: z.string().nullable(),
  last_duration_ms: z.number().nullable(),
  captured_at: z.string(),
  is_stale: z.boolean().nullable().optional(),
  expected_interval_minutes: z.number().nullable().optional(),
});

export type CronHealthHistoryRow = z.infer<typeof cronHealthHistoryRowSchema>;

export interface CronHealthTrend {
  jobid: number;
  jobname: string;
  points: Array<{ capturedAt: string; failures: number; durationMs: number | null }>;
  failureRatePct: number;
  avgDurationMs: number | null;
  worstFailures: number;
  /** Rotina sem execução dentro do intervalo esperado na coleta mais recente. */
  isStale: boolean;
  expectedIntervalMinutes: number | null;
}


export function useCronHealthHistory(days = 7) {
  return useQuery<CronHealthTrend[]>({
    queryKey: ["cron-health-history", days],
    refetchInterval: 300_000,
    retry: false,
    queryFn: async () => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("cron_health_history")
        .select("id, jobid, jobname, consecutive_failures, last_status, last_duration_ms, captured_at")
        .gte("captured_at", since)
        .order("captured_at", { ascending: true })
        .limit(2000);

      if (error) throw new Error(error.message);

      const parsed = z.array(cronHealthHistoryRowSchema).safeParse(data ?? []);
      if (!parsed.success) return [];

      const byJob = new Map<number, CronHealthHistoryRow[]>();
      for (const row of parsed.data) {
        const list = byJob.get(row.jobid) ?? [];
        list.push(row);
        byJob.set(row.jobid, list);
      }

      return Array.from(byJob.entries())
        .map(([jobid, rows]) => {
          const durations = rows
            .map((r) => r.last_duration_ms)
            .filter((d): d is number => typeof d === "number");
          const failedSamples = rows.filter((r) => (r.consecutive_failures ?? 0) > 0).length;

          return {
            jobid,
            jobname: rows[rows.length - 1]?.jobname ?? `job ${jobid}`,
            points: rows.map((r) => ({
              capturedAt: r.captured_at,
              failures: r.consecutive_failures ?? 0,
              durationMs: r.last_duration_ms,
            })),
            failureRatePct: rows.length > 0 ? (failedSamples / rows.length) * 100 : 0,
            avgDurationMs:
              durations.length > 0
                ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
                : null,
            worstFailures: rows.reduce((max, r) => Math.max(max, r.consecutive_failures ?? 0), 0),
            isStale: rows[rows.length - 1]?.is_stale === true,
            expectedIntervalMinutes: rows[rows.length - 1]?.expected_interval_minutes ?? null,
          };

        })
        .sort((a, b) => b.failureRatePct - a.failureRatePct);
    },
  });
}
