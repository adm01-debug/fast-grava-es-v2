import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OperatorAudit {
  id: string;
  operator_id: string;
  operator_name: string | null;
  action: string;
  performed_by: string;
  performed_by_name: string | null;
  reason: string | null;
  created_at: string;
}

export function useOperatorAudit(operatorId?: string) {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['operator-status-audit', operatorId],
    queryFn: async () => {
      let query = supabase.from('operator_status_audit').select('*');

      if (operatorId) {
        query = query.eq('operator_id', operatorId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as OperatorAudit[];
    },
  });

  return {
    data: auditLogs, // Mantendo compatibilidade com OperatorAuditHistory.tsx que usa { data: auditEntries }
    auditLogs,
    isLoading,
  };
}
