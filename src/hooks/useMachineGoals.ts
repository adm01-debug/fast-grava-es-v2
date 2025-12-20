import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MachineGoalWithProgress {
  id: string;
  machine_id: string;
  machine_name?: string;
  machine_code?: string;
  goal_type: 'jobs' | 'pieces' | 'efficiency' | 'utilization';
  target_value: number;
  current_value: number;
  progress_percentage: number;
  period_start: string;
  period_end: string;
}

// Uses operator_goals table structure for machine goals
export function useMachineGoals(machineId?: string) {
  const queryClient = useQueryClient();

  // Calculate machine goals from jobs data
  const { data: goalsWithProgress, isLoading, error } = useQuery({
    queryKey: ['machine-goals', machineId],
    queryFn: async () => {
      // Get machines
      const { data: machines } = await supabase
        .from('machines')
        .select('id, name, code')
        .eq('is_active', true);

      if (!machines) return [];

      const today = new Date().toISOString().split('T')[0];
      const monthStart = today.substring(0, 7) + '-01';

      const goals: MachineGoalWithProgress[] = [];

      for (const machine of machines) {
        if (machineId && machine.id !== machineId) continue;

        // Fetch jobs for this machine this month
        const { data: jobs } = await supabase
          .from('jobs')
          .select('status, quantity, produced_quantity')
          .eq('machine_id', machine.id)
          .gte('scheduled_date', monthStart)
          .lte('scheduled_date', today);

        const completedJobs = jobs?.filter(j => j.status === 'finished').length || 0;
        const totalPieces = jobs?.reduce((sum, j) => sum + (j.produced_quantity || 0), 0) || 0;

        // Default monthly goal: 100 jobs or 10000 pieces
        goals.push({
          id: `${machine.id}-jobs`,
          machine_id: machine.id,
          machine_name: machine.name,
          machine_code: machine.code,
          goal_type: 'jobs',
          target_value: 100,
          current_value: completedJobs,
          progress_percentage: Math.min(100, Math.round((completedJobs / 100) * 100)),
          period_start: monthStart,
          period_end: today,
        });

        goals.push({
          id: `${machine.id}-pieces`,
          machine_id: machine.id,
          machine_name: machine.name,
          machine_code: machine.code,
          goal_type: 'pieces',
          target_value: 10000,
          current_value: totalPieces,
          progress_percentage: Math.min(100, Math.round((totalPieces / 10000) * 100)),
          period_start: monthStart,
          period_end: today,
        });
      }

      return goals;
    },
  });

  const createGoal = () => toast.info('Criação de metas por máquina em breve');
  const updateGoal = () => {};
  const deleteGoal = () => {};

  return {
    goals: goalsWithProgress,
    goalsWithProgress,
    isLoading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  };
}
