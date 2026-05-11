import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useMemo, useCallback } from 'react';
import { differenceInMinutes } from 'date-fns';
import { DbJob, DbTechnique, DbMachine } from './useJobs';
import { categorizeError, ErrorCodes, createAppError } from '@/lib/errorHandling';

// Stale time for static data (techniques, machines change less frequently)
const STATIC_DATA_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const JOBS_STALE_TIME = 30 * 1000; // 30 seconds

// Retry configuration for connection failures
const RETRY_CONFIG = {
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Context-specific error messages for debugging
const ERROR_CONTEXT = {
  techniques: { entity: 'técnicas', operation: 'fetch' },
  machines: { entity: 'máquinas', operation: 'fetch' },
  jobs: { entity: 'jobs', operation: 'fetch' },
};

/**
 * Combined hook that fetches all scheduling data in a single place
 * and provides derived data and helper functions.
 * 
 * This reduces duplicate subscriptions and provides a centralized data layer.
 * Includes automatic retry on connection failures and specific error handling.
 */
export function useSchedulingData() {
  const queryClient = useQueryClient();

  // Fetch techniques with longer stale time (they change infrequently)
  const techniquesQuery = useQuery({
    queryKey: ['techniques'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('techniques')
          .select('*')
          .order('name');
        
        if (error) {
          const appError = createAppError(error, ERROR_CONTEXT.techniques);
          if (import.meta.env.DEV) console.error('[useSchedulingData] Techniques fetch failed:', appError);
          throw error;
        }
        return data as DbTechnique[];
      } catch (err) {
        if (import.meta.env.DEV) console.error('[useSchedulingData] Techniques error:', categorizeError(err), err);
        throw err;
      }
    },
    staleTime: STATIC_DATA_STALE_TIME,
    ...RETRY_CONFIG,
  });

  // Fetch machines with longer stale time
  const machinesQuery = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('machines')
          .select('*')
          .eq('is_active', true)
          .order('code');
        
        if (error) {
          const appError = createAppError(error, ERROR_CONTEXT.machines);
          if (import.meta.env.DEV) console.error('[useSchedulingData] Machines fetch failed:', appError);
          throw error;
        }
        return data as DbMachine[];
      } catch (err) {
        if (import.meta.env.DEV) console.error('[useSchedulingData] Machines error:', categorizeError(err), err);
        throw err;
      }
    },
    staleTime: STATIC_DATA_STALE_TIME,
    ...RETRY_CONFIG,
  });

  // Fetch jobs with shorter stale time (they change frequently)
  const jobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          const appError = createAppError(error, ERROR_CONTEXT.jobs);
          if (import.meta.env.DEV) console.error('[useSchedulingData] Jobs fetch failed:', appError);
          throw error;
        }
        return data as DbJob[];
      } catch (err) {
        if (import.meta.env.DEV) console.error('[useSchedulingData] Jobs error:', categorizeError(err), err);
        throw err;
      }
    },
    staleTime: JOBS_STALE_TIME,
    ...RETRY_CONFIG,
  });

  // Single realtime subscription for all tables
  useEffect(() => {
    const channel = supabase
      .channel('scheduling-data-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        () => queryClient.invalidateQueries({ queryKey: ['jobs'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'techniques' },
        () => queryClient.invalidateQueries({ queryKey: ['techniques'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'machines' },
        () => queryClient.invalidateQueries({ queryKey: ['machines'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Pre-build Maps for O(1) lookups instead of O(n) .find()
  const techniquesMap = useMemo(() => {
    const map = new Map<string, DbTechnique>();
    techniquesQuery.data?.forEach(t => map.set(t.id, t));
    return map;
  }, [techniquesQuery.data]);

  const machinesMap = useMemo(() => {
    const map = new Map<string, DbMachine>();
    machinesQuery.data?.forEach(m => map.set(m.id, m));
    return map;
  }, [machinesQuery.data]);

  // Helper functions using O(1) Map lookups
  const getTechniqueById = useCallback((id: string): DbTechnique | undefined => {
    return techniquesMap.get(id);
  }, [techniquesMap]);

  const getMachineById = useCallback((id: string | null): DbMachine | undefined => {
    if (!id) return undefined;
    return machinesMap.get(id);
  }, [machinesMap]);

  const getMachinesByTechnique = useCallback((techniqueId: string): DbMachine[] => {
    return machinesQuery.data?.filter(m => m.technique_id === techniqueId) || [];
  }, [machinesQuery.data]);

  const getJobsByStatus = useCallback((status: DbJob['status']): DbJob[] => {
    return jobsQuery.data?.filter(j => j.status === status) || [];
  }, [jobsQuery.data]);

  const getJobsByMachine = useCallback((machineId: string): DbJob[] => {
    return jobsQuery.data?.filter(j => j.machine_id === machineId) || [];
  }, [jobsQuery.data]);

  const getJobsByTechnique = useCallback((techniqueId: string): DbJob[] => {
    return jobsQuery.data?.filter(j => j.technique_id === techniqueId) || [];
  }, [jobsQuery.data]);

  // Single-pass stats computation (replaces 9+ separate .filter() calls)
  const stats = useMemo(() => {
    const jobs = jobsQuery.data || [];
    const today = new Date().toISOString().split('T')[0];
    
    const result = {
      total: jobs.length,
      completed: 0, inProgress: 0, delayed: 0, queue: 0,
      ready: 0, scheduled: 0, paused: 0, rework: 0, buffer: 0,
      todayScheduled: 0, todayCompleted: 0, todayInProgress: 0, todayDelayed: 0,
      totalPieces: 0, completedPieces: 0, lostPieces: 0,
    };

    for (let i = 0; i < jobs.length; i++) {
      const j = jobs[i];
      const isToday = j.scheduled_date === today;
      
      result.totalPieces += j.quantity;
      result.lostPieces += j.lost_pieces || 0;

      if (isToday) result.todayScheduled++;

      switch (j.status) {
        case 'finished':
          result.completed++;
          result.completedPieces += j.quantity;
          if (isToday) result.todayCompleted++;
          break;
        case 'production':
          result.inProgress++;
          if (isToday) result.todayInProgress++;
          break;
        case 'delayed':
          result.delayed++;
          if (isToday) result.todayDelayed++;
          break;
        case 'queue': result.queue++; break;
        case 'ready': result.ready++; break;
        case 'scheduled': result.scheduled++; break;
        case 'paused': result.paused++; break;
        case 'rework': result.rework++; break;
        case 'buffer': result.buffer++; break;
      }
    }

    return result;
  }, [jobsQuery.data]);

  return {
    // Raw data
    jobs: jobsQuery.data || [],
    techniques: techniquesQuery.data || [],
    machines: machinesQuery.data || [],
    
    // Loading states
    isLoading: jobsQuery.isLoading || techniquesQuery.isLoading || machinesQuery.isLoading,
    isLoadingJobs: jobsQuery.isLoading,
    isLoadingTechniques: techniquesQuery.isLoading,
    isLoadingMachines: machinesQuery.isLoading,
    
    // Error states
    error: jobsQuery.error || techniquesQuery.error || machinesQuery.error,
    
    // Helper functions
    getTechniqueById,
    getMachineById,
    getMachinesByTechnique,
    getJobsByStatus,
    getJobsByMachine,
    getJobsByTechnique,
    
    // Derived stats
    stats,
    
    // Refetch functions
    refetchJobs: jobsQuery.refetch,
    refetchAll: () => {
      jobsQuery.refetch();
      techniquesQuery.refetch();
      machinesQuery.refetch();
    },
    
    // OEE History and Capacity Monitoring
    getOEETrend: (days: number = 14) => {
      const jobs = jobsQuery.data || [];
      const trend = [];
      const now = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayJobs = jobs.filter(j => j.status === 'finished' && j.actual_end_time?.startsWith(dateStr));
        
        if (dayJobs.length === 0) {
          trend.push({ date: dateStr, oee: 0 });
          continue;
        }

        let totalActual = 0, totalEstimated = 0;
        for (const job of dayJobs) {
          if (job.actual_start_time && job.actual_end_time) {
            totalActual += Math.max(0, differenceInMinutes(new Date(job.actual_end_time), new Date(job.actual_start_time)));
          }
          totalEstimated += job.estimated_duration || 60;
        }
        
        const oee = totalActual > 0 ? Math.min(100, (totalEstimated / totalActual) * 100) : 100;
        trend.push({ date: dateStr, oee: Math.round(oee) });
      }
      return trend;
    },
    // Historic bottleneck and capacity trends
    getCapacityTrend: (days: number = 7) => {
      const jobs = jobsQuery.data || [];
      const trend = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayJobs = jobs.filter(j => j.scheduled_date === dateStr);
        const load = dayJobs.reduce((sum, j) => sum + (j.estimated_duration || 0), 0);
        
        trend.push({
          date: dateStr,
          load,
          jobCount: dayJobs.length,
          risk: load > 480 ? 'high' : load > 300 ? 'medium' : 'low'
        });
      }
      return trend;
    }
  };
}

// Export individual hook selectors for backward compatibility
// These use the shared query cache, so there's no duplicate fetching
export function useJobsData() {
  const { jobs, isLoadingJobs, refetchJobs } = useSchedulingData();
  return { data: jobs, isLoading: isLoadingJobs, refetch: refetchJobs };
}

export function useTechniquesData() {
  const { techniques, isLoadingTechniques } = useSchedulingData();
  return { data: techniques, isLoading: isLoadingTechniques };
}

export function useMachinesData() {
  const { machines, isLoadingMachines } = useSchedulingData();
  return { data: machines, isLoading: isLoadingMachines };
}