import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addDays, differenceInDays, isPast, isToday, isFuture } from 'date-fns';
import { showErrorToast, categorizeError, ErrorCodes } from '@/lib/errorHandling';

// Error context for debugging
const TPM_ERROR_CONTEXT = {
  types: { hook: 'useTPM', entity: 'maintenance_types' },
  schedules: { hook: 'useTPM', entity: 'maintenance_schedules' },
  checklists: { hook: 'useTPM', entity: 'maintenance_checklists' },
  records: { hook: 'useTPM', entity: 'maintenance_records' },
  alerts: { hook: 'useTPM', entity: 'maintenance_alerts' },
};

export interface MaintenanceType {
  id: string;
  name: string;
  description: string | null;
  default_interval_days: number;
  color: string;
  created_at: string;
}

export interface MaintenanceSchedule {
  id: string;
  machine_id: string;
  maintenance_type_id: string;
  name: string;
  description: string | null;
  interval_days: number;
  last_completed_at: string | null;
  next_due_at: string;
  estimated_duration_minutes: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  machine?: { id: string; name: string; code: string };
  maintenance_type?: MaintenanceType;
}

export interface MaintenanceChecklist {
  id: string;
  maintenance_type_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  items?: MaintenanceChecklistItem[];
}

export interface MaintenanceChecklistItem {
  id: string;
  checklist_id: string;
  item_order: number;
  description: string;
  is_critical: boolean;
  requires_photo: boolean;
  requires_measurement: boolean;
  measurement_unit: string | null;
  min_value: number | null;
  max_value: number | null;
  created_at: string;
}

export interface MaintenanceRecord {
  id: string;
  schedule_id: string;
  machine_id: string;
  maintenance_type_id: string;
  performed_by: string | null;
  performed_by_name: string | null;
  started_at: string;
  completed_at: string | null;
  status: 'in_progress' | 'completed' | 'cancelled' | 'pending_parts';
  notes: string | null;
  photos: string[];
  total_cost: number;
  downtime_minutes: number;
  created_at: string;
  schedule?: MaintenanceSchedule;
  machine?: { id: string; name: string; code: string };
}

export interface MaintenanceAlert {
  id: string;
  schedule_id: string;
  machine_id: string;
  alert_type: 'upcoming' | 'due' | 'overdue' | 'critical';
  message: string;
  is_read: boolean;
  is_resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  schedule?: MaintenanceSchedule;
  machine?: { id: string; name: string; code: string };
}

