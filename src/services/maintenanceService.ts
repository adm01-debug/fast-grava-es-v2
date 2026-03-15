import { supabase } from '@/integrations/supabase/client';

export const MaintenanceService = {
  async getSchedules(machineId?: string) {
    let query = supabase.from('maintenance_schedules').select('*, machines(name, code)');
    if (machineId) query = query.eq('machine_id', machineId);
    const { data, error } = await query.order('next_due_date');
    if (error) throw error;
    return data;
  },

  async getRecords(machineId?: string) {
    let query = supabase.from('maintenance_records').select('*, machines(name, code)');
    if (machineId) query = query.eq('machine_id', machineId);
    const { data, error } = await query.order('started_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAlerts(unreadOnly = false) {
    let query = supabase.from('maintenance_alerts').select('*, machines(name, code)');
    if (unreadOnly) query = query.eq('is_read', false);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
};
