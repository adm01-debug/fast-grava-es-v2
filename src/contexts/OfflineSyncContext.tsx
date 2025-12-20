import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';

type OfflineSyncContextType = ReturnType<typeof useOfflineSync>;

const OfflineSyncContext = createContext<OfflineSyncContextType | null>(null);

interface OfflineSyncProviderProps {
  children: ReactNode;
}

export function OfflineSyncProvider({ children }: OfflineSyncProviderProps) {
  const offlineSync = useOfflineSync();

  // Cache data on mount and periodically
  useEffect(() => {
    // Initial cache
    offlineSync.cacheData();

    // Refresh cache every 5 minutes when online
    const interval = setInterval(() => {
      if (offlineSync.isOnline) {
        offlineSync.cacheData();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [offlineSync.isOnline]);

  return (
    <OfflineSyncContext.Provider value={offlineSync}>
      {children}
    </OfflineSyncContext.Provider>
  );
}

export function useOfflineSyncContext() {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error('useOfflineSyncContext must be used within OfflineSyncProvider');
  }
  return context;
}
