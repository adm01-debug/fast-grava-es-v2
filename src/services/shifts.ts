import { supabase } from '@/integrations/supabase/client';
export const shiftsService = {
  getAll: async () => supabase.from('shifts').select('*'),
  createHandover: async (data: any) => supabase.from('handovers').insert(data),
};
