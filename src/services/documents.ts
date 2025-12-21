import { supabase } from '@/integrations/supabase/client';
export const documentsService = {
  upload: async (file: File) => supabase.storage.from('documents').upload(file.name, file),
  getAll: async () => supabase.from('documents').select('*'),
};
