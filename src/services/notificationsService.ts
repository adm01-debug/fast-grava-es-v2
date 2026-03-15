import { supabase } from '@/integrations/supabase/client';

export const NotificationsService = {
  async getDailySummary(date: string) {
    const { data, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('date', date)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getEfficiencyAlerts(resolved = false) {
    const { data, error } = await supabase
      .from('efficiency_alert_history')
      .select('*')
      .is('resolved_at', resolved ? 'not.null' : null)
      .order('detected_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async resolveEfficiencyAlert(id: string, notes: string, userId: string) {
    const { error } = await supabase
      .from('efficiency_alert_history')
      .update({
        resolved_at: new Date().toISOString(),
        resolved_by: userId,
        resolution_notes: notes,
      })
      .eq('id', id);
    if (error) throw error;
  },
};
