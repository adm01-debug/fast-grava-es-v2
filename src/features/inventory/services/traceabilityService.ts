import { supabase } from '@/integrations/supabase/client';

export const TraceabilityService = {
  async getLots(jobId?: string) {
    let query = supabase.from('production_lots').select('*');
    if (jobId) query = query.eq('job_id', jobId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getLotComponents(lotId: string) {
    const { data, error } = await supabase
      .from('lot_components')
      .select('*')
      .eq('lot_id', lotId);
    if (error) throw error;
    return data;
  },

  async getLotMovements(lotId: string) {
    const { data, error } = await supabase
      .from('lot_movements')
      .select('*')
      .eq('lot_id', lotId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getQualityInspections(lotId: string) {
    const { data, error } = await supabase
      .from('lot_quality_inspections')
      .select('*')
      .eq('lot_id', lotId)
      .order('inspected_at', { ascending: false });
    if (error) throw error;
    return data;
  },
};
