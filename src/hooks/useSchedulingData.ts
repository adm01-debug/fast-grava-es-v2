import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useMemo, useCallback } from 'react';
import { DbJob, DbTechnique, DbMachine } from './useJobs';

// Stale time for static data (techniques, machines change less frequently)
const STATIC_DATA_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const JOBS_STALE_TIME = 30 * 1000; // 30 seconds

/**
 * Combined hook that fetches all scheduling data in a single place
 * and provides derived data and helper functions.
 * 
 * This reduces duplicate subscriptions and provides a centralized data layer.
 */
export function useSchedulingData() {
  const queryClient = useQueryClient();

  // Fetch techniques with longer stale time (they change infrequently)
  const techniquesQuery = useQuery({
    queryKey: ['techniques'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('techniques')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as DbTechnique[];
    },
    staleTime: STATIC_DATA_STALE_TIME,
  });

  // Fetch machines with longer stale time
  const machinesQuery = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .eq('is_active', true)
        .order('code');
      
      if (error) throw error;
      return data as DbMachine[];
    },
    staleTime: STATIC_DATA_STALE_TIME,
  });

  // Fetch jobs with shorter stale time (they change frequently)
  const jobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DbJob[];
    },
    staleTime: JOBS_STALE_TIME,
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

  // Helper functions memoized
  const getTechniqueById = useCallback((id: string): DbTechnique | undefined => {
    return techniquesQuery.data?.find(t => t.id === id);
  }, [techniquesQuery.data]);

  const getMachineById = useCallback((id: string | null): DbMachine | undefined => {
    if (!id) return undefined;
    return machinesQuery.data?.find(m => m.id === id);
  }, [machinesQuery.data]);

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

  // Derived stats
  const stats = useMemo(() => {
    const jobs = jobsQuery.data || [];
    const today = new Date().toISOString().split('T')[0];
    const todayJobs = jobs.filter(j => j.scheduled_date === today);

    return {
      total: jobs.length,
      completed: jobs.filter(j => j.status === 'finished').length,
      inProgress: jobs.filter(j => j.status === 'production').length,
      delayed: jobs.filter(j => j.status === 'delayed').length,
      queue: jobs.filter(j => j.status === 'queue').length,
      ready: jobs.filter(j => j.status === 'ready').length,
      scheduled: jobs.filter(j => j.status === 'scheduled').length,
      paused: jobs.filter(j => j.status === 'paused').length,
      rework: jobs.filter(j => j.status === 'rework').length,
      todayScheduled: todayJobs.length,
      todayCompleted: todayJobs.filter(j => j.status === 'finished').length,
      todayInProgress: todayJobs.filter(j => j.status === 'production').length,
      todayDelayed: todayJobs.filter(j => j.status === 'delayed').length,
      totalPieces: jobs.reduce((sum, j) => sum + j.quantity, 0),
      completedPieces: jobs.filter(j => j.status === 'finished').reduce((sum, j) => sum + j.quantity, 0),
      lostPieces: jobs.reduce((sum, j) => sum + (j.lost_pieces || 0), 0),
    };
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