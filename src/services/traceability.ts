import { supabase } from '@/integrations/supabase/client';
export const traceabilityService = {
  getLot: async (lotId: string) => supabase.from('lots').select('*').eq('id', lotId),
  getGenealogy: async (lotId: string) => ({ parents: [], children: [] }),
};
