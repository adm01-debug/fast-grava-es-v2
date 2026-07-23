import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { packagingService } from '../services/packagingService';
import type { PackagingTaskStatus } from '../types/packaging.schema';

export function usePackagingQueue(status?: PackagingTaskStatus | PackagingTaskStatus[]) {
  const query = useQuery({
    queryKey: ['packaging-tasks', status ?? 'all'],
    queryFn: () => packagingService.listTasks(status ? { status } : undefined),
    staleTime: 30_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel('packaging-tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'packaging_tasks' },
        () => query.refetch(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return query;
}
