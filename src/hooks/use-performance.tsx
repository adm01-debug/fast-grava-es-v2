import * as React from 'react';

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLElement>, boolean] {
  const ref = React.useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isIntersecting];
}

// Lazy component wrapper
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export function LazyComponent({
  children,
  fallback = null,
  rootMargin = '100px',
  threshold = 0,
}: LazyComponentProps) {
  const [ref, isIntersecting] = useIntersectionObserver({
    rootMargin,
    threshold,
  });
  const [hasLoaded, setHasLoaded] = React.useState(false);

  React.useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isIntersecting, hasLoaded]);

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      {hasLoaded ? children : fallback}
    </div>
  );
}

// Virtualized list hook
interface VirtualizedListOptions<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualizedListResult<T> {
  virtualItems: { item: T; index: number; style: React.CSSProperties }[];
  totalHeight: number;
  containerProps: {
    style: React.CSSProperties;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  };
  contentProps: {
    style: React.CSSProperties;
  };
}

export function useVirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
}: VirtualizedListOptions<T>): VirtualizedListResult<T> {
  const [scrollTop, setScrollTop] = React.useState(0);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const virtualItems = React.useMemo(() => {
    const result = [];
    for (let i = startIndex; i <= endIndex; i++) {
      result.push({
        item: items[i],
        index: i,
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        },
      });
    }
    return result;
  }, [items, startIndex, endIndex, itemHeight]);

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    virtualItems,
    totalHeight,
    containerProps: {
      style: {
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      },
      onScroll: handleScroll,
    },
    contentProps: {
      style: {
        height: totalHeight,
        position: 'relative',
      },
    },
  };
}

// Debounced callback
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const debouncedCallback = React.useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// Throttled callback
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = React.useRef(Date.now());

  const throttledCallback = React.useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}

// Memory cache hook
interface CacheOptions {
  maxAge?: number; // in milliseconds
  maxSize?: number; // max number of entries
}

export function useMemoryCache<T>(options: CacheOptions = {}) {
  const { maxAge = 5 * 60 * 1000, maxSize = 100 } = options;
  const cacheRef = React.useRef<Map<string, { value: T; timestamp: number }>>(new Map());

  const get = React.useCallback((key: string): T | undefined => {
    const entry = cacheRef.current.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > maxAge) {
      cacheRef.current.delete(key);
      return undefined;
    }

    return entry.value;
  }, [maxAge]);

  const set = React.useCallback((key: string, value: T) => {
    // Clean up old entries if cache is full
    if (cacheRef.current.size >= maxSize) {
      const oldestKey = cacheRef.current.keys().next().value;
      if (oldestKey) cacheRef.current.delete(oldestKey);
    }

    cacheRef.current.set(key, { value, timestamp: Date.now() });
  }, [maxSize]);

  const remove = React.useCallback((key: string) => {
    cacheRef.current.delete(key);
  }, []);

  const clear = React.useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const has = React.useCallback((key: string): boolean => {
    const entry = cacheRef.current.get(key);
    if (!entry) return false;
    if (Date.now() - entry.timestamp > maxAge) {
      cacheRef.current.delete(key);
      return false;
    }
    return true;
  }, [maxAge]);

  return { get, set, remove, clear, has };
}

// Performance metrics hook
interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
}

export function usePerformanceMetrics(): PerformanceMetrics {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });

  React.useEffect(() => {
    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntriesByName('first-contentful-paint');
      if (entries.length > 0) {
        setMetrics((prev) => ({ ...prev, fcp: entries[0].startTime }));
      }
    });
    try {
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {}

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1];
        setMetrics((prev) => ({ ...prev, lcp: lastEntry.startTime }));
      }
    });
    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {}

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEventTiming[];
      if (entries.length > 0) {
        setMetrics((prev) => ({ ...prev, fid: entries[0].processingStart - entries[0].startTime }));
      }
    });
    try {
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {}

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          setMetrics((prev) => ({ ...prev, cls: clsValue }));
        }
      }
    });
    try {
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}

    // Time to First Byte
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      setMetrics((prev) => ({
        ...prev,
        ttfb: navigationEntry.responseStart - navigationEntry.requestStart,
      }));
    }

    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  return metrics;
}

// Prefetch hook
export function usePrefetch() {
  const prefetchedUrls = React.useRef<Set<string>>(new Set());

  const prefetch = React.useCallback((url: string) => {
    if (prefetchedUrls.current.has(url)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
    prefetchedUrls.current.add(url);
  }, []);

  const preconnect = React.useCallback((url: string) => {
    if (prefetchedUrls.current.has(`preconnect:${url}`)) return;

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    document.head.appendChild(link);
    prefetchedUrls.current.add(`preconnect:${url}`);
  }, []);

  return { prefetch, preconnect };
}

// Image preloader
export function useImagePreloader(srcs: string[]) {
  const [loadedImages, setLoadedImages] = React.useState<Set<string>>(new Set());
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (srcs.length === 0) {
      setProgress(100);
      return;
    }

    let loaded = 0;
    const newLoaded = new Set<string>();

    srcs.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        newLoaded.add(src);
        setLoadedImages(new Set(newLoaded));
        setProgress((loaded / srcs.length) * 100);
      };
      img.onerror = () => {
        loaded++;
        setProgress((loaded / srcs.length) * 100);
      };
      img.src = src;
    });
  }, [srcs]);

  return { loadedImages, progress, isComplete: progress === 100 };
}
