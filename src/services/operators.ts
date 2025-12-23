import { supabase } from '@/integrations/supabase/client';

export const operatorsService = {
  getAll: async () => supabase.from('profiles').select('*'),
  getById: async (id: string) => supabase.from('profiles').select('*').eq('id', id).single(),
  getRankings: async () => supabase.from('operator_rankings').select('*').order('position', { ascending: true }),
  getAchievements: async (operatorId: string) => supabase.from('operator_achievements').select('*').eq('operator_id', operatorId),
};
