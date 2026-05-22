import { useState, useCallback, useEffect, useMemo, createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';

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
      console.error(`Failed to load value for key "${key}" from localStorage:`, e);
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
          console.error(`Failed to set value for key "${key}" to localStorage:`, e);
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
      console.error(`Failed to remove key "${key}" from localStorage:`, e);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
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

  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncNow();
    }
  }, [isOnline]);

  const addPendingAction = useCallback((action: Omit<PendingAction, 'id' | 'timestamp' | 'retries'>) => {
    const newAction: PendingAction = {
      ...action,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      retries: 0,
    };
    setPendingActions(prev => [...prev, newAction]);
  }, [setPendingActions]);

  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing || pendingActions.length === 0) return;

    setIsSyncing(true);
    const successfulIds: string[] = [];

    for (const action of pendingActions) {
      try {
        // Simulate API call or real sync logic
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

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}
