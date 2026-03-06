import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';

export interface Achievement {
  id: string;
  operator_id: string;
  achievement_type: string;
  achievement_name: string;
  description: string | null;
  icon: string;
  points: number;
  achieved_at: string;
  period_start?: string;
  period_end?: string;
}

export interface OperatorRanking {
  id: string;
  operator_id: string;
  ranking_type: string;
  position: number;
  total_points: number;
  total_produced: number;
  efficiency_rate: number | null;
  quality_rate: number | null;
  period_start: string;
  period_end: string;
  calculated_at: string;
  profile?: { full_name: string | null };
}

export function useGamification(period: 'daily' | 'weekly' | 'monthly' = 'weekly') {
  const queryClient = useQueryClient();
  const now = new Date();
  
  let periodStart: Date;
  let periodEnd: Date;
  
  if (period === 'daily') {
    periodStart = startOfDay(now);
    periodEnd = endOfDay(now);
  } else if (period === 'weekly') {
    periodStart = startOfWeek(now, { weekStartsOn: 1 });
    periodEnd = endOfWeek(now, { weekStartsOn: 1 });
  } else {
    periodStart = startOfMonth(now);
    periodEnd = endOfMonth(now);
  }

  // Fetch rankings from database (persisted)
  const rankingsQuery = useQuery({
    queryKey: ['operator-rankings', period],
    queryFn: async () => {
      // First try to get persisted rankings
      const { data: rankings, error } = await supabase
        .from('operator_rankings')
        .select('*')
        .eq('ranking_type', period)
        .gte('period_start', periodStart.toISOString())
        .lte('period_end', periodEnd.toISOString())
        .order('position', { ascending: true });

      if (error) throw error;

      // Get profiles for operator names
      const operatorIds = rankings?.map(r => r.operator_id) || [];
      
      if (operatorIds.length === 0) {
        // No persisted rankings, calculate on the fly
        return await calculateRankingsLocally(periodStart, periodEnd, period);
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', operatorIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return rankings?.map(r => ({
        ...r,
        profile: profileMap.get(r.operator_id) || { full_name: `Operador ${r.position}` },
      })) as OperatorRanking[];
    },
    staleTime: 60000,
  });

  // Fetch achievements
  const achievementsQuery = useQuery({
    queryKey: ['operator-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operator_achievements')
        .select('*')
        .order('achieved_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as Achievement[];
    },
    staleTime: 60000,
  });

  // Mutation to trigger ranking calculation
  const calculateRankingsMutation = useMutation({
    mutationFn: async (rankingType: 'daily' | 'weekly' | 'monthly') => {
      const { data, error } = await supabase.functions.invoke('calculate-rankings', {
        body: { ranking_type: rankingType },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Rankings ${period} calculados: ${data.rankings_count} operadores`);
      queryClient.invalidateQueries({ queryKey: ['operator-rankings'] });
      queryClient.invalidateQueries({ queryKey: ['operator-achievements'] });
    },
    onError: (error) => {
      if (import.meta.env.DEV) console.error('Error calculating rankings:', error);
      toast.error('Erro ao calcular rankings');
    },
  });

  return {
    rankings: rankingsQuery.data || [],
    achievements: achievementsQuery.data || [],
    isLoading: rankingsQuery.isLoading || achievementsQuery.isLoading,
    periodStart,
    periodEnd,
    calculateRankings: () => calculateRankingsMutation.mutate(period),
    isCalculating: calculateRankingsMutation.isPending,
  };
}

// Local calculation fallback when no persisted rankings exist
async function calculateRankingsLocally(
  periodStart: Date, 
  periodEnd: Date, 
  period: string
): Promise<OperatorRanking[]> {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'finished')
    .gte('actual_end_time', periodStart.toISOString())
    .lte('actual_end_time', periodEnd.toISOString());

  const { data: assignments } = await supabase
    .from('operator_machines')
    .select('operator_id, machine_id');

  const { data: profiles } = await supabase.from('profiles').select('id, full_name');

  // Build machine to operator map
  const machineToOperator: Record<string, string> = {};
  (assignments || []).forEach((a) => {
    machineToOperator[a.machine_id] = a.operator_id;
  });

  // Aggregate stats by operator
  const operatorStats: Record<string, { produced: number; quantity: number; lost: number; jobs: number }> = {};

  (jobs || []).forEach(job => {
    const operatorId = machineToOperator[job.machine_id] || job.machine_id;
    if (!operatorId) return;

    if (!operatorStats[operatorId]) {
      operatorStats[operatorId] = { produced: 0, quantity: 0, lost: 0, jobs: 0 };
    }
    operatorStats[operatorId].produced += job.produced_quantity || 0;
    operatorStats[operatorId].quantity += job.quantity || 0;
    operatorStats[operatorId].lost += job.lost_pieces || 0;
    operatorStats[operatorId].jobs += 1;
  });

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  const rankings: OperatorRanking[] = Object.entries(operatorStats)
    .map(([id, stats]) => {
      const efficiency = stats.quantity > 0 ? (stats.produced / stats.quantity) * 100 : 0;
      const quality = (stats.produced + stats.lost) > 0 
        ? (stats.produced / (stats.produced + stats.lost)) * 100 
        : 100;
      
      return {
        id: crypto.randomUUID(),
        operator_id: id,
        ranking_type: period,
        position: 0,
        total_points: Math.round(stats.produced + efficiency * 10 + quality * 5 + stats.jobs * 2),
        total_produced: stats.produced,
        efficiency_rate: Math.round(efficiency * 100) / 100,
        quality_rate: Math.round(quality * 100) / 100,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        calculated_at: new Date().toISOString(),
        profile: profileMap.get(id) || { full_name: `Operador` },
      };
    })
    .sort((a, b) => b.total_points - a.total_points)
    .map((r, i) => ({ ...r, position: i + 1 }));

  return rankings;
}
