import { supabase } from '@/integrations/supabase/client';

export const documentsService = {
  upload: async (file: File) => supabase.storage.from('technical-documents').upload(file.name, file),
  getAll: async () => supabase.from('technical_documents').select('*'),
  getById: async (id: string) => supabase.from('technical_documents').select('*').eq('id', id).single(),
};
