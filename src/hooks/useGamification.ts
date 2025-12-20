import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

export interface Achievement {
  id: string;
  operator_id: string;
  achievement_type: string;
  achievement_name: string;
  description: string | null;
  icon: string;
  points: number;
  achieved_at: string;
}

export interface OperatorRanking {
  id: string;
  operator_id: string;
  ranking_type: string;
  position: number;
  total_points: number;
  total_produced: number;
  efficiency_rate: number;
  quality_rate: number;
  profile?: { full_name: string | null };
}

export function useGamification(period: 'daily' | 'weekly' | 'monthly' = 'weekly') {
  const now = new Date();
  const periodStart = period === 'weekly' 
    ? startOfWeek(now, { weekStartsOn: 1 }) 
    : period === 'monthly' 
      ? startOfMonth(now) 
      : now;
  const periodEnd = period === 'weekly' 
    ? endOfWeek(now, { weekStartsOn: 1 }) 
    : period === 'monthly' 
      ? endOfMonth(now) 
      : now;

  const rankingsQuery = useQuery({
    queryKey: ['operator-rankings', period],
    queryFn: async () => {
      // Calculate rankings from jobs data
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'completed')
        .gte('actual_end_time', periodStart.toISOString())
        .lte('actual_end_time', periodEnd.toISOString());

      const { data: profiles } = await supabase.from('profiles').select('*');

      // Group by operator (using machine_id as proxy)
      const operatorStats: Record<string, { produced: number; quantity: number; lost: number }> = {};
      
      (jobs || []).forEach(job => {
        const key = job.machine_id || 'unknown';
        if (!operatorStats[key]) {
          operatorStats[key] = { produced: 0, quantity: 0, lost: 0 };
        }
        operatorStats[key].produced += job.produced_quantity || 0;
        operatorStats[key].quantity += job.quantity || 0;
        operatorStats[key].lost += job.lost_pieces || 0;
      });

      const rankings: OperatorRanking[] = Object.entries(operatorStats)
        .map(([id, stats], index) => {
          const profile = (profiles || [])[index % (profiles?.length || 1)];
          const efficiency = stats.quantity > 0 ? (stats.produced / stats.quantity) * 100 : 0;
          const quality = (stats.produced + stats.lost) > 0 
            ? (stats.produced / (stats.produced + stats.lost)) * 100 
            : 100;
          
          return {
            id: crypto.randomUUID(),
            operator_id: id,
            ranking_type: period,
            position: 0,
            total_points: Math.round(stats.produced + efficiency * 10 + quality * 5),
            total_produced: stats.produced,
            efficiency_rate: efficiency,
            quality_rate: quality,
            profile: { full_name: profile?.full_name || `Operador ${index + 1}` },
          };
        })
        .sort((a, b) => b.total_points - a.total_points)
        .map((r, i) => ({ ...r, position: i + 1 }));

      return rankings;
    },
    staleTime: 60000,
  });

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

  return {
    rankings: rankingsQuery.data || [],
    achievements: achievementsQuery.data || [],
    isLoading: rankingsQuery.isLoading || achievementsQuery.isLoading,
    periodStart,
    periodEnd,
  };
}
