import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// ============================================
// OPTIMISTIC UPDATE HOOK
// ============================================

interface OptimisticOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, rollback: () => void) => void;
  onSettled?: () => void;
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
}

export function useOptimisticUpdate<T, TInput>(
  currentData: T,
  updateFn: (data: T, input: TInput) => T,
  asyncFn: (input: TInput) => Promise<T>,
  options: OptimisticOptions<T> = {}
) {
  const [data, setData] = useState<T>(currentData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const previousDataRef = useRef<T>(currentData);

  const {
    onSuccess,
    onError,
    onSettled,
    successMessage = 'Alterações salvas!',
    errorMessage = 'Erro ao salvar. Alterações revertidas.',
    showToast = true,
  } = options;

  const execute = useCallback(async (input: TInput) => {
    // Store previous data for rollback
    previousDataRef.current = data;
    
    // Optimistically update
    const optimisticData = updateFn(data, input);
    setData(optimisticData);
    setIsLoading(true);
    setError(null);

    try {
      // Execute the actual async operation
      const result = await asyncFn(input);
      
      // Update with server response
      setData(result);
      
      if (showToast) {
        toast.success(successMessage);
      }
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      // Rollback to previous data
      setData(previousDataRef.current);
      setError(error);
      
      if (showToast) {
        toast.error(errorMessage, {
          action: {
            label: 'Tentar novamente',
            onClick: () => execute(input),
          },
        });
      }
      
      onError?.(error, () => setData(previousDataRef.current));
      throw error;
    } finally {
      setIsLoading(false);
      onSettled?.();
    }
  }, [data, updateFn, asyncFn, onSuccess, onError, onSettled, successMessage, errorMessage, showToast]);

  const rollback = useCallback(() => {
    setData(previousDataRef.current);
  }, []);

  const reset = useCallback(() => {
    setData(currentData);
    setError(null);
  }, [currentData]);

  return {
    data,
    isLoading,
    error,
    execute,
    rollback,
    reset,
    setData,
  };
}

// ============================================
// OPTIMISTIC LIST HOOK
// ============================================

interface ListItem {
  id: string;
  [key: string]: unknown;
}

interface OptimisticListOptions<T> {
  onAdd?: (item: T) => void;
  onUpdate?: (item: T) => void;
  onRemove?: (id: string) => void;
  onError?: (error: Error) => void;
}

export function useOptimisticList<T extends ListItem>(
  initialItems: T[],
  options: OptimisticListOptions<T> = {}
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  const previousItemsRef = useRef<T[]>(initialItems);

  const { onAdd, onUpdate, onRemove, onError } = options;

  // Add item optimistically
  const addItem = useCallback(async (
    newItem: T,
    asyncFn: (item: T) => Promise<T>
  ) => {
    previousItemsRef.current = items;
    
    // Add with temporary flag
    const tempItem = { ...newItem, _pending: true } as T;
    setItems(prev => [...prev, tempItem]);
    setPendingOperations(prev => new Set(prev).add(newItem.id));

    try {
      const result = await asyncFn(newItem);
      
      // Replace temp item with actual result
      setItems(prev => prev.map(item => 
        item.id === newItem.id ? result : item
      ));
      
      onAdd?.(result);
      toast.success('Item adicionado!');
      return result;
    } catch (err) {
      // Rollback
      setItems(previousItemsRef.current);
      const error = err instanceof Error ? err : new Error('Failed to add');
      onError?.(error);
      toast.error('Erro ao adicionar item');
      throw error;
    } finally {
      setPendingOperations(prev => {
        const next = new Set(prev);
        next.delete(newItem.id);
        return next;
      });
    }
  }, [items, onAdd, onError]);

  // Update item optimistically
  const updateItem = useCallback(async (
    id: string,
    updates: Partial<T>,
    asyncFn: (id: string, updates: Partial<T>) => Promise<T>
  ) => {
    previousItemsRef.current = items;
    
    // Optimistic update
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates, _pending: true } : item
    ));
    setPendingOperations(prev => new Set(prev).add(id));

    try {
      const result = await asyncFn(id, updates);
      
      setItems(prev => prev.map(item =>
        item.id === id ? result : item
      ));
      
      onUpdate?.(result);
      return result;
    } catch (err) {
      // Rollback
      setItems(previousItemsRef.current);
      const error = err instanceof Error ? err : new Error('Failed to update');
      onError?.(error);
      toast.error('Erro ao atualizar');
      throw error;
    } finally {
      setPendingOperations(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [items, onUpdate, onError]);

  // Remove item optimistically
  const removeItem = useCallback(async (
    id: string,
    asyncFn: (id: string) => Promise<void>
  ) => {
    previousItemsRef.current = items;
    const removedItem = items.find(item => item.id === id);
    
    // Optimistic remove
    setItems(prev => prev.filter(item => item.id !== id));
    setPendingOperations(prev => new Set(prev).add(id));

    try {
      await asyncFn(id);
      
      onRemove?.(id);
      
      // Show undo toast
      toast.success('Item removido', {
        action: {
          label: 'Desfazer',
          onClick: () => {
            if (removedItem) {
              setItems(prev => [...prev, removedItem]);
            }
          },
        },
      });
    } catch (err) {
      // Rollback
      setItems(previousItemsRef.current);
      const error = err instanceof Error ? err : new Error('Failed to remove');
      onError?.(error);
      toast.error('Erro ao remover');
      throw error;
    } finally {
      setPendingOperations(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [items, onRemove, onError]);

  // Reorder items optimistically
  const reorderItems = useCallback(async (
    newOrder: T[],
    asyncFn: (items: T[]) => Promise<void>
  ) => {
    previousItemsRef.current = items;
    setItems(newOrder);

    try {
      await asyncFn(newOrder);
    } catch (err) {
      setItems(previousItemsRef.current);
      const error = err instanceof Error ? err : new Error('Failed to reorder');
      onError?.(error);
      toast.error('Erro ao reordenar');
      throw error;
    }
  }, [items, onError]);

  const isPending = useCallback((id: string) => {
    return pendingOperations.has(id);
  }, [pendingOperations]);

  return {
    items,
    setItems,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
    isPending,
    hasPendingOperations: pendingOperations.size > 0,
  };
}

// ============================================
// OPTIMISTIC TOGGLE HOOK
// ============================================

export function useOptimisticToggle(
  initialValue: boolean,
  asyncFn: (value: boolean) => Promise<boolean>,
  options: { onSuccess?: (value: boolean) => void; onError?: (error: Error) => void } = {}
) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const previousValueRef = useRef(initialValue);

  const toggle = useCallback(async () => {
    previousValueRef.current = value;
    const newValue = !value;
    
    // Optimistic update
    setValue(newValue);
    setIsLoading(true);

    try {
      const result = await asyncFn(newValue);
      setValue(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      // Rollback
      setValue(previousValueRef.current);
      const error = err instanceof Error ? err : new Error('Toggle failed');
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [value, asyncFn, options]);

  return {
    value,
    isLoading,
    toggle,
    setValue,
  };
}

export default useOptimisticUpdate;
