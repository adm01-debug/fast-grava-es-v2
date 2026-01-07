import { useState, useEffect, useCallback } from 'react';

// PWA Install Prompt Hook
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      
      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch {
      return false;
    }
  }, [deferredPrompt]);

  return { isInstallable, isInstalled, install };
}

// Service Worker Hook
export function useServiceWorker() {
  const [isReady, setIsReady] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const checkRegistration = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        setRegistration(reg);
        setIsReady(true);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setHasUpdate(true);
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    checkRegistration();
  }, []);

  const update = useCallback(async () => {
    if (!registration) return;
    
    setIsUpdating(true);
    try {
      await registration.update();
      window.location.reload();
    } finally {
      setIsUpdating(false);
    }
  }, [registration]);

  const skipWaiting = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  return { isReady, isUpdating, hasUpdate, update, skipWaiting };
}

// Offline Storage Hook
export function useOfflineStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const [isSynced, setIsSynced] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<T[]>([]);

  // Save to local storage
  const save = useCallback((newValue: T) => {
    setValue(newValue);
    localStorage.setItem(`offline_${key}`, JSON.stringify(newValue));
    
    if (!navigator.onLine) {
      setIsSynced(false);
      setPendingChanges((prev) => [...prev, newValue]);
    }
  }, [key]);

  // Sync when back online
  useEffect(() => {
    const handleOnline = () => {
      if (pendingChanges.length > 0) {
        // Here you would sync with the server
        console.log('Syncing pending changes:', pendingChanges);
        setPendingChanges([]);
        setIsSynced(true);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [pendingChanges]);

  return { value, save, isSynced, pendingChanges: pendingChanges.length };
}

// Background Sync Hook
export function useBackgroundSync(tag: string) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'sync' in (ServiceWorkerRegistration.prototype as any));
  }, []);

  const requestSync = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      setIsSyncing(true);
      return true;
    } catch {
      return false;
    }
  }, [isSupported, tag]);

  return { isSupported, isSyncing, requestSync };
}

// Push Notification Permission Hook
export function usePushPermission() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window && 'PushManager' in window);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return 'denied';

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      return 'denied';
    }
  }, [isSupported]);

  return { permission, isSupported, requestPermission };
}

// Cache Management Hook
export function useCacheManagement() {
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [cacheNames, setCacheNames] = useState<string[]>([]);

  useEffect(() => {
    const calculateCacheSize = async () => {
      if (!('caches' in window)) return;

      try {
        const names = await caches.keys();
        setCacheNames(names);

        let totalSize = 0;
        for (const name of names) {
          const cache = await caches.open(name);
          const requests = await cache.keys();
          
          for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              totalSize += blob.size;
            }
          }
        }
        setCacheSize(totalSize);
      } catch (error) {
        console.error('Error calculating cache size:', error);
      }
    };

    calculateCacheSize();
  }, []);

  const clearCache = useCallback(async (cacheName?: string) => {
    if (!('caches' in window)) return;

    try {
      if (cacheName) {
        await caches.delete(cacheName);
      } else {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      }
      setCacheSize(0);
      setCacheNames([]);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  return { cacheSize, cacheNames, clearCache };
}
