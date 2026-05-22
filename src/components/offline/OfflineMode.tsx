import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: Date;
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
  const [pendingActions, setPendingActions] = useState<PendingAction[]>(() => {
    try {
      const saved = localStorage.getItem('pending-actions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load pending actions from localStorage:', e);
      return [];
    }
  });
  const { toast } = useToast();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Conexão restaurada',
        description: 'Você está online novamente.',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Sem conexão',
        description: 'Você está offline. As alterações serão salvas localmente.',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Persist pending actions
  useEffect(() => {
    try {
      localStorage.setItem('pending-actions', JSON.stringify(pendingActions));
    } catch (e) {
      console.error('Failed to persist pending actions to localStorage:', e);
    }
  }, [pendingActions]);

  // Auto-sync when back online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncNow();
    }
  }, [isOnline]);

  const addPendingAction = useCallback((action: Omit<PendingAction, 'id' | 'timestamp' | 'retries'>) => {
    const newAction: PendingAction = {
      ...action,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retries: 0,
    };
    setPendingActions(prev => [...prev, newAction]);
  }, []);

  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing || pendingActions.length === 0) return;

    setIsSyncing(true);
    const successfulIds: string[] = [];

    for (const action of pendingActions) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        successfulIds.push(action.id);
      } catch (error) {
        // Increment retry count
        setPendingActions(prev =>
          prev.map(a =>
            a.id === action.id
              ? { ...a, retries: a.retries + 1 }
              : a
          )
        );
      }
    }

    // Remove successful actions
    setPendingActions(prev => prev.filter(a => !successfulIds.includes(a.id)));
    setIsSyncing(false);

    if (successfulIds.length > 0) {
      toast({
        title: 'Sincronização concluída',
        description: `${successfulIds.length} ações sincronizadas.`,
      });
    }
  }, [isOnline, isSyncing, pendingActions, toast]);

  const clearPending = useCallback(() => {
    setPendingActions([]);
    localStorage.removeItem('pending-actions');
  }, []);

  return (
    <OfflineContext.Provider value={{
      isOnline,
      isSyncing,
      pendingActions,
      addPendingAction,
      syncNow,
      clearPending,
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

// Offline Banner
export function OfflineBanner() {
  const { isOnline, isSyncing, pendingActions, syncNow } = useOffline();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-warning/10 border-b border-warning/20"
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-warning">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">
                Você está offline
              </span>
              {pendingActions.length > 0 && (
                <span className="text-xs bg-warning/20 px-2 py-0.5 rounded-full">
                  {pendingActions.length} pendentes
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {isOnline && pendingActions.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-primary/10 border-b border-primary/20"
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Cloud className="h-4 w-4" />
              <span className="text-sm font-medium">
                {pendingActions.length} ações pendentes para sincronizar
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={syncNow}
              disabled={isSyncing}
              className="gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar agora'}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Connection Status Indicator
export function ConnectionStatus({ showLabel = false }: { showLabel?: boolean }) {
  const { isOnline, isSyncing, pendingActions } = useOffline();

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'relative p-2 rounded-full transition-colors',
        isOnline ? 'bg-chart-2/10' : 'bg-warning/10'
      )}>
        {isOnline ? (
          <Wifi className="h-4 w-4 text-chart-2" />
        ) : (
          <WifiOff className="h-4 w-4 text-warning" />
        )}

        {isSyncing && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {pendingActions.length > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-warning text-[10px] font-bold flex items-center justify-center text-warning-foreground">
            {pendingActions.length}
          </span>
        )}
      </div>

      {showLabel && (
        <span className={cn(
          'text-sm',
          isOnline ? 'text-chart-2' : 'text-warning'
        )}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
}

// Sync Status Component
export function SyncStatus() {
  const { isOnline, isSyncing, pendingActions, syncNow } = useOffline();

  if (pendingActions.length === 0) {
    return (
      <div className="flex items-center gap-2 text-chart-2">
        <Check className="h-4 w-4" />
        <span className="text-sm">Tudo sincronizado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Cloud className="h-4 w-4 text-primary" />
        ) : (
          <CloudOff className="h-4 w-4 text-warning" />
        )}
        <span className="text-sm text-muted-foreground">
          {pendingActions.length} pendentes
        </span>
      </div>

      {isOnline && (
        <Button
          size="sm"
          variant="outline"
          onClick={syncNow}
          disabled={isSyncing}
          className="h-7 gap-1"
        >
          <RefreshCw className={cn('h-3 w-3', isSyncing && 'animate-spin')} />
          Sync
        </Button>
      )}
    </div>
  );
}

// Offline Wrapper - Handles offline data access
export function OfflineWrapper({
  children,
  fallback,
  requireOnline = false,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  requireOnline?: boolean;
}) {
  const { isOnline } = useOffline();

  if (requireOnline && !isOnline) {
    return fallback || (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">Sem Conexão</h3>
        <p className="text-sm text-muted-foreground">
          Esta funcionalidade requer conexão com a internet.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export default OfflineProvider;
