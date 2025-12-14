import { useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, isWithinInterval, parseISO, startOfMonth, endOfMonth } from 'date-fns';

export type GoalType = 'efficiency' | 'jobs_completed' | 'pieces_produced' | 'loss_rate';

export interface OperatorGoal {
  id: string;
  operator_id: string;
  goal_type: GoalType;
  target_value: number;
  period_start: string;
  period_end: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalWithProgress extends OperatorGoal {
  current_value: number;
  progress_percentage: number;
  is_achieved: boolean;
  operator_name?: string;
}

export interface CreateGoalInput {
  operator_id: string;
  goal_type: GoalType;
  target_value: number;
  period_start: string;
  period_end: string;
}

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  efficiency: 'Eficiência (%)',
  jobs_completed: 'Jobs Concluídos',
  pieces_produced: 'Peças Produzidas',
  loss_rate: 'Taxa de Perda (%)',
};

export const GOAL_TYPE_ICONS: Record<GoalType, string> = {
  efficiency: 'gauge',
  jobs_completed: 'check-circle',
  pieces_produced: 'package',
  loss_rate: 'alert-triangle',
};

export function useOperatorGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all goals
  const { data: goals, isLoading } = useQuery({
    queryKey: ['operator-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operator_goals')
        .select('*')
        .order('period_start', { ascending: false });

      if (error) throw error;
      return (data || []) as OperatorGoal[];
    },
    staleTime: 1000 * 60 * 2,
  });

  // Subscribe to realtime updates for operator goals
  useEffect(() => {
    const channel = supabase
      .channel('operator-goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operator_goals'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['operator-goals'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      const { data, error } = await supabase
        .from('operator_goals')
        .insert({
          operator_id: input.operator_id,
          goal_type: input.goal_type,
          target_value: input.target_value,
          period_start: input.period_start,
          period_end: input.period_end,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-goals'] });
      toast.success('Meta criada com sucesso');
    },
    onError: (error) => {
      console.error('Error creating goal:', error);
      toast.error('Erro ao criar meta');
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OperatorGoal> & { id: string }) => {
      const { data, error } = await supabase
        .from('operator_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-goals'] });
      toast.success('Meta atualizada com sucesso');
    },
    onError: (error) => {
      console.error('Error updating goal:', error);
      toast.error('Erro ao atualizar meta');
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('operator_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-goals'] });
      toast.success('Meta removida com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting goal:', error);
      toast.error('Erro ao remover meta');
    },
  });

  // Get active goals (current period)
  const activeGoals = useMemo(() => {
    if (!goals) return [];
    const today = new Date();
    return goals.filter(goal => {
      const start = parseISO(goal.period_start);
      const end = parseISO(goal.period_end);
      return isWithinInterval(today, { start, end });
    });
  }, [goals]);

  // Get goals by operator
  const getGoalsByOperator = (operatorId: string) => {
    return activeGoals.filter(goal => goal.operator_id === operatorId);
  };

  // Get current month period helper
  const getCurrentMonthPeriod = () => {
    const now = new Date();
    return {
      start: format(startOfMonth(now), 'yyyy-MM-dd'),
      end: format(endOfMonth(now), 'yyyy-MM-dd'),
    };
  };

  return {
    goals: goals || [],
    activeGoals,
    isLoading,
    getGoalsByOperator,
    getCurrentMonthPeriod,
    createGoal: createGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    deleteGoal: deleteGoalMutation.mutate,
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
  };
}

// Helper to calculate progress for a goal
export function calculateGoalProgress(
  goal: OperatorGoal,
  currentValue: number
): GoalWithProgress {
  let progress_percentage: number;
  let is_achieved: boolean;

  if (goal.goal_type === 'loss_rate') {
    // For loss rate, lower is better
    progress_percentage = goal.target_value > 0 
      ? Math.max(0, Math.min(100, ((goal.target_value - currentValue) / goal.target_value) * 100 + 100))
      : currentValue === 0 ? 100 : 0;
    is_achieved = currentValue <= goal.target_value;
  } else {
    // For other metrics, higher is better
    progress_percentage = goal.target_value > 0 
      ? Math.min(100, (currentValue / goal.target_value) * 100)
      : 0;
    is_achieved = currentValue >= goal.target_value;
  }

  return {
    ...goal,
    current_value: currentValue,
    progress_percentage: Math.round(progress_percentage * 10) / 10,
    is_achieved,
  };
}
