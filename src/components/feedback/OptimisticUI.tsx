import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Types
interface OptimisticAction {
  id: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  rollback?: () => void;
  retry?: () => void;
  timestamp: number;
}

interface OptimisticUIContextType {
  actions: OptimisticAction[];
  addAction: (action: Omit<OptimisticAction, 'id' | 'timestamp'>) => string;
  updateAction: (id: string, updates: Partial<OptimisticAction>) => void;
  removeAction: (id: string) => void;
  clearActions: () => void;
}

const OptimisticUIContext = createContext<OptimisticUIContextType | null>(null);

// Provider
export const OptimisticUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<OptimisticAction[]>([]);
  const counterRef = useRef(0);

  const addAction = useCallback((action: Omit<OptimisticAction, 'id' | 'timestamp'>) => {
    const id = `action-${++counterRef.current}`;
    const newAction: OptimisticAction = {
      ...action,
      id,
      timestamp: Date.now(),
    };
    setActions(prev => [...prev, newAction]);
    return id;
  }, []);

  const updateAction = useCallback((id: string, updates: Partial<OptimisticAction>) => {
    setActions(prev =>
      prev.map(action =>
        action.id === id ? { ...action, ...updates } : action
      )
    );
  }, []);

  const removeAction = useCallback((id: string) => {
    setActions(prev => prev.filter(action => action.id !== id));
  }, []);

  const clearActions = useCallback(() => {
    setActions([]);
  }, []);

  // Auto-remove successful actions after delay
  useEffect(() => {
    const successActions = actions.filter(a => a.status === 'success');
    if (successActions.length > 0) {
      const timer = setTimeout(() => {
        successActions.forEach(a => removeAction(a.id));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [actions, removeAction]);

  return (
    <OptimisticUIContext.Provider value={{ actions, addAction, updateAction, removeAction, clearActions }}>
      {children}
      <OptimisticActionIndicator actions={actions} onDismiss={removeAction} />
    </OptimisticUIContext.Provider>
  );
};

// Hook
export function useOptimisticUI() {
  const context = useContext(OptimisticUIContext);
  if (!context) {
    throw new Error('useOptimisticUI must be used within OptimisticUIProvider');
  }
  return context;
}

// Hook for optimistic mutations
export function useOptimisticMutation<T, Args extends unknown[]>(
  mutationFn: (...args: Args) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
    pendingMessage?: string;
  }
) {
  const { addAction, updateAction, removeAction } = useOptimisticUI();
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (...args: Args) => {
    setIsPending(true);
    const actionId = addAction({
      status: 'pending',
      message: options?.pendingMessage || 'Salvando...',
    });

    try {
      const result = await mutationFn(...args);
      updateAction(actionId, {
        status: 'success',
        message: options?.successMessage || 'Salvo com sucesso!',
      });
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      updateAction(actionId, {
        status: 'error',
        message: options?.errorMessage || 'Erro ao salvar',
        retry: () => mutate(...args),
      });
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [mutationFn, options, addAction, updateAction]);

  return { mutate, isPending };
}

// Visual indicator component
const OptimisticActionIndicator: React.FC<{
  actions: OptimisticAction[];
  onDismiss: (id: string) => void;
}> = ({ actions, onDismiss }) => {
  if (actions.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {actions.map(action => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            layout
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm',
              action.status === 'pending' && 'bg-primary/90 text-primary-foreground',
              action.status === 'success' && 'bg-green-500/90 text-white',
              action.status === 'error' && 'bg-destructive/90 text-destructive-foreground'
            )}
          >
            <div className="shrink-0">
              {action.status === 'pending' && <Loader2 className="w-4 h-4 animate-spin" />}
              {action.status === 'success' && <Check className="w-4 h-4" />}
              {action.status === 'error' && <AlertCircle className="w-4 h-4" />}
            </div>
            <span className="text-sm font-medium flex-1">{action.message}</span>
            <div className="flex items-center gap-1">
              {action.retry && action.status === 'error' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-current hover:bg-white/20"
                  onClick={action.retry}
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-current hover:bg-white/20"
                onClick={() => onDismiss(action.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Loading button with optimistic feedback
export const LoadingButton: React.FC<
  React.ComponentProps<typeof Button> & {
    isLoading?: boolean;
    loadingText?: string;
  }
> = ({ isLoading, loadingText, children, disabled, ...props }) => {
  return (
    <Button {...props} disabled={disabled || isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

// Skeleton with shimmer effect
export const ShimmerSkeleton: React.FC<{
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}> = ({ className, variant = 'rectangular', width, height }) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{ width, height }}
    />
  );
};

// Pulse indicator for live data
export const PulseIndicator: React.FC<{
  color?: 'green' | 'yellow' | 'red' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}> = ({ color = 'green', size = 'md', label }) => {
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex">
        <span className={cn(
          'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
          colors[color]
        )} />
        <span className={cn(
          'relative inline-flex rounded-full',
          colors[color],
          sizes[size]
        )} />
      </span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
};
