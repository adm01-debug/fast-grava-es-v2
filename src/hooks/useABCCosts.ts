import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ABCActivity {
  id: string;
  name: string;
  description: string | null;
  cost_driver: string;
  technique_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ABCCostPool {
  id: string;
  name: string;
  description: string | null;
  pool_type: string;
  monthly_budget: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ABCActivityRate {
  id: string;
  activity_id: string;
  cost_pool_id: string;
  rate_per_unit: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
  activity?: ABCActivity;
  cost_pool?: ABCCostPool;
}

export interface ABCJobCost {
  id: string;
  job_id: string;
  activity_id: string;
  cost_pool_id: string;
  driver_quantity: number;
  unit_rate: number;
  total_cost: number;
  calculated_at: string;
  created_at: string;
  activity?: ABCActivity;
  cost_pool?: ABCCostPool;
}

export interface JobCostSummary {
  job_id: string;
  order_number: string;
  client: string;
  product: string;
  technique_id: string;
  quantity: number;
  total_cost: number;
  unit_cost: number;
  cost_breakdown: {
    pool_type: string;
    pool_name: string;
    amount: number;
    percentage: number;
  }[];
}

export interface TechniqueCostSummary {
  technique_id: string;
  technique_name: string;
  total_jobs: number;
  total_quantity: number;
  total_cost: number;
  avg_unit_cost: number;
  cost_by_pool: {
    pool_type: string;
    amount: number;
    percentage: number;
  }[];
}

export function useABCCosts() {
  const queryClient = useQueryClient();

  // Fetch activities
  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ['abc-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('abc_activities')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as ABCActivity[];
    },
  });

  // Fetch cost pools
  const { data: costPools = [], isLoading: loadingPools } = useQuery({
    queryKey: ['abc-cost-pools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('abc_cost_pools')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as ABCCostPool[];
    },
  });

  // Fetch activity rates
  const { data: activityRates = [], isLoading: loadingRates } = useQuery({
    queryKey: ['abc-activity-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('abc_activity_rates')
        .select('*')
        .order('period_start', { ascending: false });
      
      if (error) throw error;
      return data as ABCActivityRate[];
    },
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

  // Calculate job cost summary
  const getJobCostSummary = (jobId: string): JobCostSummary | null => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return null;

    const costs = jobCosts.filter(jc => jc.job_id === jobId);
    const totalCost = costs.reduce((sum, c) => sum + Number(c.total_cost), 0);
    
    const costByPool = costPools.map(pool => {
      const poolCosts = costs.filter(c => c.cost_pool_id === pool.id);
      const amount = poolCosts.reduce((sum, c) => sum + Number(c.total_cost), 0);
      return {
        pool_type: pool.pool_type,
        pool_name: pool.name,
        amount,
        percentage: totalCost > 0 ? (amount / totalCost) * 100 : 0,
      };
    }).filter(p => p.amount > 0);

    return {
      job_id: job.id,
      order_number: job.order_number,
      client: job.client,
      product: job.product,
      technique_id: job.technique_id,
      quantity: job.quantity,
      total_cost: totalCost,
      unit_cost: job.quantity > 0 ? totalCost / job.quantity : 0,
      cost_breakdown: costByPool,
    };
  };

  // Calculate technique cost summary
  const getTechniqueCostSummary = (): TechniqueCostSummary[] => {
    return techniques.map(technique => {
      const techniqueJobs = jobs.filter(j => j.technique_id === technique.id);
      const techniqueJobIds = techniqueJobs.map(j => j.id);
      const techniqueCosts = jobCosts.filter(jc => techniqueJobIds.includes(jc.job_id));
      
      const totalCost = techniqueCosts.reduce((sum, c) => sum + Number(c.total_cost), 0);
      const totalQuantity = techniqueJobs.reduce((sum, j) => sum + (j.produced_quantity ?? j.quantity ?? 0), 0);

      const costByPool = costPools.map(pool => {
        const poolCosts = techniqueCosts.filter(c => c.cost_pool_id === pool.id);
        const amount = poolCosts.reduce((sum, c) => sum + Number(c.total_cost), 0);
        return {
          pool_type: pool.pool_type,
          amount,
          percentage: totalCost > 0 ? (amount / totalCost) * 100 : 0,
        };
      }).filter(p => p.amount > 0);

      return {
        technique_id: technique.id,
        technique_name: technique.name,
        total_jobs: techniqueJobs.length,
        total_quantity: totalQuantity,
        total_cost: totalCost,
        avg_unit_cost: totalQuantity > 0 ? totalCost / totalQuantity : 0,
        cost_by_pool: costByPool,
      };
    }).filter(t => t.total_jobs > 0);
  };

  // Calculate cost for a job
  const calculateJobCost = useMutation({
    mutationFn: async (jobId: string) => {
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job não encontrado');

      const technique = techniques.find(t => t.id === job.technique_id);
      const now = new Date().toISOString().split('T')[0];

      // Get current rates
      const currentRates = activityRates.filter(
        r => r.period_start <= now && r.period_end >= now
      );

      // Delete existing costs for this job
      await supabase.from('abc_job_costs').delete().eq('job_id', jobId);

      // Calculate production duration in hours
      const durationHours = job.actual_start_time && job.actual_end_time
        ? (new Date(job.actual_end_time).getTime() - new Date(job.actual_start_time).getTime()) / (1000 * 60 * 60)
        : job.estimated_duration / 60;

      // Calculate costs for each activity
      const newCosts: Omit<ABCJobCost, 'id' | 'created_at'>[] = [];

      for (const activity of activities) {
        const activityRate = currentRates.find(r => r.activity_id === activity.id);
        if (!activityRate) continue;

        let driverQuantity = 0;
        switch (activity.cost_driver) {
          case 'machine_hours':
            driverQuantity = durationHours;
            break;
          case 'setup_count':
            driverQuantity = 1; // One setup per job
            break;
          case 'quantity':
            driverQuantity = job.produced_quantity ?? job.quantity ?? 0;
            break;
          case 'labor_hours':
            driverQuantity = durationHours * 1.2; // Labor includes prep time
            break;
          default:
            driverQuantity = 1;
        }

        const totalCost = driverQuantity * Number(activityRate.rate_per_unit);

        newCosts.push({
          job_id: jobId,
          activity_id: activity.id,
          cost_pool_id: activityRate.cost_pool_id,
          driver_quantity: driverQuantity,
          unit_rate: Number(activityRate.rate_per_unit),
          total_cost: totalCost,
          calculated_at: new Date().toISOString(),
        });
      }

      if (newCosts.length > 0) {
        const { error } = await supabase.from('abc_job_costs').insert(newCosts);
        if (error) throw error;
      }

      return newCosts;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abc-job-costs'] });
      toast.success('Custo do job calculado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao calcular custo: ' + error.message);
    },
  });

  // Calculate costs for all jobs
  const calculateAllJobsCosts = useMutation({
    mutationFn: async () => {
      let calculated = 0;
      for (const job of jobs) {
        await calculateJobCost.mutateAsync(job.id);
        calculated++;
      }
      return calculated;
    },
    onSuccess: (count) => {
      toast.success(`Custos calculados para ${count} jobs`);
    },
  });

  // Update activity rate
  const updateActivityRate = useMutation({
    mutationFn: async (data: {
      activity_id: string;
      cost_pool_id: string;
      rate_per_unit: number;
      period_start: string;
      period_end: string;
    }) => {
      const { error } = await supabase.from('abc_activity_rates').upsert({
        ...data,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'activity_id,cost_pool_id,period_start',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abc-activity-rates'] });
      toast.success('Taxa atualizada com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar taxa: ' + error.message);
    },
  });

  // Update cost pool budget
  const updateCostPoolBudget = useMutation({
    mutationFn: async (data: { id: string; monthly_budget: number }) => {
      const { error } = await supabase
        .from('abc_cost_pools')
        .update({ monthly_budget: data.monthly_budget })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abc-cost-pools'] });
      toast.success('Orçamento atualizado');
    },
  });

  // Calculate totals
  const totalBudget = costPools.reduce((sum, p) => sum + Number(p.monthly_budget), 0);
  const totalAllocatedCost = jobCosts.reduce((sum, c) => sum + Number(c.total_cost), 0);
  const totalPiecesProduced = jobs.reduce((sum, j) => sum + (j.produced_quantity ?? j.quantity ?? 0), 0);
  const averageUnitCost = totalPiecesProduced > 0
    ? totalAllocatedCost / totalPiecesProduced
    : 0;

  return {
    // Data
    activities,
    costPools,
    activityRates,
    jobCosts,
    jobs,
    techniques,
    
    // Loading states
    isLoading: loadingActivities || loadingPools || loadingRates || loadingJobCosts,
    
    // Calculations
    getJobCostSummary,
    getTechniqueCostSummary,
    totalBudget,
    totalAllocatedCost,
    averageUnitCost,
    
    // Mutations
    calculateJobCost,
    calculateAllJobsCosts,
    updateActivityRate,
    updateCostPoolBudget,
  };
}
