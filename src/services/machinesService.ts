import { supabase } from '@/integrations/supabase/client';

export const MachinesService = {
  async getAll() {
    const { data, error } = await supabase.from('machines').select('*').order('name');
    if (error) throw error;
    return data;
  },

  async getActive() {
    const { data, error } = await supabase.from('machines').select('*').eq('is_active', true).order('name');
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('machines').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async getHealthMetrics(machineId: string) {
    const { data, error } = await supabase
      .from('machine_health_metrics')
      .select('*')
      .eq('machine_id', machineId)
      .order('calculated_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    return data?.[0] ?? null;
  },
};
