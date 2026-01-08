import { useState, useEffect, useCallback, useRef } from 'react';

// Re-export debounce/throttle hooks from their canonical locations
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { useThrottle, useThrottleCallback as useThrottledCallback } from './useThrottle';

// Memoized fetch with caching
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number; // Time to live in ms
    enabled?: boolean;
    refetchOnMount?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { ttl = 5 * 60 * 1000, enabled = true, refetchOnMount = true, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(() => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!data && enabled);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await fetcher();
      
      cache.set(key, { data: result, timestamp: Date.now() });
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, onSuccess, onError]);

  useEffect(() => {
    if (!enabled) return;

    const cached = cache.get(key);
    const isStale = !cached || Date.now() - cached.timestamp >= ttl;

    if ((refetchOnMount && isStale) || !cached) {
      fetchData();
    }
  }, [key, enabled, refetchOnMount, ttl, fetchData]);

  const refetch = useCallback(() => {
    cache.delete(key);
    return fetchData();
  }, [key, fetchData]);

  const invalidate = useCallback(() => {
    cache.delete(key);
    setData(null);
  }, [key]);

  return { data, isLoading, error, refetch, invalidate };
}

// Clear cache utility
export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// Request queue for rate limiting
class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private running = 0;
  private maxConcurrent: number;
  private interval: number;
  private lastRun = 0;

  constructor(maxConcurrent = 3, interval = 0) {
    this.maxConcurrent = maxConcurrent;
    this.interval = interval;
  }

  add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) return;

    const now = Date.now();
    const timeSinceLastRun = now - this.lastRun;

    if (timeSinceLastRun < this.interval) {
      setTimeout(() => this.process(), this.interval - timeSinceLastRun);
      return;
    }

    const request = this.queue.shift();
    if (!request) return;

    this.running++;
    this.lastRun = Date.now();

    try {
      await request();
    } finally {
      this.running--;
      this.process();
    }
  }
}

// Singleton queue instance
const requestQueue = new RequestQueue(3, 100);

export function useQueuedRequest<T>(
  request: () => Promise<T>
): {
  execute: () => Promise<T>;
  isLoading: boolean;
  error: Error | null;
  data: T | null;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestQueue.add(request);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  return { execute, isLoading, error, data };
}

// Lazy loading hook
export function useLazyLoad<T>(
  loader: () => Promise<T>,
  options: { threshold?: number; rootMargin?: string } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: options.threshold ?? 0.1,
        rootMargin: options.rootMargin ?? '100px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  useEffect(() => {
    if (isVisible && !data && !isLoading) {
      setIsLoading(true);
      loader()
        .then(setData)
        .finally(() => setIsLoading(false));
    }
  }, [isVisible, data, isLoading, loader]);

  return { ref, data, isLoading, isVisible };
}
