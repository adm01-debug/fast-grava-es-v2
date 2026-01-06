import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

type OptimisticStatus = 'idle' | 'pending' | 'success' | 'error';

interface OptimisticState<T> {
  data: T;
  status: OptimisticStatus;
  error: Error | null;
  previousData: T | null;
}

interface UseOptimisticOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, previousData: T) => void;
  onRollback?: (previousData: T) => void;
  showToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Hook for optimistic UI updates
 * Updates the UI immediately, then syncs with the server
 */
export function useOptimistic<T>(
  initialData: T,
  options: UseOptimisticOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    onRollback,
    showToast = true,
    successMessage = 'Alteração salva',
    errorMessage = 'Erro ao salvar. Alteração desfeita.',
  } = options;

  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    status: 'idle',
    error: null,
    previousData: null,
  });

  const update = useCallback(
    async (
      newData: T | ((prev: T) => T),
      asyncAction: () => Promise<T>
    ): Promise<T | null> => {
      const previousData = state.data;
      const optimisticData = typeof newData === 'function' 
        ? (newData as (prev: T) => T)(previousData) 
        : newData;

      // Optimistically update
      setState({
        data: optimisticData,
        status: 'pending',
        error: null,
        previousData,
      });

      try {
        // Perform actual async operation
        const result = await asyncAction();
        
        setState({
          data: result,
          status: 'success',
          error: null,
          previousData: null,
        });

        if (showToast) {
          toast.success(successMessage);
        }
        
        onSuccess?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        
        // Rollback to previous data
        setState({
          data: previousData,
          status: 'error',
          error: err,
          previousData: null,
        });

        if (showToast) {
          toast.error(errorMessage);
        }

        onError?.(err, previousData);
        onRollback?.(previousData);
        return null;
      }
    },
    [state.data, onSuccess, onError, onRollback, showToast, successMessage, errorMessage]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      status: 'idle',
      error: null,
      previousData: null,
    });
  }, [initialData]);

  return {
    data: state.data,
    status: state.status,
    error: state.error,
    isPending: state.status === 'pending',
    isError: state.status === 'error',
    isSuccess: state.status === 'success',
    update,
    reset,
  };
}

/**
 * Hook for optimistic list operations
 */
export function useOptimisticList<T extends { id: string }>(
  initialItems: T[],
  options: UseOptimisticOptions<T[]> = {}
) {
  const { data, status, isPending, update, reset } = useOptimistic(initialItems, options);

  const addItem = useCallback(
    (item: T, asyncAction: () => Promise<T[]>) => {
      return update(
        (prev) => [...prev, item],
        asyncAction
      );
    },
    [update]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<T>, asyncAction: () => Promise<T[]>) => {
      return update(
        (prev) => prev.map((item) => 
          item.id === id ? { ...item, ...updates } : item
        ),
        asyncAction
      );
    },
    [update]
  );

  const removeItem = useCallback(
    (id: string, asyncAction: () => Promise<T[]>) => {
      return update(
        (prev) => prev.filter((item) => item.id !== id),
        asyncAction
      );
    },
    [update]
  );

  const reorderItems = useCallback(
    (newOrder: T[], asyncAction: () => Promise<T[]>) => {
      return update(newOrder, asyncAction);
    },
    [update]
  );

  return {
    items: data,
    status,
    isPending,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
    reset,
  };
}

/**
 * Hook for optimistic toggle operations
 */
export function useOptimisticToggle(
  initialValue: boolean,
  asyncAction: (newValue: boolean) => Promise<boolean>,
  options: Omit<UseOptimisticOptions<boolean>, 'onSuccess' | 'onError'> & {
    onToggle?: (newValue: boolean) => void;
  } = {}
) {
  const { onToggle, ...restOptions } = options;
  
  const { data, isPending, update } = useOptimistic(initialValue, restOptions);

  const toggle = useCallback(() => {
    const newValue = !data;
    onToggle?.(newValue);
    return update(newValue, () => asyncAction(newValue));
  }, [data, update, asyncAction, onToggle]);

  const setOn = useCallback(() => {
    if (!data) {
      onToggle?.(true);
      return update(true, () => asyncAction(true));
    }
    return Promise.resolve(data);
  }, [data, update, asyncAction, onToggle]);

  const setOff = useCallback(() => {
    if (data) {
      onToggle?.(false);
      return update(false, () => asyncAction(false));
    }
    return Promise.resolve(data);
  }, [data, update, asyncAction, onToggle]);

  return {
    value: data,
    isPending,
    toggle,
    setOn,
    setOff,
  };
}

/**
 * Hook for optimistic counter operations
 */
export function useOptimisticCounter(
  initialValue: number,
  asyncAction: (newValue: number) => Promise<number>,
  options: UseOptimisticOptions<number> = {}
) {
  const { data, isPending, update } = useOptimistic(initialValue, options);

  const increment = useCallback(
    (amount = 1) => {
      const newValue = data + amount;
      return update(newValue, () => asyncAction(newValue));
    },
    [data, update, asyncAction]
  );

  const decrement = useCallback(
    (amount = 1) => {
      const newValue = Math.max(0, data - amount);
      return update(newValue, () => asyncAction(newValue));
    },
    [data, update, asyncAction]
  );

  const set = useCallback(
    (newValue: number) => {
      return update(newValue, () => asyncAction(newValue));
    },
    [update, asyncAction]
  );

  return {
    value: data,
    isPending,
    increment,
    decrement,
    set,
  };
}

/**
 * Utility for creating optimistic mutations with React Query
 */
export function createOptimisticMutation<TData, TVariables, TContext = unknown>(options: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  optimisticUpdate: (variables: TVariables, currentData: TData) => TData;
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;
  onError?: (error: Error, variables: TVariables, context: TContext) => void;
}) {
  return {
    mutationFn: options.mutationFn,
    onMutate: async (variables: TVariables) => {
      // This would integrate with React Query's context
      return { variables };
    },
    onError: (error: Error, variables: TVariables, context: TContext) => {
      toast.error('Erro ao salvar alteração');
      options.onError?.(error, variables, context);
    },
    onSuccess: (data: TData, variables: TVariables, context: TContext) => {
      toast.success('Alteração salva');
      options.onSuccess?.(data, variables, context);
    },
  };
}
