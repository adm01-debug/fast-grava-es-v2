import { supabase } from '@/integrations/supabase/client';

export const api = {
  get: async (table: string) => supabase.from(table).select('*'),
  create: async (table: string, data: any) => supabase.from(table).insert(data),
  update: async (table: string, id: string, data: any) => supabase.from(table).update(data).eq('id', id),
  delete: async (table: string, id: string) => supabase.from(table).delete().eq('id', id),
};
