import { supabase } from '@/integrations/supabase/client';
export const energyService = {
  getConsumption: async (machineId: string) => supabase.from('energy_readings').select('*').eq('machine_id', machineId),
  getCosts: async (period: string) => ({ total: 0, average: 0 }),
};
