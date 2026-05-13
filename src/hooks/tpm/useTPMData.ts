import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { categorizeError, createAppError } from '@/lib/errorHandling';
import { defaultQueryOptions, STALE_TIMES } from '@/lib/queryConfig';
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
          const appError = createAppError(error, TPM_ERROR_CONTEXT.types);
          if (import.meta.env.DEV) 
          throw error;
        }
        return data as MaintenanceType[];
      } catch (err) {
        if (import.meta.env.DEV) 
        throw err;
      }
    },
    staleTime: STALE_TIMES.STATIC,
    ...defaultQueryOptions,
  });

  // Fetch schedules with machine info
  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ['maintenance-schedules'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('maintenance_schedules')
          .select('*, machines(id, name, code, technique_id), maintenance_types(*)')
          .eq('is_active', true)
          .order('next_due_at');
        if (error) {
          const appError = createAppError(error, TPM_ERROR_CONTEXT.schedules);
          if (import.meta.env.DEV) 
          throw error;
        }
        return data.map((s: Record<string, unknown>) => ({
          ...s,
          machine: s.machines,
          maintenance_type: s.maintenance_types,
        })) as MaintenanceSchedule[];
      } catch (err) {
        if (import.meta.env.DEV) 
        throw err;
      }
    },
    staleTime: STALE_TIMES.DYNAMIC,
    ...defaultQueryOptions,
  });

  // Fetch checklists
  const { data: checklists = [], isLoading: loadingChecklists } = useQuery({
    queryKey: ['maintenance-checklists'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('maintenance_checklists')
          .select('*, maintenance_checklist_items(*)')
          .eq('is_active', true)
          .order('name');
        if (error) {
          const appError = createAppError(error, TPM_ERROR_CONTEXT.checklists);
          if (import.meta.env.DEV) 
          throw error;
        }
        return data.map((c: Record<string, unknown>) => ({
          ...c,
          items: c.maintenance_checklist_items || [],
        })) as MaintenanceChecklist[];
      } catch (err) {
        if (import.meta.env.DEV) 
        throw err;
      }
    },
    staleTime: STALE_TIMES.STATIC,
    ...defaultQueryOptions,
  });

  // Fetch maintenance records
  const { data: records = [], isLoading: loadingRecords } = useQuery({
    queryKey: ['maintenance-records'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('maintenance_records')
          .select('*, machines(id, name, code, technique_id)')
          .order('started_at', { ascending: false })
          .limit(200);
        if (error) {
          const appError = createAppError(error, TPM_ERROR_CONTEXT.records);
          if (import.meta.env.DEV) 
          throw error;
        }
        return data.map((r: Record<string, unknown>) => ({
          ...r,
          machine: r.machines,
        })) as MaintenanceRecord[];
      } catch (err) {
        if (import.meta.env.DEV) 
        throw err;
      }
    },
    staleTime: STALE_TIMES.DYNAMIC,
    ...defaultQueryOptions,
  });

  // Fetch record details function
  const fetchRecordDetails = async (recordId: string) => {
    try {
      const { data: record, error: recordError } = await supabase
        .from('maintenance_records')
        .select('*, machines(id, name, code, technique_id), maintenance_types(*)')
        .eq('id', recordId)
        .single();
      
      if (recordError) throw recordError;

      const { data: responses, error: responsesError } = await supabase
        .from('maintenance_item_responses')
        .select('*, maintenance_checklist_items(*)')
        .eq('record_id', recordId);
      
      if (responsesError) throw responsesError;

      const { data: parts, error: partsError } = await supabase
        .from('tpm_execution_parts')
        .select('*')
        .eq('execution_id', recordId);
      
      if (partsError) throw partsError;

      const { data: supplies, error: suppliesError } = await supabase
        .from('tpm_execution_supplies')
        .select('*')
        .eq('execution_id', recordId);
      
      if (suppliesError) throw suppliesError;

      const { data: executionAlerts, error: alertsError } = await supabase
        .from('tpm_execution_alerts')
        .select('*')
        .eq('execution_id', recordId);
      
      if (alertsError) throw alertsError;

      const { data: technicalSheet, error: sheetError } = record.technical_sheet_id 
        ? await supabase.from('technical_sheets').select('*, techniques(*), product_categories(*), machines(*)').eq('id', record.technical_sheet_id).single()
        : { data: null, error: null };

      return {
        ...record,
        machine: record.machines,
        maintenance_type: record.maintenance_types,
        technical_sheet: technicalSheet,
        responses: responses.map((r: unknown) => ({
          ...r,
          item: r.maintenance_checklist_items
        })),
        parts,
        supplies_used: supplies,
        execution_alerts: executionAlerts
      };
    } catch (err) {
      if (import.meta.env.DEV) 
      throw err;
    }
  };

  // Fetch alerts
  const { data: alerts = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ['maintenance-alerts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
        .from('maintenance_alerts')
        .select('*, machines(id, name, code, technique_id)')
        .eq('is_resolved', false)
          .order('created_at', { ascending: false });
        if (error) {
          const appError = createAppError(error, TPM_ERROR_CONTEXT.alerts);
          if (import.meta.env.DEV) 
          throw error;
        }
        return data.map((a: Record<string, unknown>) => ({
          ...a,
          machine: a.machines,
        })) as MaintenanceAlert[];
      } catch (err) {
        if (import.meta.env.DEV) 
        throw err;
      }
    },
    staleTime: STALE_TIMES.DYNAMIC,
    ...defaultQueryOptions,
  });

  // Fetch machines
  const { data: machines = [] } = useQuery({
    queryKey: ['machines-for-tpm'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('machines')
          .select('*')
          .eq('is_active', true)
          .order('name');
        if (error) {
          const appError = createAppError(error, TPM_ERROR_CONTEXT.machines);
          if (import.meta.env.DEV) 
          throw error;
        }
        return data;
      } catch (err) {
        if (import.meta.env.DEV) 
        throw err;
      }
    },
    staleTime: STALE_TIMES.STATIC,
    ...defaultQueryOptions,
  });

  return {
    maintenanceTypes,
    schedules,
    checklists,
    records,
    alerts,
    machines,
    isLoading: loadingTypes || loadingSchedules || loadingChecklists || loadingRecords || loadingAlerts,
    fetchRecordDetails,
  };
}
