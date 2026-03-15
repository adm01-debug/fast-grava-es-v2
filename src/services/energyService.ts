import { supabase } from '@/integrations/supabase/client';

export const EnergyService = {
  async getConsumption(machineId?: string, startDate?: string, endDate?: string) {
    let query = supabase.from('energy_consumption').select('*');
    if (machineId) query = query.eq('machine_id', machineId);
    if (startDate) query = query.gte('recorded_at', startDate);
    if (endDate) query = query.lte('recorded_at', endDate);
    const { data, error } = await query.order('recorded_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAlerts(resolved = false) {
    const { data, error } = await supabase
      .from('energy_alerts')
      .select('*, machines(name)')
      .eq('is_resolved', resolved)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getTargets() {
    const { data, error } = await supabase
      .from('energy_targets')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },
};
