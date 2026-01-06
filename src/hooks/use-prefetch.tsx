import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';

// ============================================================================
// PREFETCH HOOK
// ============================================================================

interface PrefetchOptions {
  staleTime?: number;
  cacheTime?: number;
}

export function usePrefetch() {
  const queryClient = useQueryClient();
  const prefetchedRef = React.useRef<Set<string>>(new Set());

  const prefetchQuery = React.useCallback(
    async <T,>(
      queryKey: (string | number | object)[],
      queryFn: () => Promise<T>,
      options: PrefetchOptions = {}
    ) => {
      const key = JSON.stringify(queryKey);
      
      // Avoid duplicate prefetches
      if (prefetchedRef.current.has(key)) {
        return;
      }

      prefetchedRef.current.add(key);

      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
        gcTime: options.cacheTime ?? 30 * 60 * 1000, // 30 minutes
      });
    },
    [queryClient]
  );

  const prefetchOnHover = React.useCallback(
    <T,>(
      queryKey: (string | number | object)[],
      queryFn: () => Promise<T>,
      options?: PrefetchOptions
    ) => {
      return {
        onMouseEnter: () => prefetchQuery(queryKey, queryFn, options),
        onFocus: () => prefetchQuery(queryKey, queryFn, options),
      };
    },
    [prefetchQuery]
  );

  const clearPrefetchCache = React.useCallback(() => {
    prefetchedRef.current.clear();
  }, []);

  return {
    prefetchQuery,
    prefetchOnHover,
    clearPrefetchCache,
  };
}

// ============================================================================
// LINK PREFETCH COMPONENT
// ============================================================================

interface PrefetchLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  prefetchData?: () => Promise<unknown>;
  prefetchDelay?: number;
  children: React.ReactNode;
}

export function PrefetchLink({
  to,
  prefetchData,
  prefetchDelay = 100,
  children,
  onMouseEnter,
  ...props
}: PrefetchLinkProps) {
  const prefetchedRef = React.useRef(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout>>();

  const handleMouseEnter = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!prefetchedRef.current && prefetchData) {
        timerRef.current = setTimeout(() => {
          prefetchData();
          prefetchedRef.current = true;
        }, prefetchDelay);
      }
      onMouseEnter?.(e);
    },
    [prefetchData, prefetchDelay, onMouseEnter]
  );

  const handleMouseLeave = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <a
      href={to}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </a>
  );
}

// ============================================================================
// IMAGE PREFETCH
// ============================================================================

export function useImagePrefetch() {
  const prefetchedImages = React.useRef<Set<string>>(new Set());

  const prefetchImage = React.useCallback((src: string) => {
    if (prefetchedImages.current.has(src)) return;

    const img = new Image();
    img.src = src;
    prefetchedImages.current.add(src);
  }, []);

  const prefetchImages = React.useCallback((srcs: string[]) => {
    srcs.forEach(prefetchImage);
  }, [prefetchImage]);

  return { prefetchImage, prefetchImages };
}

// ============================================================================
// ROUTE PREFETCH
// ============================================================================

type RouteModule = () => Promise<{ default: React.ComponentType }>;

export function useRoutePrefetch() {
  const prefetchedRoutes = React.useRef<Set<string>>(new Set());

  const prefetchRoute = React.useCallback((routePath: string, loader: RouteModule) => {
    if (prefetchedRoutes.current.has(routePath)) return;

    // Prefetch the route module
    loader();
    prefetchedRoutes.current.add(routePath);
  }, []);

  const createPrefetchHandler = React.useCallback(
    (routePath: string, loader: RouteModule) => ({
      onMouseEnter: () => prefetchRoute(routePath, loader),
      onFocus: () => prefetchRoute(routePath, loader),
    }),
    [prefetchRoute]
  );

  return { prefetchRoute, createPrefetchHandler };
}

// ============================================================================
// INTERSECTION PREFETCH
// ============================================================================

interface UseIntersectionPrefetchOptions {
  queryKey: (string | number | object)[];
  queryFn: () => Promise<unknown>;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useIntersectionPrefetch({
  queryKey,
  queryFn,
  threshold = 0,
  rootMargin = '200px',
  enabled = true,
}: UseIntersectionPrefetchOptions) {
  const queryClient = useQueryClient();
  const ref = React.useRef<HTMLElement>(null);
  const hasPrefetched = React.useRef(false);

  React.useEffect(() => {
    if (!enabled || hasPrefetched.current) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPrefetched.current) {
          queryClient.prefetchQuery({ queryKey, queryFn });
          hasPrefetched.current = true;
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [queryClient, queryKey, queryFn, threshold, rootMargin, enabled]);

  return ref;
}

// ============================================================================
// BATCH PREFETCH
// ============================================================================

interface PrefetchItem {
  queryKey: (string | number | object)[];
  queryFn: () => Promise<unknown>;
  priority?: number;
}

export function useBatchPrefetch() {
  const queryClient = useQueryClient();
  const queueRef = React.useRef<PrefetchItem[]>([]);
  const isProcessingRef = React.useRef(false);

  const processQueue = React.useCallback(async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) return;

    isProcessingRef.current = true;

    // Sort by priority (higher first)
    const queue = [...queueRef.current].sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    );
    queueRef.current = [];

    // Process in batches of 3
    const batchSize = 3;
    for (let i = 0; i < queue.length; i += batchSize) {
      const batch = queue.slice(i, i + batchSize);
      await Promise.all(
        batch.map((item) =>
          queryClient.prefetchQuery({
            queryKey: item.queryKey,
            queryFn: item.queryFn,
          })
        )
      );
      // Small delay between batches to avoid overwhelming the network
      if (i + batchSize < queue.length) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    isProcessingRef.current = false;

    // Check if more items were added while processing
    if (queueRef.current.length > 0) {
      processQueue();
    }
  }, [queryClient]);

  const addToPrefetchQueue = React.useCallback(
    (item: PrefetchItem) => {
      queueRef.current.push(item);

      // Use requestIdleCallback if available, otherwise setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => processQueue());
      } else {
        setTimeout(processQueue, 0);
      }
    },
    [processQueue]
  );

  return { addToPrefetchQueue };
}
