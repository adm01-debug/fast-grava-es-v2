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
  is_active: boolean;
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
          is_active,
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
        is_active: (item as any).is_active ?? true,
      })) as OperatorWithProfile[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const removeOperatorMutation = useMutation({
    mutationFn: async ({ operatorId, operatorName }: { operatorId: string; operatorName: string | null }) => {
      // Get current user info for audit
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get performer name
      const { data: performerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

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

      // Log the action in audit table
      await supabase
        .from('operator_status_audit')
        .insert({
          operator_id: operatorId,
          operator_name: operatorName,
          action: 'removed',
          performed_by: user.id,
          performed_by_name: performerProfile?.full_name || null,
        } as any);

      return operatorId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] });
      queryClient.invalidateQueries({ queryKey: ['operator-machines'] });
      queryClient.invalidateQueries({ queryKey: ['operator-status-audit'] });
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

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ operatorId, operatorName, isActive }: { operatorId: string; operatorName: string | null; isActive: boolean }) => {
      // Get current user info for audit
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get performer name
      const { data: performerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: isActive } as any)
        .eq('user_id', operatorId)
        .eq('role', 'operator');

      if (error) throw error;

      // Log the action in audit table
      await supabase
        .from('operator_status_audit')
        .insert({
          operator_id: operatorId,
          operator_name: operatorName,
          action: isActive ? 'activated' : 'deactivated',
          performed_by: user.id,
          performed_by_name: performerProfile?.full_name || null,
        } as any);

      return { operatorId, isActive };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operators'] });
      queryClient.invalidateQueries({ queryKey: ['operator-status-audit'] });
      toast({
        title: data.isActive ? 'Operador ativado' : 'Operador desativado',
        description: data.isActive 
          ? 'O operador foi reativado e pode acessar o sistema.'
          : 'O operador foi desativado temporariamente.',
      });
    },
    onError: (error) => {
      console.error('Error toggling operator status:', error);
      toast({
        title: 'Erro ao alterar status',
        description: 'Não foi possível alterar o status do operador.',
        variant: 'destructive',
      });
    },
  });

  return {
    ...query,
    removeOperator: removeOperatorMutation.mutate,
    isRemoving: removeOperatorMutation.isPending,
    toggleActive: toggleActiveMutation.mutate,
    isToggling: toggleActiveMutation.isPending,
  };
}
