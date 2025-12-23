import { supabase } from '@/integrations/supabase/client';

export const tpmService = {
  getSchedules: async () => supabase.from('maintenance_schedules').select('*'),
  createSchedule: async (data: unknown) => supabase.from('maintenance_schedules').insert(data as any),
  getRecords: async (machineId: string) => supabase.from('maintenance_records').select('*').eq('machine_id', machineId),
  getAlerts: async () => supabase.from('maintenance_alerts').select('*').eq('is_resolved', false),
};
