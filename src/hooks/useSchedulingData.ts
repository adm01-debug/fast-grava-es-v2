import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useMemo, useCallback } from 'react';
import { differenceInMinutes } from 'date-fns';
import { DbJob, DbTechnique, DbMachine } from './useJobs';
import { Database } from '@/integrations/supabase/types';
import { createAppError } from '@/lib/errorHandling';
import { jobsService } from '@/services/jobsService';
import { machinesService } from '@/services/machinesService';

// Stale time for static data (techniques, machines change less frequently)
const STATIC_DATA_STALE_TIME = 15 * 60 * 1000; // 15 minutes (was 5)
const JOBS_STALE_TIME = 45 * 1000; // 45 seconds (was 30)

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

  // Fetch operator profiles
  const profilesQuery = useQuery({
    queryKey: ['operator-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url');

      if (error) {
        console.error('[useSchedulingData] Profiles fetch error:', error);
        throw error;
      }
      return data;
    },
    staleTime: STATIC_DATA_STALE_TIME,
    ...RETRY_CONFIG,
  });

  // Fetch techniques with longer stale time
  const techniquesQuery = useQuery({
    queryKey: ['techniques'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('techniques').select('*').order('name');
        if (error) throw error;
        return data as DbTechnique[];
      } catch (err) {
        throw createAppError(err, ERROR_CONTEXT.techniques);
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
        return await machinesService.getAll();
      } catch (err) {
        throw createAppError(err, ERROR_CONTEXT.machines);
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
          .or(`status.neq.finished,created_at.gt.${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}`)
          .order('created_at', { ascending: false });

        if (error) {
          const appError = createAppError(error, ERROR_CONTEXT.jobs);
          throw error;
        }
        return data as DbJob[];
      } catch (err) {
        throw err;
      }
    },
    staleTime: JOBS_STALE_TIME,
    ...RETRY_CONFIG,
  });

  // Single realtime subscription for all tables
  useEffect(() => {
    let isActive = true;

    const channel = supabase
      .channel('scheduling-data-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        () => isActive && queryClient.invalidateQueries({ queryKey: ['jobs'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'techniques' },
        () => isActive && queryClient.invalidateQueries({ queryKey: ['techniques'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'machines' },
        () => isActive && queryClient.invalidateQueries({ queryKey: ['machines'] })
      )
      .subscribe();

    return () => {
      isActive = false;
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

  const profilesMap = useMemo(() => {
    const map = new Map<string, { id: string; full_name: string | null; avatar_url: string | null }>();
    profilesQuery.data?.forEach(p => map.set(p.id, p));
    return map;
  }, [profilesQuery.data]);

  // Helper functions using O(1) Map lookups
  const getOperatorById = useCallback((id: string | null) => {
    if (!id) return undefined;
    return profilesMap.get(id);
  }, [profilesMap]);

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

      const quantity = Number(j.quantity) || 0;
      result.totalPieces += quantity;
      result.lostPieces += Number(j.lost_pieces) || 0;

      if (isToday) result.todayScheduled++;

      switch (j.status) {
        case 'finished':
          result.completed++;
          result.completedPieces += quantity;
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
    profiles: profilesQuery.data || [],

    // Loading states
    isLoading: jobsQuery.isLoading || techniquesQuery.isLoading || machinesQuery.isLoading,
    isLoadingJobs: jobsQuery.isLoading,
    isLoadingTechniques: techniquesQuery.isLoading,
    isLoadingMachines: machinesQuery.isLoading,

    // Error states
    error: jobsQuery.error || techniquesQuery.error || machinesQuery.error,

    // Helper functions
    getOperatorById,
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

    // OEE History and Capacity Monitoring - Memoized results
    oeeTrend: useMemo(() => {
      const jobs = jobsQuery.data || [];
      const trend = [];
      const now = new Date();
      const days = 14;

      const jobsByDateMap = new Map<string, DbJob[]>();
      jobs.forEach(j => {
        if (j.status === 'finished' && j.actual_end_time) {
          const d = j.actual_end_time.substring(0, 10);
          const list = jobsByDateMap.get(d) || [];
          list.push(j);
          jobsByDateMap.set(d, list);
        }
      });

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayJobs = jobsByDateMap.get(dateStr) || [];

        if (dayJobs.length === 0) {
          trend.push({ date: dateStr, oee: 0 });
          continue;
        }

        let totalActual = 0, totalEstimated = 0;
        for (let j = 0; j < dayJobs.length; j++) {
          const job = dayJobs[j];
          if (job.actual_start_time && job.actual_end_time) {
            totalActual += Math.max(0, differenceInMinutes(new Date(job.actual_end_time), new Date(job.actual_start_time)));
          }
          totalEstimated += Number(job.estimated_duration) || 60;
        }

        const oee = totalActual > 0 ? Math.min(100, (totalEstimated / totalActual) * 100) : 100;
        trend.push({ date: dateStr, oee: Math.round(oee) });
      }
      return trend;
    }, [jobsQuery.data]),

    capacityTrend: useMemo(() => {
      const jobs = jobsQuery.data || [];
      const trend = [];
      const days = 7;

      const jobsByScheduledDateMap = new Map<string, DbJob[]>();
      jobs.forEach(j => {
        if (j.scheduled_date) {
          const d = j.scheduled_date;
          const existing = jobsByScheduledDateMap.get(d) || [];
          existing.push(j);
          jobsByScheduledDateMap.set(d, existing);
        }
      });
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayJobs = jobsByScheduledDateMap.get(dateStr) || [];
        const load = dayJobs.reduce((sum, j) => sum + (j.estimated_duration || 0), 0);

        trend.push({
          date: dateStr,
          load,
          jobCount: dayJobs.length,
          risk: load > 480 ? 'high' : load > 300 ? 'medium' : 'low'
        });
      }
      return trend;
    }, [jobsQuery.data]),
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
