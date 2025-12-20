import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';

interface ReportConfig {
  report_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  recipients: string[];
  include_charts?: boolean;
  include_details?: boolean;
  technique_ids?: string[];
  machine_ids?: string[];
}

export function useEmailReports() {
  const queryClient = useQueryClient();

  // Send report immediately
  const sendReport = useMutation({
    mutationFn: async (config: ReportConfig & { start_date: string; end_date: string }) => {
      const { data, error } = await supabase.functions.invoke('send-email-report', {
        body: config,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.preview) {
        toast.info('Preview do relatório gerado (email não enviado - configure RESEND_API_KEY)');
      } else {
        toast.success(`Relatório enviado para ${data.sent} destinatário(s)`);
      }
    },
    onError: (error) => {
      console.error('Error sending report:', error);
      toast.error('Erro ao enviar relatório');
    },
  });

  // Quick send helpers
  const sendDailyReport = (recipients: string[]) => {
    const today = new Date();
    const yesterday = subDays(today, 1);
    
    sendReport.mutate({
      report_type: 'daily',
      recipients,
      start_date: format(yesterday, 'yyyy-MM-dd'),
      end_date: format(today, 'yyyy-MM-dd'),
      include_charts: true,
      include_details: true,
    });
  };

  const sendWeeklyReport = (recipients: string[]) => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    
    sendReport.mutate({
      report_type: 'weekly',
      recipients,
      start_date: format(weekStart, 'yyyy-MM-dd'),
      end_date: format(today, 'yyyy-MM-dd'),
      include_charts: true,
      include_details: true,
    });
  };

  const sendMonthlyReport = (recipients: string[]) => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    
    sendReport.mutate({
      report_type: 'monthly',
      recipients,
      start_date: format(monthStart, 'yyyy-MM-dd'),
      end_date: format(today, 'yyyy-MM-dd'),
      include_charts: true,
      include_details: true,
    });
  };

  // Fetch report history from daily_summaries
  const { data: reportHistory } = useQuery({
    queryKey: ['email-report-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('summary_type', 'email_report')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  return {
    sendReport: sendReport.mutate,
    sendDailyReport,
    sendWeeklyReport,
    sendMonthlyReport,
    isSending: sendReport.isPending,
    reportHistory,
    scheduledReports: [],
    createScheduledReport: () => toast.info('Agendamento de relatórios em breve'),
    toggleScheduledReport: () => {},
    deleteScheduledReport: () => {},
  };
}
