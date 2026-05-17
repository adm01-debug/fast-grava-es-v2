import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useMemo } from 'react';
import { showErrorToast, createAppError, createMutationErrorHandler } from '@/lib/errorHandling';
import { QUERY_KEYS, STALE_TIMES } from '@/lib/queryConfig';

// Error context for debugging
const JOBS_ERROR_CONTEXT = {
  hooks: {
    techniques: { entity: 'techniques', operation: 'fetch' },
    machines: { entity: 'machines', operation: 'fetch' },
    jobs: { entity: 'jobs', operation: 'fetch' },
    updateStatus: { entity: 'jobs', operation: 'update_status' },
    updateJob: { entity: 'jobs', operation: 'update' },
    deleteJob: { entity: 'jobs', operation: 'delete' },
  }
};

export interface DbJob {
  id: string;
  order_number: string;
  client: string;
  product: string;
  quantity: number;
  produced_quantity: number | null;
  technique_id: string;
  machine_id: string | null;
  scheduled_date: string | null;
  start_time: string | null;
  end_time: string | null;
  estimated_duration: number;
  status: 'queue' | 'ready' | 'scheduled' | 'production' | 'finished' | 'paused' | 'cancelled' | 'delayed' | 'rework' | 'buffer';
  gravure_color: string | null;
  notes: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
  lost_pieces: number | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  product_category_id: string | null;
  operator_id: string | null;
  created_at: string;
  updated_at: string;
  sort_order: number | null;
  production_photos: string[] | null;
  shipment_id: string | null;
  shipping_status: string | null;
}

export interface DbTechnique {
  id: string;
  name: string;
  short_name: string;
  color: string;
  setup_time: number;
  low_threshold: number | null;
  medium_threshold: number | null;
  high_threshold: number | null;
}

export interface DbMachine {
  id: string;
  code: string;
  name: string;
  technique_id: string;
  is_active: boolean;
}

// Re-export constants for backward compatibility
export const STATIC_STALE_TIME = STALE_TIMES.STATIC;
export const JOBS_STALE_TIME = STALE_TIMES.DYNAMIC;

export function useTechniques() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.TECHNIQUES,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('techniques')
        .select('*')
        .order('name');

      if (error) {
        throw createAppError(error, JOBS_ERROR_CONTEXT.hooks.techniques);
      }
      return data as DbTechnique[];
    },
    staleTime: STATIC_STALE_TIME,
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

export function useMachines() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.MACHINES,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .eq('is_active', true)
        .order('code');

      if (error) {
        throw createAppError(error, JOBS_ERROR_CONTEXT.hooks.machines);
      }
      return data as DbMachine[];
    },
    staleTime: STATIC_STALE_TIME,
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

export function useJobs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.JOBS,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw createAppError(error, JOBS_ERROR_CONTEXT.hooks.jobs);
      }
      return data as DbJob[];
    },
    staleTime: JOBS_STALE_TIME,
  });

  useEffect(() => {
    const channel = supabase
      .channel('jobs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOBS });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: DbJob['status'] }) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const updateData: Partial<DbJob> = { status };

        if (status === 'production') {
          updateData.actual_start_time = new Date().toISOString();
          if (user) updateData.operator_id = user.id;
        } else if (status === 'finished') {
          updateData.actual_end_time = new Date().toISOString();
        }

        const { error } = await supabase
          .from('jobs')
          .update(updateData)
          .eq('id', jobId);

        if (error) throw error;

        // Push status update to Bitrix24 (fire and forget)
        try {
          const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
          if (projectId) {
            fetch(`https://${projectId}.supabase.co/functions/v1/bitrix24-sync?action=push`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              },
              body: JSON.stringify({ jobId, status })
            }).catch(() => { /* fire and forget */ });
          }
        } catch (e) {
        }
      } catch (error) {
        const appError = createAppError(error, JOBS_ERROR_CONTEXT.hooks.updateStatus);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: createMutationErrorHandler('Erro ao atualizar status do job'),
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, data }: { jobId: string; data: Partial<DbJob> }) => {
      try {
        const { error } = await supabase
          .from('jobs')
          .update(data)
          .eq('id', jobId);

        if (error) throw error;
      } catch (error) {
        const appError = createAppError(error, JOBS_ERROR_CONTEXT.hooks.updateJob);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['paginated-jobs'] });
    },
    onError: createMutationErrorHandler('Erro ao atualizar job'),
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      try {
        const { error } = await supabase
          .from('jobs')
          .delete()
          .eq('id', jobId);

        if (error) throw error;
      } catch (error) {
        const appError = createAppError(error, JOBS_ERROR_CONTEXT.hooks.deleteJob);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['paginated-jobs'] });
    },
    onError: createMutationErrorHandler('Erro ao excluir job'),
  });
}

export interface BufferTechniqueStatus {
  technique: DbTechnique;
  readyCount: number;
  queueCount: number;
  isHealthy: boolean;
  isCritical: boolean;
  isWarning: boolean;
}

export function useBufferStatus() {
  const { data: jobs } = useJobs();
  const { data: techniques } = useTechniques();

  return useMemo(() => {
    if (!jobs || !techniques) {
      return { bufferByTechnique: [] as BufferTechniqueStatus[], isLoading: true };
    }

    // Optimization: Group jobs by technique in a single pass O(J)
    const jobsByTechnique = new Map<string, DbJob[]>();
    for (const job of jobs) {
      const list = jobsByTechnique.get(job.technique_id) || [];
      list.push(job);
      jobsByTechnique.set(job.technique_id, list);
    }

    // Map techniques O(T)
    const bufferByTechnique: BufferTechniqueStatus[] = techniques.map(technique => {
      const techniqueJobs = jobsByTechnique.get(technique.id) || [];

      let readyCount = 0;
      let queueCount = 0;
      let hasActiveWork = false;

      for (const job of techniqueJobs) {
        if (job.status === 'ready') readyCount++;
        else if (job.status === 'queue') queueCount++;
        else if (['production', 'scheduled', 'delayed', 'paused', 'rework'].includes(job.status)) {
          hasActiveWork = true;
        }
      }

      const hasWork = readyCount > 0 || queueCount > 0 || hasActiveWork;

      return {
        technique,
        readyCount,
        queueCount,
        isHealthy: readyCount >= 3,
        isCritical: hasWork && readyCount === 0,
        isWarning: hasWork && readyCount > 0 && readyCount < 3,
      };
    }).filter(item => item.queueCount > 0 || item.readyCount > 0 || item.isCritical);

    return { bufferByTechnique, isLoading: false };
  }, [jobs, techniques]);
}
