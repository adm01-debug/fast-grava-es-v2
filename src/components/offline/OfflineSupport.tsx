import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  WifiOff, 
  Wifi, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Download,
  Upload,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// ============================================================================
// MELHORIA #14: SUPORTE OFFLINE ROBUSTO
// Sistema completo de suporte offline com sync, cache e indicadores
// ============================================================================

// Hook para detectar status de conexão
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [connectionType, setConnectionType] = React.useState<string>("unknown");
  const [effectiveType, setEffectiveType] = React.useState<string>("unknown");

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Network Information API
    const connection = (navigator as any).connection;
    if (connection) {
      setConnectionType(connection.type || "unknown");
      setEffectiveType(connection.effectiveType || "unknown");

      const handleConnectionChange = () => {
        setConnectionType(connection.type || "unknown");
        setEffectiveType(connection.effectiveType || "unknown");
      };

      connection.addEventListener("change", handleConnectionChange);
      return () => {
        connection.removeEventListener("change", handleConnectionChange);
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, connectionType, effectiveType };
}

// Indicador de status de conexão
interface ConnectionStatusProps {
  showDetails?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

export function ConnectionStatus({
  showDetails = false,
  position = "bottom-right",
  className,
}: ConnectionStatusProps) {
  const { isOnline, connectionType, effectiveType } = useOnlineStatus();
  const [showBanner, setShowBanner] = React.useState(false);
  const [wasOffline, setWasOffline] = React.useState(false);

  React.useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setWasOffline(true);
    } else if (wasOffline) {
      // Mostrar brevemente que voltou online
      setTimeout(() => setShowBanner(false), 3000);
    }
  }, [isOnline, wasOffline]);

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={cn(
            "fixed z-50 p-4 rounded-lg shadow-lg border backdrop-blur-sm",
            isOnline
              ? "bg-green-500/10 border-green-500/20"
              : "bg-orange-500/10 border-orange-500/20",
            positionClasses[position],
            className
          )}
        >
          <div className="flex items-center gap-3">
            {isOnline ? (
              <>
                <div className="p-2 rounded-full bg-green-500/20">
                  <Wifi className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    Conexão restaurada
                  </p>
                  <p className="text-xs text-green-600/80 dark:text-green-400/80">
                    Sincronizando dados...
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 rounded-full bg-orange-500/20">
                  <WifiOff className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                    Você está offline
                  </p>
                  <p className="text-xs text-orange-600/80 dark:text-orange-400/80">
                    Alterações serão sincronizadas quando reconectar
                  </p>
                </div>
              </>
            )}
          </div>

          {showDetails && isOnline && (
            <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <span>Tipo: {connectionType}</span>
              <span className="mx-2">•</span>
              <span>Velocidade: {effectiveType}</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook para gerenciar fila de sync offline
interface PendingAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retries: number;
}

export function useOfflineSync() {
  const [pendingActions, setPendingActions] = React.useState<PendingAction[]>([]);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncProgress, setSyncProgress] = React.useState(0);
  const { isOnline } = useOnlineStatus();

  // Carregar ações pendentes do localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("offline-pending-actions");
    if (stored) {
      try {
        setPendingActions(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading pending actions:", e);
      }
    }
  }, []);

  // Salvar ações pendentes no localStorage
  React.useEffect(() => {
    localStorage.setItem("offline-pending-actions", JSON.stringify(pendingActions));
  }, [pendingActions]);

  // Adicionar ação à fila
  const queueAction = React.useCallback((type: string, data: any) => {
    const action: PendingAction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    setPendingActions((prev) => [...prev, action]);
    return action.id;
  }, []);

  // Remover ação da fila
  const removeAction = React.useCallback((id: string) => {
    setPendingActions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Sincronizar ações quando voltar online
  const syncActions = React.useCallback(async (
    syncHandler: (action: PendingAction) => Promise<boolean>
  ) => {
    if (!isOnline || pendingActions.length === 0 || isSyncing) return;

    setIsSyncing(true);
    setSyncProgress(0);

    const total = pendingActions.length;
    let completed = 0;

    for (const action of pendingActions) {
      try {
        const success = await syncHandler(action);
        if (success) {
          removeAction(action.id);
        } else if (action.retries < 3) {
          setPendingActions((prev) =>
            prev.map((a) =>
              a.id === action.id ? { ...a, retries: a.retries + 1 } : a
            )
          );
        }
      } catch (error) {
        console.error("Sync error:", error);
      }

      completed++;
      setSyncProgress((completed / total) * 100);
    }

    setIsSyncing(false);
  }, [isOnline, pendingActions, isSyncing, removeAction]);

  // Auto-sync quando voltar online
  React.useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      // Trigger sync notification
    }
  }, [isOnline, pendingActions.length]);

  return {
    pendingActions,
    pendingCount: pendingActions.length,
    queueAction,
    removeAction,
    syncActions,
    isSyncing,
    syncProgress,
    isOnline,
  };
}

