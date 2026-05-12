import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OperatorAudit {
  id: string;
  operator_id: string;
  previous_data: any;
  new_data: any;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
  changed_by_profile?: {
    full_name: string;
  };
}

export function useOperatorAudit(operatorId?: string) {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['operator-status-audit', operatorId],
    queryFn: async () => {
      let query = supabase
        .from('operator_status_audit')
        .select('*, changed_by_profile:profiles!operator_status_audit_changed_by_fkey(full_name)');
      
      if (operatorId) {
        query = query.eq('operator_id', operatorId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as OperatorAudit[];
    },
  });

  return {
    auditLogs,
    isLoading,
  };
}
