import { supabase } from '@/integrations/supabase/client';

export const energyService = {
  getConsumption: async (machineId: string) => supabase.from('energy_consumption').select('*').eq('machine_id', machineId),
  getAlerts: async () => supabase.from('energy_alerts').select('*').eq('is_resolved', false),
  getTargets: async () => supabase.from('energy_targets').select('*').eq('is_active', true),
};
