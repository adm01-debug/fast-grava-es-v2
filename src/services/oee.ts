import { supabase } from '@/integrations/supabase/client';

export const oeeService = {
  getByMachine: async (machineId: string) => supabase.from('machine_health_metrics').select('*').eq('machine_id', machineId),
  calculate: async (_data: unknown) => ({ oee: 0, availability: 0, performance: 0, quality: 0 }),
};
