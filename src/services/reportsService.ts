import { supabase } from '@/integrations/supabase/client';

export const ReportsService = {
  async getOEEMetrics(machineId: string, periodStart: string, periodEnd: string) {
    const { data, error } = await supabase
      .from('machine_health_metrics')
      .select('*')
      .eq('machine_id', machineId)
      .gte('period_start', periodStart)
      .lte('period_end', periodEnd)
      .order('period_start');
    if (error) throw error;
    return data;
  },

  async getABCCosts(jobId?: string) {
    let query = supabase.from('abc_job_costs').select('*, abc_activities(name), abc_cost_pools(name)');
    if (jobId) query = query.eq('job_id', jobId);
    const { data, error } = await query.order('calculated_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getDailySummaries(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');
    if (error) throw error;
    return data;
  },
};
