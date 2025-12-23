import { supabase } from '@/integrations/supabase/client';

export const shiftsService = {
  getHandovers: async () => supabase.from('shift_handovers').select('*'),
  createHandover: async (data: unknown) => supabase.from('shift_handovers').insert(data as any),
  getChecklists: async () => supabase.from('shift_checklist_templates').select('*'),
  getOccurrences: async (handoverId: string) => supabase.from('shift_occurrences').select('*').eq('handover_id', handoverId),
};
