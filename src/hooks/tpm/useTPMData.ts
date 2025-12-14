import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { categorizeError } from '@/lib/errorHandling';
import {
  MaintenanceType,
  MaintenanceSchedule,
  MaintenanceChecklist,
  MaintenanceRecord,
  MaintenanceAlert,
  TPM_ERROR_CONTEXT,
} from './types';

export function useTPMData() {
  const queryClient = useQueryClient();

  // Realtime subscriptions for TPM data
  useEffect(() => {
    const schedulesChannel = supabase
      .channel('tpm-schedules-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_schedules' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] });
        }
      )
      .subscribe();

    const recordsChannel = supabase
      .channel('tpm-records-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_records' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
        }
      )
      .subscribe();

    const alertsChannel = supabase
      .channel('tpm-alerts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_alerts' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['maintenance-alerts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(schedulesChannel);
      supabase.removeChannel(recordsChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [queryClient]);

  // Fetch maintenance types
  const { data: maintenanceTypes = [], isLoading: loadingTypes } = useQuery({
    queryKey: ['maintenance-types'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('maintenance_types')
          .select('*')
          .order('name');
        if (error) {
          console.error('[useTPM] maintenance_types fetch failed:', categorizeError(error), error);
          throw error;
        }
        return data as MaintenanceType[];
      } catch (err) {
        console.error('[useTPM] maintenance_types error:', err);
        throw err;
      }
    },
  });

  // Fetch schedules with machine info
  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ['maintenance-schedules'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('maintenance_schedules')
          .select('*, machines(id, name, code), maintenance_types(*)')
          .eq('is_active', true)
          .order('next_due_at');
        if (error) {
          console.error('[useTPM] schedules fetch failed:', categorizeError(error), error);
          throw error;
        }
        return data.map((s: any) => ({
          ...s,
          machine: s.machines,
          maintenance_type: s.maintenance_types,
        })) as MaintenanceSchedule[];
      } catch (err) {
        console.error('[useTPM] schedules error:', err);
        throw err;
      }
    },
  });

  // Fetch checklists
  const { data: checklists = [], isLoading: loadingChecklists } = useQuery({
    queryKey: ['maintenance-checklists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_checklists')
        .select('*, maintenance_checklist_items(*)')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data.map((c: any) => ({
        ...c,
        items: c.maintenance_checklist_items || [],
      })) as MaintenanceChecklist[];
    },
  });

  // Fetch maintenance records
  const { data: records = [], isLoading: loadingRecords } = useQuery({
    queryKey: ['maintenance-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select('*, machines(id, name, code)')
        .order('started_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data.map((r: any) => ({
        ...r,
        machine: r.machines,
      })) as MaintenanceRecord[];
    },
  });

  // Fetch alerts
  const { data: alerts = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ['maintenance-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_alerts')
        .select('*, machines(id, name, code)')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map((a: any) => ({
        ...a,
        machine: a.machines,
      })) as MaintenanceAlert[];
    },
  });

  // Fetch machines
  const { data: machines = [] } = useQuery({
    queryKey: ['machines-for-tpm'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  return {
    maintenanceTypes,
    schedules,
    checklists,
    records,
    alerts,
    machines,
    isLoading: loadingTypes || loadingSchedules || loadingChecklists || loadingRecords || loadingAlerts,
  };
}
