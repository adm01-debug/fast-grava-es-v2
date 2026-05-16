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
  shift?: string | null;
  loss_type?: 'availability' | 'performance' | 'quality';
}

export function useProductionLosses(jobId?: string, filters?: { shift?: string; startDate?: string; endDate?: string }) {
  const queryClient = useQueryClient();

  const { data: losses, isLoading } = useQuery({
    queryKey: ['production-losses', jobId, filters],
    queryFn: async () => {
      let query = supabase.from('production_losses').select('*, job:jobs(order_number, client)');
      if (jobId) {
        query = query.eq('job_id', jobId);
      }
      
      if (filters?.shift && filters.shift !== 'all') {
        query = query.eq('shift', filters.shift);
      }
      
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
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
      const { data: job } = await supabase.from('jobs').select('lost_pieces, start_time').eq('id', data.job_id).single();
      const currentLosses = job?.lost_pieces || 0;

      // Auto-detect shift based on job start_time if not provided
      let shift = data.shift;
      if (!shift && job?.start_time) {
        const hour = parseInt(job.start_time.split(':')[0]);
        if (hour >= 7 && hour < 15) shift = '1';
        else if (hour >= 15 && hour < 23) shift = '2';
        else shift = '3';
      }

      await supabase
        .from('production_losses')
        .update({ shift })
        .eq('id', result.id);

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
