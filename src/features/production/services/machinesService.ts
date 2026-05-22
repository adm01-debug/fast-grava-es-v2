import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Machine = Database['public']['Tables']['machines']['Row'];
export type MachineHealthMetric = Database['public']['Tables']['machine_health_metrics']['Row'];

export const machinesService = {
  async getAll(): Promise<Machine[]> {
    const { data, error } = await supabase.from('machines').select('*').order('name');
    if (error) {
      console.error('Failed to fetch machines:', error);
      return [];
    }
    return data || [];
  },

  async getActive(): Promise<Machine[]> {
    const { data, error } = await supabase.from('machines').select('*').eq('is_active', true).order('name');
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Machine> {
    const { data, error } = await supabase.from('machines').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async getHealthMetrics(machineId: string): Promise<MachineHealthMetric | null> {
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
