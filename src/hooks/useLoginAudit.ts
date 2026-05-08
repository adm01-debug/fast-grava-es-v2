import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LoginAuditEntry {
  id: string;
  user_id: string;
  user_email: string;
  ip_address: string;
  user_agent: string;
  login_status: string;
  failure_reason: string | null;
  created_at: string;
}

export function useLoginAudit(limit = 100) {
  return useQuery({
    queryKey: ['login-audit', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('login_audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as LoginAuditEntry[];
    },
    staleTime: 30_000,
  });
}
