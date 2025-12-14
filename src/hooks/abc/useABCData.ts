import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { categorizeError } from '@/lib/errorHandling';
import { defaultQueryOptions, STALE_TIMES } from '@/lib/queryConfig';
import { ABCActivity, ABCCostPool, ABCActivityRate, ABCJobCost, ABC_ERROR_CONTEXT } from './types';

export function useABCData() {
  // Fetch activities
  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ['abc-activities'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('abc_activities')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (error) {
          console.error('[useABCCosts] activities fetch failed:', categorizeError(error), error);
          throw error;
        }
        return data as ABCActivity[];
      } catch (err) {
        console.error('[useABCCosts] activities error:', err);
        throw err;
      }
    },
    staleTime: STALE_TIMES.STATIC,
    ...defaultQueryOptions,
  });

  // Fetch cost pools
  const { data: costPools = [], isLoading: loadingPools } = useQuery({
    queryKey: ['abc-cost-pools'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('abc_cost_pools')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (error) {
          console.error('[useABCCosts] pools fetch failed:', categorizeError(error), error);
          throw error;
        }
        return data as ABCCostPool[];
      } catch (err) {
        console.error('[useABCCosts] pools error:', err);
        throw err;
      }
    },
    staleTime: STALE_TIMES.STATIC,
    ...defaultQueryOptions,
  });

  // Fetch activity rates
  const { data: activityRates = [], isLoading: loadingRates } = useQuery({
    queryKey: ['abc-activity-rates'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('abc_activity_rates')
          .select('*')
          .order('period_start', { ascending: false });
        
        if (error) {
          console.error('[useABCCosts] rates fetch failed:', categorizeError(error), error);
          throw error;
        }
        return data as ABCActivityRate[];
      } catch (err) {
        console.error('[useABCCosts] rates error:', err);
        throw err;
      }
    },
    staleTime: STALE_TIMES.STATIC,
    ...defaultQueryOptions,
  });

  // Fetch job costs
  const { data: jobCosts = [], isLoading: loadingJobCosts } = useQuery({
    queryKey: ['abc-job-costs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('abc_job_costs')
        .select('*')
        .order('calculated_at', { ascending: false });
      
      if (error) throw error;
      return data as ABCJobCost[];
    },
    staleTime: STALE_TIMES.DYNAMIC,
    ...defaultQueryOptions,
  });

  // Fetch jobs for cost calculation
  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs-for-abc'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .in('status', ['finished', 'production'])
        .order('updated_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch techniques
  const { data: techniques = [] } = useQuery({
    queryKey: ['techniques-for-abc'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('techniques')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  return {
    activities,
    costPools,
    activityRates,
    jobCosts,
    jobs,
    techniques,
    isLoading: loadingActivities || loadingPools || loadingRates || loadingJobCosts,
  };
}
