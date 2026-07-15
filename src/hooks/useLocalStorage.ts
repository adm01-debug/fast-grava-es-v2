import { useState, useCallback, useEffect, useMemo, useRef, createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

/**
 * Persists state in localStorage with automatic JSON serialization and error handling.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (e) {
      logger.error(`Failed to load value for key "${key}" from localStorage`, e, 'useLocalStorage');
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        } catch (e) {
          logger.error(`Failed to set value for key "${key}" to localStorage`, e, 'useLocalStorage');
        }
        return nextValue;
      });
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (e) {
      logger.error(`Failed to remove key "${key}" from localStorage`, e, 'useLocalStorage');
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: unknown;
  timestamp: string;
  retries: number;
}

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingActions: PendingAction[];
  addPendingAction: (action: Omit<PendingAction, 'id' | 'timestamp' | 'retries'>) => void;
  syncNow: () => Promise<void>;
  clearPending: () => void;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
}

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingActions, setPendingActions] = useLocalStorage<PendingAction[]>('pending-actions', []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restaurada. Sincronizando dados...');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Sem conexão. As alterações serão salvas localmente.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing || pendingActions.length === 0) return;

    setIsSyncing(true);
    const successfulIds: string[] = [];

    for (const action of pendingActions) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        successfulIds.push(action.id);
      } catch (error) {
        setPendingActions(prev =>
          prev.map(a => a.id === action.id ? { ...a, retries: a.retries + 1 } : a)
        );
      }
    }

    setPendingActions(prev => prev.filter(a => !successfulIds.includes(a.id)));
    setIsSyncing(false);

    if (successfulIds.length > 0) {
      toast.success(`${successfulIds.length} ações sincronizadas.`);
    }
  }, [isOnline, isSyncing, pendingActions, setPendingActions]);

  // Trigger sync when coming back online, keeping the effect free of direct
  // setState calls. syncNow is stored in a ref so we don't rerun on every
  // callback identity change.
  const syncNowRef = useRef(syncNow);
  useEffect(() => {
    syncNowRef.current = syncNow;
  }, [syncNow]);
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      void syncNowRef.current();
    }
  }, [isOnline, pendingActions.length]);


  const addPendingAction = useCallback((action: Omit<PendingAction, 'id' | 'timestamp' | 'retries'>) => {
    const newAction: PendingAction = {
      ...action,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      retries: 0,
    };
    setPendingActions(prev => [...prev, newAction]);
  }, [setPendingActions]);

  const clearPending = useCallback(() => {
    setPendingActions([]);
  }, [setPendingActions]);

  const value = useMemo(() => ({
    isOnline,
    isSyncing,
    pendingActions,
    addPendingAction,
    syncNow,
    clearPending,
  }), [isOnline, isSyncing, pendingActions, addPendingAction, syncNow, clearPending]);

  return React.createElement(OfflineContext.Provider, { value }, children);
}

// ============================================
// UI COMPONENTS
// ============================================

import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Offline Banner
export function OfflineBanner() {
  const { isOnline, isSyncing, pendingActions, syncNow } = useOffline();

  if (isOnline && pendingActions.length === 0) return null;

  return React.createElement(AnimatePresence, {}, 
    !isOnline ? React.createElement(motion.div, {
      initial: { height: 0, opacity: 0 },
      animate: { height: 'auto', opacity: 1 },
      exit: { height: 0, opacity: 0 },
      className: "bg-orange-500/10 border-b border-orange-500/20"
    }, React.createElement("div", { className: "container mx-auto px-4 py-2 flex items-center justify-between" },
      React.createElement("div", { className: "flex items-center gap-2 text-orange-500" },
        React.createElement(WifiOff, { className: "h-4 w-4" }),
        React.createElement("span", { className: "text-sm font-medium" }, "Você está offline"),
        pendingActions.length > 0 && React.createElement("span", { className: "text-xs bg-orange-500/20 px-2 py-0.5 rounded-full" }, `${pendingActions.length} pendentes`)
      )
    )) : pendingActions.length > 0 ? React.createElement(motion.div, {
      initial: { height: 0, opacity: 0 },
      animate: { height: 'auto', opacity: 1 },
      exit: { height: 0, opacity: 0 },
      className: "bg-primary/10 border-b border-primary/20"
    }, React.createElement("div", { className: "container mx-auto px-4 py-2 flex items-center justify-between" },
      React.createElement("div", { className: "flex items-center gap-2 text-primary" },
        React.createElement(Cloud, { className: "h-4 w-4" }),
        React.createElement("span", { className: "text-sm font-medium" }, `${pendingActions.length} ações pendentes para sincronizar`)
      ),
      React.createElement(Button, {
        size: "sm",
        variant: "ghost",
        onClick: syncNow,
        disabled: isSyncing,
        className: "gap-2"
      }, 
        React.createElement(RefreshCw, { className: cn('h-4 w-4', isSyncing && 'animate-spin') }),
        isSyncing ? 'Sincronizando...' : 'Sincronizar agora'
      )
    )) : null
  );
}

// Connection Status Indicator
export function ConnectionStatus({ showLabel = false }: { showLabel?: boolean }) {
  const { isOnline, isSyncing, pendingActions } = useOffline();

  return React.createElement("div", { className: "flex items-center gap-2" },
    React.createElement("div", {
      className: cn(
        'relative p-2 rounded-full transition-colors',
        isOnline ? 'bg-green-500/10' : 'bg-orange-500/10'
      )
    },
      isOnline ? React.createElement(Wifi, { className: "h-4 w-4 text-green-500" }) : React.createElement(WifiOff, { className: "h-4 w-4 text-orange-500" }),
      isSyncing && React.createElement(motion.div, {
        className: "absolute inset-0 rounded-full border-2 border-primary border-t-transparent",
        animate: { rotate: 360 },
        transition: { duration: 1, repeat: Infinity, ease: 'linear' }
      }),
      pendingActions.length > 0 && React.createElement("span", {
        className: "absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 text-[10px] font-bold flex items-center justify-center text-white"
      }, pendingActions.length)
    ),
    showLabel && React.createElement("span", {
      className: cn('text-sm', isOnline ? 'text-green-500' : 'text-orange-500')
    }, isOnline ? 'Online' : 'Offline')
  );
}

import * as React from 'react';
