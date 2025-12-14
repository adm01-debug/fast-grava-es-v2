import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useEffect } from "react";
import { showErrorToast, createAppError, createMutationErrorHandler } from '@/lib/errorHandling';

const EFFICIENCY_ALERTS_CONTEXT = {
  fetch: { entity: 'efficiency_alert_history', operation: 'fetch' },
  count: { entity: 'efficiency_alert_history', operation: 'count' },
  record: { entity: 'efficiency_alert_history', operation: 'record' },
  resolve: { entity: 'efficiency_alert_history', operation: 'resolve' },
};

export interface EfficiencyAlertHistory {
  id: string;
  alert_type: 'bottleneck' | 'load_balancing';
  severity: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  technique_id?: string;
  machine_id?: string;
  detected_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  metadata?: Json;
  created_at: string;
}

export const useEfficiencyAlertHistory = (options?: { limit?: number; offset?: number }) => {
  const queryClient = useQueryClient();
  const limit = options?.limit ?? 100;
  const offset = options?.offset ?? 0;

  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ['efficiency-alert-history', limit, offset],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('efficiency_alert_history')
          .select('*')
          .order('detected_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;
        return data as EfficiencyAlertHistory[];
      } catch (error) {
        const appError = createAppError(error, EFFICIENCY_ALERTS_CONTEXT.fetch);
        if (import.meta.env.DEV) console.error('[useEfficiencyAlertHistory]', appError);
        throw error;
      }
    }
  });

  // Fetch total count for pagination
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['efficiency-alert-history-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('efficiency_alert_history')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return count ?? 0;
      } catch (error) {
        const appError = createAppError(error, EFFICIENCY_ALERTS_CONTEXT.count);
        if (import.meta.env.DEV) console.error('[useEfficiencyAlertHistory:count]', appError);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('efficiency-alert-history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'efficiency_alert_history'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['efficiency-alert-history'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const recordAlert = useMutation({
    mutationFn: async (alert: Omit<EfficiencyAlertHistory, 'id' | 'created_at' | 'detected_at'>) => {
      try {
        const { data, error } = await supabase
          .from('efficiency_alert_history')
          .insert([{
            alert_type: alert.alert_type,
            severity: alert.severity,
            title: alert.title,
            description: alert.description,
            technique_id: alert.technique_id,
            machine_id: alert.machine_id,
            metadata: (alert.metadata || {}) as Json
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        const appError = createAppError(error, EFFICIENCY_ALERTS_CONTEXT.record);
        if (import.meta.env.DEV) console.error('[recordAlert]', appError);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['efficiency-alert-history'] });
    },
    onError: createMutationErrorHandler('Erro ao registrar alerta'),
  });

  const resolveAlert = useMutation({
    mutationFn: async ({ 
      alertId, 
      resolution_notes 
    }: { 
      alertId: string; 
      resolution_notes?: string;
    }) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('efficiency_alert_history')
          .update({
            resolved_at: new Date().toISOString(),
            resolved_by: user?.id,
            resolution_notes
          })
          .eq('id', alertId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        const appError = createAppError(error, EFFICIENCY_ALERTS_CONTEXT.resolve);
        if (import.meta.env.DEV) console.error('[resolveAlert]', appError);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['efficiency-alert-history'] });
    },
    onError: createMutationErrorHandler('Erro ao resolver alerta'),
  });

  const activeAlerts = alerts.filter(a => !a.resolved_at);
  const resolvedAlerts = alerts.filter(a => a.resolved_at);

  return {
    alerts,
    activeAlerts,
    resolvedAlerts,
    isLoading,
    recordAlert,
    resolveAlert,
    refetch,
    totalCount,
    hasMore: offset + limit < totalCount,
  };
};
