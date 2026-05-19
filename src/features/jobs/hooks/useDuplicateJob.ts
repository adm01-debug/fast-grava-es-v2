import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { DbJob } from './useJobs';
import { toast } from 'sonner';

/**
 * Duplicates a job with all its data, resetting status and timestamps.
 * Ideal for recurring orders from frequent clients.
 */
export function useDuplicateJob() {
  const queryClient = useQueryClient();

  const duplicateJob = useCallback(async (job: DbJob) => {
    try {
      const { data, error } = await supabase.from('jobs').insert({
        order_number: `${job.order_number}-COPIA`,
        client: job.client,
        product: job.product,
        quantity: job.quantity,
        technique_id: job.technique_id,
        machine_id: job.machine_id,
        gravure_color: job.gravure_color,
        estimated_duration: job.estimated_duration,
        notes: job.notes ? `[Duplicado de ${job.order_number}] ${job.notes}` : `Duplicado de ${job.order_number}`,
        priority: job.priority,
        status: 'queue',
        scheduled_date: null,
        start_time: null,
        end_time: null,
        actual_start_time: null,
        actual_end_time: null,
        produced_quantity: null,
        lost_pieces: null,
        production_photos: null,
      }).select().single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success(`Job duplicado! Nova OS: ${data.order_number}`, {
        description: 'O job foi adicionado à fila com status "Na Fila"',
      });

      return data;
    } catch (error) {
      toast.error('Erro ao duplicar job');
      return null;
    }
  }, [queryClient]);

  return { duplicateJob };
}
