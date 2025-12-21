import { supabase } from '@/integrations/supabase/client';
export const oeeService = {
  getByMachine: async (machineId: string) => supabase.from('oee_data').select('*').eq('machine_id', machineId),
  calculate: async (data: any) => ({ oee: 0, availability: 0, performance: 0, quality: 0 }),
};
