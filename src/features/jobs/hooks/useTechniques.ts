import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { createAppError } from '@/lib/errorHandling';
import { QUERY_KEYS, STALE_TIMES } from '@/lib/queryConfig';
import { techniquesService } from '@/features/jobs';

const TECHNIQUES_ERROR_CONTEXT = { entity: 'techniques', operation: 'fetch' };

export function useTechniques() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.TECHNIQUES,
    queryFn: async () => {
      try {
        return await techniquesService.getAll();
      } catch (error) {
        throw createAppError(error, TECHNIQUES_ERROR_CONTEXT);
      }
    },
    staleTime: STALE_TIMES.STATIC,
  });

  useEffect(() => {
    const channel = supabase
      .channel('techniques-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'techniques' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TECHNIQUES });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
