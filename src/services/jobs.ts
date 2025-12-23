import { supabase } from '@/integrations/supabase/client';

export const jobsService = {
  getAll: async () => supabase.from('jobs').select('*'),
  getById: async (id: string) => supabase.from('jobs').select('*').eq('id', id).single(),
  create: async (job: any) => supabase.from('jobs').insert(job),
  update: async (id: string, data: any) => supabase.from('jobs').update(data).eq('id', id),
  delete: async (id: string) => supabase.from('jobs').delete().eq('id', id),
};
