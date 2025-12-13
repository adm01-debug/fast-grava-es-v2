import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

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

export const useEfficiencyAlertHistory = () => {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['efficiency-alert-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('efficiency_alert_history')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as EfficiencyAlertHistory[];
    }
  });

  const recordAlert = useMutation({
    mutationFn: async (alert: Omit<EfficiencyAlertHistory, 'id' | 'created_at' | 'detected_at'>) => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['efficiency-alert-history'] });
    }
  });

  const resolveAlert = useMutation({
    mutationFn: async ({ 
      alertId, 
      resolution_notes 
    }: { 
      alertId: string; 
      resolution_notes?: string;
    }) => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['efficiency-alert-history'] });
    }
  });

  const activeAlerts = alerts.filter(a => !a.resolved_at);
  const resolvedAlerts = alerts.filter(a => a.resolved_at);

  return {
    alerts,
    activeAlerts,
    resolvedAlerts,
    isLoading,
    recordAlert,
    resolveAlert
  };
};
