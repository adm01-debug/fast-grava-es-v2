import { supabase } from '@/integrations/supabase/client';

export const machinesService = {
  getAll: async () => supabase.from('machines').select('*'),
  getById: async (id: string) => supabase.from('machines').select('*').eq('id', id).single(),
  create: async (machine: any) => supabase.from('machines').insert(machine),
  update: async (id: string, data: any) => supabase.from('machines').update(data).eq('id', id),
};