export function useTPM() {
  const queryClient = useQueryClient();

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

  // Create schedule mutation
  const createSchedule = useMutation({
    mutationFn: async (data: {
      machine_id: string;
      maintenance_type_id: string;
      name: string;
      description?: string;
      interval_days: number;
      next_due_at: string;
      estimated_duration_minutes: number;
    }) => {
      const { error } = await supabase.from('maintenance_schedules').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] });
      toast.success('Manutenção agendada com sucesso');
    },
    onError: (error) => {
      console.error('[useTPM] createSchedule failed:', categorizeError(error), error);
      showErrorToast(error, 'Erro ao agendar manutenção', TPM_ERROR_CONTEXT.schedules);
    },
  });

  // Start maintenance mutation
  const startMaintenance = useMutation({
    mutationFn: async (data: {
      schedule_id: string;
      performed_by: string;
      performed_by_name: string;
    }) => {
      // Fetch fresh schedule data to avoid stale state issues
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .eq('id', data.schedule_id)
        .single();
      
      if (scheduleError || !scheduleData) {
        throw new Error('Agendamento não encontrado');
      }

      const { data: record, error } = await supabase
        .from('maintenance_records')
        .insert({
          schedule_id: data.schedule_id,
          machine_id: scheduleData.machine_id,
          maintenance_type_id: scheduleData.maintenance_type_id,
          performed_by: data.performed_by,
          performed_by_name: data.performed_by_name,
          status: 'in_progress',
        })
        .select()
        .single();
      if (error) throw error;
      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
      toast.success('Manutenção iniciada');
    },
    onError: (error) => {
      console.error('[useTPM] startMaintenance failed:', categorizeError(error), error);
      showErrorToast(error, 'Erro ao iniciar manutenção', TPM_ERROR_CONTEXT.records);
    },
  });

  // Complete maintenance mutation
  const completeMaintenance = useMutation({
    mutationFn: async (data: {
      record_id: string;
      notes?: string;
      total_cost?: number;
      downtime_minutes?: number;
    }) => {
      // Fetch fresh record data to avoid stale state issues
      const { data: recordData, error: recordFetchError } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('id', data.record_id)
        .single();
      
      if (recordFetchError || !recordData) {
        throw new Error('Registro não encontrado');
      }

      // Update record
      const { error: recordError } = await supabase
        .from('maintenance_records')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          notes: data.notes,
          total_cost: data.total_cost || 0,
          downtime_minutes: data.downtime_minutes || 0,
        })
        .eq('id', data.record_id);
      if (recordError) throw recordError;

      // Update schedule with next due date - fetch fresh schedule data
      const { data: scheduleData } = await supabase
        .from('maintenance_schedules')
        .select('interval_days')
        .eq('id', recordData.schedule_id)
        .single();
      
      if (scheduleData) {
        const nextDue = addDays(new Date(), scheduleData.interval_days).toISOString();
        const { error: scheduleError } = await supabase
          .from('maintenance_schedules')
          .update({
            last_completed_at: new Date().toISOString(),
            next_due_at: nextDue,
          })
          .eq('id', recordData.schedule_id);
        if (scheduleError) throw scheduleError;
      }

      // Resolve any related alerts
      await supabase
        .from('maintenance_alerts')
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq('schedule_id', recordData.schedule_id)
        .eq('is_resolved', false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-alerts'] });
      toast.success('Manutenção concluída');
    },
    onError: (error) => {
      console.error('[useTPM] completeMaintenance failed:', categorizeError(error), error);
      showErrorToast(error, 'Erro ao concluir manutenção', TPM_ERROR_CONTEXT.records);
    },
  });

  // Generate alerts for due maintenance
  const checkAndGenerateAlerts = useMutation({
    mutationFn: async () => {
      const now = new Date();
      let alertsGenerated = 0;

      for (const schedule of schedules) {
        const dueDate = new Date(schedule.next_due_at);
        const daysUntilDue = differenceInDays(dueDate, now);

        // Check if alert already exists
        const existingAlert = alerts.find(
          a => a.schedule_id === schedule.id && !a.is_resolved
        );
        if (existingAlert) continue;

        let alertType: MaintenanceAlert['alert_type'] | null = null;
        let message = '';

        if (daysUntilDue < -7) {
          alertType = 'critical';
          message = `Manutenção CRÍTICA atrasada há ${Math.abs(daysUntilDue)} dias: ${schedule.name}`;
        } else if (daysUntilDue < 0) {
          alertType = 'overdue';
          message = `Manutenção atrasada há ${Math.abs(daysUntilDue)} dias: ${schedule.name}`;
        } else if (daysUntilDue === 0) {
          alertType = 'due';
          message = `Manutenção vence HOJE: ${schedule.name}`;
        } else if (daysUntilDue <= 3) {
          alertType = 'upcoming';
          message = `Manutenção próxima (${daysUntilDue} dias): ${schedule.name}`;
        }

        if (alertType) {
          await supabase.from('maintenance_alerts').insert({
            schedule_id: schedule.id,
            machine_id: schedule.machine_id,
            alert_type: alertType,
            message,
          });
          alertsGenerated++;
        }
      }

      return alertsGenerated;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-alerts'] });
      if (count > 0) {
        toast.info(`${count} alertas de manutenção gerados`);
      }
    },
  });

  // Resolve alert
  const resolveAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('maintenance_alerts')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-alerts'] });
    },
  });

  // Calculate statistics
  const stats = {
    totalScheduled: schedules.length,
    dueToday: schedules.filter(s => isToday(new Date(s.next_due_at))).length,
    overdue: schedules.filter(s => isPast(new Date(s.next_due_at)) && !isToday(new Date(s.next_due_at))).length,
    upcoming7Days: schedules.filter(s => {
      const due = new Date(s.next_due_at);
      return isFuture(due) && differenceInDays(due, new Date()) <= 7;
    }).length,
    completedThisMonth: records.filter(r => {
      const completed = r.completed_at ? new Date(r.completed_at) : null;
      if (!completed) return false;
      const now = new Date();
      return completed.getMonth() === now.getMonth() && completed.getFullYear() === now.getFullYear();
    }).length,
    activeAlerts: alerts.filter(a => !a.is_resolved).length,
    criticalAlerts: alerts.filter(a => a.alert_type === 'critical' && !a.is_resolved).length,
  };

  // Get schedules by status
  const getSchedulesByStatus = () => {
    const now = new Date();
    return {
      overdue: schedules.filter(s => isPast(new Date(s.next_due_at)) && !isToday(new Date(s.next_due_at))),
      dueToday: schedules.filter(s => isToday(new Date(s.next_due_at))),
      upcoming: schedules.filter(s => isFuture(new Date(s.next_due_at))),
    };
  };

  return {
    // Data
    maintenanceTypes,
    schedules,
    checklists,
    records,
    alerts,
    machines,
    stats,
    
    // Loading
    isLoading: loadingTypes || loadingSchedules || loadingChecklists || loadingRecords || loadingAlerts,
    
    // Helpers
    getSchedulesByStatus,
    
    // Mutations
    createSchedule,
    startMaintenance,
    completeMaintenance,
    checkAndGenerateAlerts,
    resolveAlert,
  };
}
