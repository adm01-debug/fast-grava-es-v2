import { supabase } from '@/integrations/supabase/client';

export const reportsService = {
  getDailySummary: async (date: string) => supabase.from('daily_summaries').select('*').eq('date', date),
  exportPDF: async (type: string, params: any) => {
    return supabase.functions.invoke('pdf-generator', { body: { type, params } });
  },
  exportExcel: async (type: string, params: any) => {
    return supabase.functions.invoke('excel-export', { body: { type, params } });
  },
};
