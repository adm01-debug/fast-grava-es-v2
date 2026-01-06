import { useRef, useState, useEffect, useCallback } from "react";

/**
 * Hook para Lazy Loading Inteligente
 * Carrega componentes/dados apenas quando necessário
 */

interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

// Hook principal para lazy loading de elementos
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: LazyLoadOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = "50px",
    triggerOnce = true,
    delay = 0
  } = options;

  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (hasTriggered && triggerOnce) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => {
                setIsVisible(true);
                setHasTriggered(true);
              }, delay);
            } else {
              setIsVisible(true);
              setHasTriggered(true);
            }

            if (triggerOnce) {
              observer.unobserve(element);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, delay, hasTriggered]);

  return { ref, isVisible, hasTriggered };
}

// Hook para lazy loading de imagens
interface LazyImageOptions extends LazyLoadOptions {
  src: string;
  placeholderSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function useLazyImage(options: LazyImageOptions) {
  const {
    src,
    placeholderSrc = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    onLoad,
    onError,
    ...lazyOptions
  } = options;

  const { ref, isVisible } = useLazyLoad<HTMLImageElement>(lazyOptions);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      setHasError(true);
      onError?.();
    };

    img.src = src;
  }, [isVisible, src, onLoad, onError]);

  return {
    ref,
    src: currentSrc,
    isLoaded,
    hasError,
    isVisible
  };
}

// Hook para lazy loading de listas
interface LazyListOptions<T> {
  items: T[];
  pageSize?: number;
  threshold?: number;
}

export function useLazyList<T>(options: LazyListOptions<T>) {
  const { items, pageSize = 20, threshold = 0.8 } = options;

  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    
    requestAnimationFrame(() => {
      setVisibleCount(prev => Math.min(prev + pageSize, items.length));
      setIsLoading(false);
    });
  }, [isLoading, hasMore, pageSize, items.length]);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold }
    );

    observer.observe(loader);

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore, threshold]);

  const reset = useCallback(() => {
    setVisibleCount(pageSize);
  }, [pageSize]);

  return {
    visibleItems,
    loaderRef,
    isLoading,
    hasMore,
    loadMore,
    reset,
    totalCount: items.length,
    visibleCount
  };
}

// Cache para dados
const dataCache = new Map<string, { data: unknown; timestamp: number }>();

// Hook para lazy loading de dados assíncronos
interface LazyDataOptions<T> {
  fetcher: () => Promise<T>;
  enabled?: boolean;
  cacheKey?: string;
  staleTime?: number;
}

export function useLazyData<T>(options: LazyDataOptions<T>) {
  const { fetcher, enabled = true, cacheKey, staleTime = 5 * 60 * 1000 } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const { ref, isVisible } = useLazyLoad<HTMLDivElement>({ triggerOnce: true });

  const load = useCallback(async () => {
    if (!enabled || isLoading || hasLoaded) return;

    if (cacheKey) {
      const cached = dataCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < staleTime) {
        setData(cached.data as T);
        setHasLoaded(true);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      setHasLoaded(true);

      if (cacheKey) {
        dataCache.set(cacheKey, { data: result, timestamp: Date.now() });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load"));
    } finally {
      setIsLoading(false);
    }
  }, [enabled, isLoading, hasLoaded, cacheKey, staleTime, fetcher]);

  useEffect(() => {
    if (isVisible && enabled) {
      load();
    }
  }, [isVisible, enabled, load]);

  const refresh = useCallback(async () => {
    if (cacheKey) {
      dataCache.delete(cacheKey);
    }
    setHasLoaded(false);
    await load();
  }, [cacheKey, load]);

  return {
    ref,
    data,
    isLoading,
    error,
    hasLoaded,
    isVisible,
    refresh
  };
}

// Hook para prefetch em hover
interface PrefetchOptions<T> {
  fetcher: () => Promise<T>;
  cacheKey: string;
  delay?: number;
}

export function usePrefetchOnHover<T>(options: PrefetchOptions<T>) {
  const { fetcher, cacheKey, delay = 200 } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [isPrefetched, setIsPrefetched] = useState(false);

  const prefetch = useCallback(async () => {
    if (dataCache.has(cacheKey)) {
      setIsPrefetched(true);
      return;
    }

    setIsPrefetching(true);

    try {
      const result = await fetcher();
      dataCache.set(cacheKey, { data: result, timestamp: Date.now() });
      setIsPrefetched(true);
    } catch {
      // Ignorar erros de prefetch
    } finally {
      setIsPrefetching(false);
    }
  }, [fetcher, cacheKey]);

  const onMouseEnter = useCallback(() => {
    if (isPrefetched || isPrefetching) return;
    
    timeoutRef.current = setTimeout(prefetch, delay);
  }, [isPrefetched, isPrefetching, prefetch, delay]);

  const onMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    onMouseEnter,
    onMouseLeave,
    isPrefetching,
    isPrefetched
  };
}

// Limpar cache expirado periodicamente
if (typeof window !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000;

    dataCache.forEach((value, key) => {
      if (now - value.timestamp > maxAge) {
        dataCache.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}
