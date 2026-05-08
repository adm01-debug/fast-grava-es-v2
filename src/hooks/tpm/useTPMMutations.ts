import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addDays, differenceInDays } from 'date-fns';
import { showErrorToast, categorizeError } from '@/lib/errorHandling';
import { MaintenanceSchedule, MaintenanceAlert, TPM_ERROR_CONTEXT } from './types';

interface UseTPMMutationsProps {
  schedules: MaintenanceSchedule[];
  alerts: MaintenanceAlert[];
}

export function useTPMMutations({ schedules, alerts }: UseTPMMutationsProps) {
  const queryClient = useQueryClient();

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
      if (import.meta.env.DEV) console.error('[useTPM] createSchedule failed:', categorizeError(error), error);
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
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .eq('id', data.schedule_id)
        .maybeSingle();
      
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
      if (import.meta.env.DEV) console.error('[useTPM] startMaintenance failed:', categorizeError(error), error);
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
      responses?: Array<{
        checklist_item_id: string;
        is_checked: boolean;
        measurement_value?: number;
        notes?: string;
        photo_url?: string;
      }>;
      parts?: Array<{
        name: string;
        code?: string;
        quantity: number;
        cost?: number;
      }>;
      signature?: string;
    }) => {
      const { data: recordData, error: recordFetchError } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('id', data.record_id)
        .maybeSingle();
      
      if (recordFetchError || !recordData) {
        throw new Error('Registro não encontrado');
      }

      // Update the main record
      const { error: recordError } = await supabase
        .from('maintenance_records')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          notes: data.notes,
          total_cost: data.total_cost || 0,
          downtime_minutes: data.downtime_minutes || 0,
          signature_url: data.signature, // Reuse field or map accordingly
        })
        .eq('id', data.record_id);
      
      if (recordError) throw recordError;

      // Insert checklist responses if provided
      if (data.responses && data.responses.length > 0) {
        const responsesToInsert = data.responses.map(resp => ({
          record_id: data.record_id,
          ...resp
        }));

        const { error: respError } = await supabase
          .from('maintenance_item_responses')
          .insert(responsesToInsert);
        
        if (respError) throw respError;
      }

      // Insert parts if provided
      if (data.parts && data.parts.length > 0) {
        const partsToInsert = data.parts.map(part => ({
          execution_id: data.record_id, // Map record_id to execution_id for the new table
          part_name: part.name,
          part_code: part.code,
          quantity: part.quantity,
          cost: part.cost
        }));

        // Insert into tpm_execution_parts (new table)
        const { error: partsError } = await supabase
          .from('tpm_execution_parts')
          .insert(partsToInsert);
        
        if (partsError) throw partsError;
      }

      const { data: scheduleData } = await supabase
        .from('maintenance_schedules')
        .select('interval_days')
        .eq('id', recordData.schedule_id)
        .maybeSingle();
      
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
      if (import.meta.env.DEV) console.error('[useTPM] completeMaintenance failed:', categorizeError(error), error);
      showErrorToast(error, 'Erro ao concluir manutenção', TPM_ERROR_CONTEXT.records);
    },
  });

  // Generate alerts for due maintenance (parallel execution)
  const checkAndGenerateAlerts = useMutation({
    mutationFn: async () => {
      const now = new Date();

      const alertsToCreate = schedules
        .filter(schedule => {
          const existingAlert = alerts.find(
            a => a.schedule_id === schedule.id && !a.is_resolved
          );
          return !existingAlert;
        })
        .map(schedule => {
          const dueDate = new Date(schedule.next_due_at);
          const daysUntilDue = differenceInDays(dueDate, now);

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
            return {
              schedule_id: schedule.id,
              machine_id: schedule.machine_id,
              alert_type: alertType,
              message,
            };
          }
          return null;
        })
        .filter((alert): alert is NonNullable<typeof alert> => alert !== null);

      const results = await Promise.all(
        alertsToCreate.map(async (alertData) => {
          const { error } = await supabase.from('maintenance_alerts').insert(alertData);
          return error ? null : alertData;
        })
      );

      return results.filter(r => r !== null).length;
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

  return {
    createSchedule,
    startMaintenance,
    completeMaintenance,
    checkAndGenerateAlerts,
    resolveAlert,
  };
}
