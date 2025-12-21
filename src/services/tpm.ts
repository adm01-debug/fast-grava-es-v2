import { supabase } from '@/integrations/supabase/client';
export const tpmService = {
  getSchedules: async () => supabase.from('tpm_schedules').select('*'),
  createSchedule: async (data: any) => supabase.from('tpm_schedules').insert(data),
};
