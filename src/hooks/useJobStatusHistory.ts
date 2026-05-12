import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface JobStatusHistory {
  id: string;
  job_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by: string | null;
  created_at: string;
  changed_by_profile?: {
    full_name: string;
  };
}

export function useJobStatusHistory(jobId: string) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['job-status-history', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_status_history')
        .select('*, changed_by_profile:profiles!job_status_history_changed_by_fkey(full_name)')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });

  return {
    history,
    isLoading,
  };
}
