import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { createAppError } from '@/lib/errorHandling';
import { QUERY_KEYS, STALE_TIMES } from '@/lib/queryConfig';
import { machinesService } from '@/features/production';

const MACHINES_ERROR_CONTEXT = { entity: 'machines', operation: 'fetch' };

export function useMachines() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.MACHINES,
    queryFn: async () => {
      try {
        return await machinesService.getActive();
      } catch (error) {
        throw createAppError(error, MACHINES_ERROR_CONTEXT);
      }
    },
    staleTime: STALE_TIMES.STATIC,
  });

  useEffect(() => {
    const channel = supabase
      .channel('machines-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'machines' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MACHINES });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
