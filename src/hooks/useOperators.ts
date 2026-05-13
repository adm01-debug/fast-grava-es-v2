import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { showErrorToast, createAppError } from '@/lib/errorHandling';

const OPERATORS_ERROR_CONTEXT = {
  fetch: { entity: 'operators', operation: 'fetch' },
  remove: { entity: 'operators', operation: 'remove' },
  toggleActive: { entity: 'operators', operation: 'toggle_active' },
};

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
      try {
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

        // Type-safe mapping with proper profile extraction
        return (data || []).map(item => {
          const profile = item.profiles as { full_name?: string | null; avatar_url?: string | null; phone?: string | null } | null;
          return {
            id: item.id,
            user_id: item.user_id,
            role: item.role as 'operator',
            full_name: profile?.full_name ?? null,
            avatar_url: profile?.avatar_url ?? null,
            phone: profile?.phone ?? null,
            created_at: item.created_at,
            is_active: item.is_active ?? true,
          };
        }) as OperatorWithProfile[];
      } catch (error) {
        const appError = createAppError(error, OPERATORS_ERROR_CONTEXT.fetch);
        if (import.meta.env.DEV) console.error('[useOperators]', appError);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const removeOperatorMutation = useMutation({
    mutationFn: async ({ operatorId, operatorName, reason }: { operatorId: string; operatorName: string | null; reason?: string }) => {
      // Get current user info for audit
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get performer name
      const { data: performerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

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

      // Log the action in audit table with error handling
      const { error: auditError } = await supabase
        .from('operator_status_audit')
        .insert({
          operator_id: operatorId,
          operator_name: operatorName,
          action: 'removed',
          performed_by: user.id,
          performed_by_name: performerProfile?.full_name || null,
          reason: reason || null,
        });

      if (auditError) {
        // Log audit failure but don't fail the whole operation
        const appError = createAppError(auditError, { entity: 'operator_status_audit', operation: 'insert' });
        if (import.meta.env.DEV) console.error('[removeOperator:audit]', appError);
      }

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
      const appError = createAppError(error, OPERATORS_ERROR_CONTEXT.remove);
      if (import.meta.env.DEV) console.error('[removeOperator]', appError);
      showErrorToast(error, 'Erro ao remover operador');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ operatorId, operatorName, isActive, reason }: { operatorId: string; operatorName: string | null; isActive: boolean; reason?: string }) => {
      // Get current user info for audit
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get performer name
      const { data: performerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: isActive })
        .eq('user_id', operatorId)
        .eq('role', 'operator');

      if (error) throw error;

      // Log the action in audit table with error handling
      const { error: auditError } = await supabase
        .from('operator_status_audit')
        .insert({
          operator_id: operatorId,
          operator_name: operatorName,
          action: isActive ? 'activated' : 'deactivated',
          performed_by: user.id,
          performed_by_name: performerProfile?.full_name || null,
          reason: reason || null,
        });

      if (auditError) {
        // Log audit failure but don't fail the whole operation
        const appError = createAppError(auditError, { entity: 'operator_status_audit', operation: 'insert' });
        if (import.meta.env.DEV) console.error('[toggleActive:audit]', appError);
      }

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
      const appError = createAppError(error, OPERATORS_ERROR_CONTEXT.toggleActive);
      if (import.meta.env.DEV) console.error('[toggleActive]', appError);
      showErrorToast(error, 'Erro ao alterar status do operador');
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
