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

export function useProductionLosses(jobId?: string, filters?: { shift?: string; startDate?: string; endDate?: string; machineId?: string; techniqueId?: string }) {
  const queryClient = useQueryClient();

  const { data: losses, isLoading } = useQuery({
    queryKey: ['production-losses', jobId, filters],
    queryFn: async () => {
      let query = supabase.from('production_losses').select('*, job:jobs(order_number, client, machine_id, technique_id)');
      
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

      // Client-side filtering for machine and technique since they are in the related job table
      let filteredData = (data || []) as any[];
      
      if (filters?.machineId && filters.machineId !== 'all') {
        filteredData = filteredData.filter((l: any) => l.job?.machine_id === filters.machineId);
      }
      
      if (filters?.techniqueId && filters.techniqueId !== 'all') {
        filteredData = filteredData.filter((l: any) => l.job?.technique_id === filters.techniqueId);
      }

      return filteredData;
    },
    enabled: true,
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
      const { data: job } = await supabase.from('jobs').select('lost_pieces, start_time, actual_start_time').eq('id', data.job_id).single();
      const currentLosses = job?.lost_pieces || 0;

      // Auto-detect shift based on job time if not provided
      let shift = data.shift;
      if (!shift) {
        const timeToUse = job?.actual_start_time || job?.start_time;
        if (timeToUse) {
          let hour: number;
          if (timeToUse.includes('T')) {
            hour = new Date(timeToUse).getHours();
          } else {
            hour = parseInt(timeToUse.split(':')[0]);
          }
          
          if (hour >= 7 && hour < 15) shift = '1';
          else if (hour >= 15 && hour < 23) shift = '2';
          else shift = '3';
        }
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
