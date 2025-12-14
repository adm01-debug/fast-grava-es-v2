import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface OperatorWithProfile {
  id: string;
  user_id: string;
  role: 'coordinator' | 'operator' | 'manager';
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}

export function useOperators() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          created_at,
          profiles!inner (
            full_name,
            avatar_url,
            phone
          )
        `)
        .eq('role', 'operator');

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        role: item.role as 'operator',
        full_name: (item.profiles as any)?.full_name || null,
        avatar_url: (item.profiles as any)?.avatar_url || null,
        phone: (item.profiles as any)?.phone || null,
        created_at: item.created_at,
      })) as OperatorWithProfile[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const removeOperatorMutation = useMutation({
    mutationFn: async (operatorId: string) => {
      // First, remove all machine assignments for this operator
      const { error: assignmentsError } = await supabase
        .from('operator_machines')
        .delete()
        .eq('operator_id', operatorId);

      if (assignmentsError) throw assignmentsError;

      // Then, remove the operator role (this effectively removes them as operator)
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', operatorId)
        .eq('role', 'operator');

      if (roleError) throw roleError;

      return operatorId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] });
      queryClient.invalidateQueries({ queryKey: ['operator-machines'] });
      toast({
        title: 'Operador removido',
        description: 'O operador foi removido do sistema com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error removing operator:', error);
      toast({
        title: 'Erro ao remover operador',
        description: 'Não foi possível remover o operador. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  return {
    ...query,
    removeOperator: removeOperatorMutation.mutate,
    isRemoving: removeOperatorMutation.isPending,
  };
}
