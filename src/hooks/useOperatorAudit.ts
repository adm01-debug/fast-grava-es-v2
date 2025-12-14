import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OperatorAuditEntry {
  id: string;
  operator_id: string;
  operator_name: string | null;
  action: 'activated' | 'deactivated' | 'removed';
  performed_by: string;
  performed_by_name: string | null;
  reason: string | null;
  created_at: string;
}

export function useOperatorAudit() {
  return useQuery({
    queryKey: ['operator-status-audit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operator_status_audit')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []) as unknown as OperatorAuditEntry[];
    },
    staleTime: 1000 * 60, // 1 minute
  });
}
