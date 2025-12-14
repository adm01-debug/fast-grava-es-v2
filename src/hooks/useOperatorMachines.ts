import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OperatorMachine {
  id: string;
  operator_id: string;
  machine_id: string;
  assigned_at: string;
  assigned_by: string | null;
}

export function useOperatorMachines(operatorId?: string) {
  const queryClient = useQueryClient();

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['operator-machines', operatorId],
    queryFn: async () => {
      const query = supabase
        .from('operator_machines')
        .select('*');
      
      if (operatorId) {
        query.eq('operator_id', operatorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OperatorMachine[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const assignMachine = useMutation({
    mutationFn: async ({ operatorId, machineId }: { operatorId: string; machineId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('operator_machines')
        .insert({
          operator_id: operatorId,
          machine_id: machineId,
          assigned_by: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-machines'] });
      toast.success('Máquina atribuída com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atribuir máquina: ' + error.message);
    },
  });

  const unassignMachine = useMutation({
    mutationFn: async ({ operatorId, machineId }: { operatorId: string; machineId: string }) => {
      const { error } = await supabase
        .from('operator_machines')
        .delete()
        .eq('operator_id', operatorId)
        .eq('machine_id', machineId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-machines'] });
      toast.success('Máquina removida com sucesso');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover máquina: ' + error.message);
    },
  });

  const getAssignedMachineIds = (opId: string) => {
    return (assignments || [])
      .filter(a => a.operator_id === opId)
      .map(a => a.machine_id);
  };

  return {
    assignments,
    isLoading,
    assignMachine,
    unassignMachine,
    getAssignedMachineIds,
  };
}
