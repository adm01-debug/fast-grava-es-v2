import { useState, useEffect, useCallback, useRef } from 'react';

// Online/Offline status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Offline queue for actions
interface QueuedAction<T = unknown> {
  id: string;
  action: string;
  payload: T;
  timestamp: number;
  retries: number;
}

export function useOfflineQueue<T>(
  storageKey: string,
  processAction: (action: QueuedAction<T>) => Promise<void>
) {
  const [queue, setQueue] = useState<QueuedAction<T>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const isOnline = useOnlineStatus();

  // Load queue from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setQueue(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load offline queue:', e);
      }
    }
  }, [storageKey]);

  // Save queue to storage on change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(queue));
  }, [queue, storageKey]);

  // Process queue when online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isProcessing) {
      processQueue();
    }
  }, [isOnline, queue.length]);

  const addToQueue = useCallback((action: string, payload: T) => {
    const newAction: QueuedAction<T> = {
      id: crypto.randomUUID(),
      action,
      payload,
      timestamp: Date.now(),
      retries: 0,
    };
    setQueue(prev => [...prev, newAction]);
    return newAction.id;
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const processQueue = async () => {
    if (isProcessing || !isOnline) return;
    setIsProcessing(true);

    for (const item of queue) {
      try {
        await processAction(item);
        removeFromQueue(item.id);
      } catch (error) {
        console.error('Failed to process queued action:', error);
        setQueue(prev =>
          prev.map(q =>
            q.id === item.id ? { ...q, retries: q.retries + 1 } : q
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    queue,
    isProcessing,
    isOnline,
    addToQueue,
    removeFromQueue,
    clearQueue,
    pendingCount: queue.length,
  };
}

// Cache with offline support
export function useOfflineCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; staleWhileRevalidate?: boolean } = {}
) {
  const { ttl = 5 * 60 * 1000, staleWhileRevalidate = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const isOnline = useOnlineStatus();

  const getCacheKey = (k: string) => `offline_cache_${k}`;

  const loadFromCache = useCallback(() => {
    const cached = localStorage.getItem(getCacheKey(key));
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > ttl;
        setIsStale(isExpired);
        return { data: data as T, isExpired };
      } catch (e) {
        console.error('Failed to parse cache:', e);
      }
    }
    return null;
  }, [key, ttl]);

  const saveToCache = useCallback((data: T) => {
    localStorage.setItem(getCacheKey(key), JSON.stringify({ data, timestamp: Date.now() }));
  }, [key]);

  const refresh = useCallback(async () => {
    if (!isOnline) {
      const cached = loadFromCache();
      if (cached) {
        setData(cached.data);
        setIsLoading(false);
      }
      return;
    }

    try {
      setIsLoading(true);
      const result = await fetcher();
      setData(result);
      saveToCache(result);
      setIsStale(false);
      setError(null);
    } catch (err) {
      setError(err as Error);
      const cached = loadFromCache();
      if (cached) {
        setData(cached.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, fetcher, loadFromCache, saveToCache]);

  useEffect(() => {
    const cached = loadFromCache();
    if (cached) {
      setData(cached.data);
      if (!cached.isExpired) {
        setIsLoading(false);
        return;
      }
      if (staleWhileRevalidate) {
        setIsLoading(false);
        refresh();
        return;
      }
    }
    refresh();
  }, [key]);

  return { data, isLoading, error, isStale, refresh, isOnline };
}

// Service Worker registration
export function useServiceWorker(swUrl: string) {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(swUrl).then(reg => {
        setRegistration(reg);
        setIsInstalled(!!reg.active);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      });
    }
  }, [swUrl]);

  const update = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  return { registration, updateAvailable, isInstalled, update };
}

// Background sync
export function useBackgroundSync(tag: string) {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'SyncManager' in window);
  }, []);

  const requestSync = useCallback(async () => {
    if (!isSupported) return false;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      return true;
    } catch (error) {
      console.error('Background sync failed:', error);
      return false;
    }
  }, [tag, isSupported]);

  return { isSupported, requestSync };
}

// Persist state to IndexedDB
export function useIndexedDB<T>(
  dbName: string,
  storeName: string,
  key: string,
  initialValue: T
) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const dbRef = useRef<IDBDatabase | null>(null);

  useEffect(() => {
    const request = indexedDB.open(dbName, 1);

    request.onerror = () => {
      console.error('IndexedDB error');
      setIsLoading(false);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };

    request.onsuccess = (event) => {
      dbRef.current = (event.target as IDBOpenDBRequest).result;
      
      const transaction = dbRef.current.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const getRequest = store.get(key);

      getRequest.onsuccess = () => {
        if (getRequest.result !== undefined) {
          setValue(getRequest.result);
        }
        setIsLoading(false);
      };
    };

    return () => {
      dbRef.current?.close();
    };
  }, [dbName, storeName, key]);

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const nextValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prev) 
        : newValue;

      if (dbRef.current) {
        const transaction = dbRef.current.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.put(nextValue, key);
      }

      return nextValue;
    });
  }, [storeName, key]);

  return [value, updateValue, isLoading] as const;
}
