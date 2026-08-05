import { supabase } from '@/integrations/supabase/client';

export const OperatorsService = {
  async getAll() {
    const { data, error } = await supabase.from('profiles').select('*').order('name');
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async getGoals(operatorId: string) {
    const { data, error } = await supabase
      .from('operator_goals')
      .select('*')
      .eq('operator_id', operatorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getRankings() {
    const { data, error } = await supabase
      .from('operator_rankings')
      .select('*')
      .order('rank');
    if (error) throw error;
    return data;
  },
};