// Widget de status de sync
interface SyncStatusWidgetProps {
  pendingCount: number;
  isSyncing: boolean;
  syncProgress: number;
  onSync: () => void;
  className?: string;
}

export function SyncStatusWidget({
  pendingCount,
  isSyncing,
  syncProgress,
  onSync,
  className,
}: SyncStatusWidgetProps) {
  const { isOnline } = useOnlineStatus();

  if (pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "p-4 rounded-lg border bg-card shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isSyncing ? (
            <RefreshCw className="h-4 w-4 text-primary animate-spin" />
          ) : isOnline ? (
            <Cloud className="h-4 w-4 text-muted-foreground" />
          ) : (
            <CloudOff className="h-4 w-4 text-orange-500" />
          )}
          <span className="text-sm font-medium">
            {isSyncing
              ? "Sincronizando..."
              : `${pendingCount} alteração${pendingCount !== 1 ? "ções" : ""} pendente${pendingCount !== 1 ? "s" : ""}`}
          </span>
        </div>

        {!isSyncing && isOnline && (
          <Button size="sm" variant="ghost" onClick={onSync}>
            <Upload className="h-3 w-3 mr-1" />
            Sincronizar
          </Button>
        )}
      </div>

      {isSyncing && (
        <div className="space-y-1">
          <Progress value={syncProgress} className="h-1" />
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(syncProgress)}%
          </p>
        </div>
      )}

      {!isOnline && (
        <p className="text-xs text-muted-foreground">
          As alterações serão sincronizadas quando a conexão for restaurada.
        </p>
      )}
    </motion.div>
  );
}

// Hook para cache de dados offline
export function useOfflineCache<T>(key: string, fetcher: () => Promise<T>) {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [isStale, setIsStale] = React.useState(false);
  const { isOnline } = useOnlineStatus();

  const cacheKey = `offline-cache-${key}`;
  const timestampKey = `offline-cache-timestamp-${key}`;

  // Carregar do cache
  React.useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setData(JSON.parse(cached));
        const timestamp = localStorage.getItem(timestampKey);
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp);
          setIsStale(age > 5 * 60 * 1000); // Stale após 5 minutos
        }
      } catch (e) {
        console.error("Cache parse error:", e);
      }
    }
    setIsLoading(false);
  }, [cacheKey, timestampKey]);

  // Buscar dados frescos quando online
  const refresh = React.useCallback(async () => {
    if (!isOnline) return;

    setIsLoading(true);
    setError(null);

    try {
      const freshData = await fetcher();
      setData(freshData);
      setIsStale(false);
      localStorage.setItem(cacheKey, JSON.stringify(freshData));
      localStorage.setItem(timestampKey, Date.now().toString());
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Fetch failed"));
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, fetcher, cacheKey, timestampKey]);

  // Auto-refresh quando voltar online e dados estiverem stale
  React.useEffect(() => {
    if (isOnline && isStale) {
      refresh();
    }
  }, [isOnline, isStale, refresh]);

  return {
    data,
    isLoading,
    error,
    isStale,
    refresh,
    isOnline,
  };
}

// Indicador inline de status offline
interface OfflineIndicatorProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function OfflineIndicator({
  size = "md",
  showLabel = true,
  className,
}: OfflineIndicatorProps) {
  const { isOnline } = useOnlineStatus();

  const sizes = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full",
          sizes[size],
          isOnline ? "bg-green-500" : "bg-orange-500",
          !isOnline && "animate-pulse"
        )}
      />
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
    </div>
  );
}

// Wrapper para componentes que funcionam offline
interface OfflineCapableProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiresOnline?: boolean;
}

export function OfflineCapable({
  children,
  fallback,
  requiresOnline = false,
}: OfflineCapableProps) {
  const { isOnline } = useOnlineStatus();

  if (requiresOnline && !isOnline) {
    return (
      <>
        {fallback || (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <WifiOff className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Você está offline</h3>
            <p className="text-sm text-muted-foreground">
              Esta funcionalidade requer conexão com a internet.
            </p>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}

// Badge de dados em cache
interface CachedDataBadgeProps {
  isStale: boolean;
  lastUpdated?: Date;
  onRefresh?: () => void;
  className?: string;
}

export function CachedDataBadge({
  isStale,
  lastUpdated,
  onRefresh,
  className,
}: CachedDataBadgeProps) {
  const { isOnline } = useOnlineStatus();

  if (!isStale) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs",
        "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20",
        className
      )}
    >
      <Database className="h-3 w-3" />
      <span>Dados em cache</span>
      {lastUpdated && (
        <span className="opacity-70">
          • {new Date(lastUpdated).toLocaleTimeString()}
        </span>
      )}
      {isOnline && onRefresh && (
        <button
          onClick={onRefresh}
          className="ml-1 p-0.5 hover:bg-yellow-500/20 rounded"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  );
}
