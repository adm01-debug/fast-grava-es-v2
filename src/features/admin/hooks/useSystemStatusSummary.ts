import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

/**
 * Resumo agregado da saúde do sistema (`public.get_system_status_summary`).
 * Função SECURITY DEFINER que exige apenas um papel ativo — devolve somente
 * números, nunca mensagens de erro ou detalhes internos das rotinas.
 */
export const systemStatusSummarySchema = z.object({
  total_jobs: z.number(),
  healthy_jobs: z.number(),
  failing_jobs: z.number(),
  stale_jobs: z.number(),
  last_capture: z.string().nullable(),
});

export type SystemStatusSummary = z.infer<typeof systemStatusSummarySchema>;

export type OverallStatus = "operational" | "degraded" | "outage" | "unknown";

/** Deriva o estado global a partir dos agregados (regra única, testável). */
export function deriveOverallStatus(summary: SystemStatusSummary | null): OverallStatus {
  if (!summary || summary.total_jobs === 0) return "unknown";
  if (summary.failing_jobs > 0) return "outage";
  if (summary.stale_jobs > 0) return "degraded";
  return "operational";
}

export function useSystemStatusSummary() {
  return useQuery<SystemStatusSummary | null>({
    queryKey: ["system-status-summary"],
    refetchInterval: 120_000,
    retry: false,
    queryFn: async () => {
      const { data, error } = await (
        supabase.rpc as unknown as (
          fn: string,
        ) => Promise<{ data: unknown; error: { message: string } | null }>
      )("get_system_status_summary");

      if (error) throw new Error(error.message);

      const parsed = z.array(systemStatusSummarySchema).safeParse(data ?? []);
      if (!parsed.success || parsed.data.length === 0) return null;
      return parsed.data[0];
    },
  });
}
