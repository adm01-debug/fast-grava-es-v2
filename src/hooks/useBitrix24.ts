import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bitrix24CallWithRetry, LALAMOVE_ENTITY_ID, EXPEDICAO_ENTITY_ID, LALAMOVE_FIELDS, LalamoveItem, fetchLalamoveItems } from './bitrix24Client';
import { withCache } from './cacheManager';
import { toast } from 'sonner';

export function useLalamoveItems(filter?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['lalamove', 'items', filter],
    queryFn: () => withCache(`lalamove-items-${JSON.stringify(filter)}`, () => fetchLalamoveItems(filter), 5 * 60 * 1000),
    staleTime: 2 * 60 * 1000,
    retry: 3,
  });
}

export function useBitrix24CRM<T>(entityTypeId: number, select: string[], filter?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['bitrix24', 'crm', entityTypeId, filter],
    queryFn: async () => {
      const response = await bitrix24CallWithRetry<{ items: T[] }>('crm.item.list', { entityTypeId, select, filter: filter || {} });
      return response.result.items;
    },
    staleTime: 2 * 60 * 1000,
    retry: 3,
  });
}

export function useBitrix24Mutation(entityTypeId: number) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (fields: Record<string, unknown>) => {
      const response = await bitrix24CallWithRetry<{ item: Record<string, unknown> }>('crm.item.add', { entityTypeId, fields });
      return response.result.item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bitrix24', 'crm', entityTypeId] });
      toast.success('Registro criado com sucesso!');
    },
    onError: (error) => toast.error(`Erro ao criar: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, fields }: { id: number; fields: Record<string, unknown> }) => {
      const response = await bitrix24CallWithRetry<{ item: Record<string, unknown> }>('crm.item.update', { entityTypeId, id, fields });
      return response.result.item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bitrix24', 'crm', entityTypeId] });
      toast.success('Registro atualizado!');
    },
    onError: (error) => toast.error(`Erro ao atualizar: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await bitrix24CallWithRetry('crm.item.delete', { entityTypeId, id });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bitrix24', 'crm', entityTypeId] });
      toast.success('Registro excluído!');
    },
    onError: (error) => toast.error(`Erro ao excluir: ${error.message}`),
  });

  return { create: createMutation.mutate, update: updateMutation.mutate, delete: deleteMutation.mutate, isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending };
}
