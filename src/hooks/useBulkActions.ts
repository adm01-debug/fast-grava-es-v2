import { useState, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type BulkActionType = 'delete' | 'archive' | 'restore' | 'update' | 'export';

export interface BulkActionConfig {
  type: BulkActionType;
  label: string;
  icon?: string;
  confirmMessage?: string;
  requireConfirm?: boolean;
}

export interface UseBulkActionsOptions<T> {
  tableName: string;
  queryKey: string[];
  idField?: keyof T;
  onSuccess?: (action: BulkActionType, count: number) => void;
  onError?: (error: Error) => void;
}

export function useBulkActions<T extends { id: string }>(
  options: UseBulkActionsOptions<T>
) {
  const { tableName, queryKey, idField = 'id', onSuccess, onError } = options;
  const queryClient = useQueryClient();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedCount = selectedIds.size;

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  // Bulk Delete
  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .in(idField as string, ids);
      
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey });
      clearSelection();
      toast.success(`${count} registros excluídos`);
      onSuccess?.('delete', count);
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir registros');
      onError?.(error);
    },
  });

  // Bulk Soft Delete (Archive)
  const bulkArchive = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from(tableName)
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .in(idField as string, ids);
      
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey });
      clearSelection();
      toast.success(`${count} registros arquivados`);
      onSuccess?.('archive', count);
    },
    onError: (error: Error) => {
      toast.error('Erro ao arquivar registros');
      onError?.(error);
    },
  });

  // Bulk Restore
  const bulkRestore = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from(tableName)
        .update({ deleted_at: null, is_active: true })
        .in(idField as string, ids);
      
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey });
      clearSelection();
      toast.success(`${count} registros restaurados`);
      onSuccess?.('restore', count);
    },
    onError: (error: Error) => {
      toast.error('Erro ao restaurar registros');
      onError?.(error);
    },
  });

  // Bulk Update
  const bulkUpdate = useMutation({
    mutationFn: async ({ ids, data }: { ids: string[]; data: Partial<T> }) => {
      const { error } = await supabase
        .from(tableName)
        .update(data)
        .in(idField as string, ids);
      
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey });
      clearSelection();
      toast.success(`${count} registros atualizados`);
      onSuccess?.('update', count);
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar registros');
      onError?.(error);
    },
  });

  const executeAction = useCallback(async (
    action: BulkActionType,
    updateData?: Partial<T>
  ) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      toast.warning('Nenhum registro selecionado');
      return;
    }

    setIsProcessing(true);
    try {
      switch (action) {
        case 'delete':
          await bulkDelete.mutateAsync(ids);
          break;
        case 'archive':
          await bulkArchive.mutateAsync(ids);
          break;
        case 'restore':
          await bulkRestore.mutateAsync(ids);
          break;
        case 'update':
          if (updateData) {
            await bulkUpdate.mutateAsync({ ids, data: updateData });
          }
          break;
      }
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, bulkDelete, bulkArchive, bulkRestore, bulkUpdate]);

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount,
    isProcessing,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    executeAction,
    bulkDelete: (ids?: string[]) => bulkDelete.mutate(ids ?? Array.from(selectedIds)),
    bulkArchive: (ids?: string[]) => bulkArchive.mutate(ids ?? Array.from(selectedIds)),
    bulkRestore: (ids?: string[]) => bulkRestore.mutate(ids ?? Array.from(selectedIds)),
    bulkUpdate: (data: Partial<T>, ids?: string[]) => 
      bulkUpdate.mutate({ ids: ids ?? Array.from(selectedIds), data }),
  };
}
