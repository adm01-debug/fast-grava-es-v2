import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProductionLoss {
  id: string;
  job_id: string;
  quantity: number;
  operator_id?: string | null;
  notes?: string | null;
  created_at: string;
}

export function useProductionLosses(jobId?: string) {
  const queryClient = useQueryClient();

  const { data: losses, isLoading } = useQuery({
    queryKey: ['production-losses', jobId],
    queryFn: async () => {
      let query = supabase.from('production_losses').select('*, job:jobs(order_number, client)');
      if (jobId) {
        query = query.eq('job_id', jobId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const recordLoss = useMutation({
    mutationFn: async (data: Omit<ProductionLoss, 'id' | 'created_at'>) => {
      const { data: result, error } = await supabase
        .from('production_losses')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      // Update total lost_pieces on the job
      const { data: job } = await supabase.from('jobs').select('lost_pieces').eq('id', data.job_id).single();
      const currentLosses = job?.lost_pieces || 0;

      await supabase
        .from('jobs')
        .update({ lost_pieces: currentLosses + data.quantity })
        .eq('id', data.job_id);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-losses'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Perda registrada com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao registrar perda: ' + error.message);
    }
  });

  return {
    losses,
    isLoading,
    recordLoss: recordLoss.mutate,
  };
}
