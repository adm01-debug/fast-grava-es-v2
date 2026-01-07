import { useState, useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

// #43 - Infinite Scroll Hook

interface UseInfiniteScrollOptions<T> {
  fetchFn: (page: number) => Promise<T[]>;
  initialPage?: number;
  pageSize?: number;
  threshold?: number;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn<T> {
  items: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  ref: (node?: Element | null) => void;
}

export function useInfiniteScroll<T>({
  fetchFn,
  initialPage = 1,
  pageSize = 20,
  threshold = 0.5,
  enabled = true
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const isFirstLoad = useRef(true);

  const { ref, inView } = useInView({
    threshold,
    triggerOnce: false
  });

  const fetchItems = useCallback(async (pageNum: number, isInitial: boolean) => {
    if (!enabled) return;

    try {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const newItems = await fetchFn(pageNum);
      
      if (newItems.length < pageSize) {
        setHasMore(false);
      }

      setItems(prev => isInitial ? newItems : [...prev, ...newItems]);
      setPage(pageNum + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar dados'));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [fetchFn, pageSize, enabled]);

  // Initial load
  useEffect(() => {
    if (isFirstLoad.current && enabled) {
      isFirstLoad.current = false;
      fetchItems(initialPage, true);
    }
  }, [fetchItems, initialPage, enabled]);

  // Load more when in view
  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore && enabled) {
      fetchItems(page, false);
    }
  }, [inView, hasMore, isLoading, isLoadingMore, page, fetchItems, enabled]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading && !isLoadingMore) {
      fetchItems(page, false);
    }
  }, [hasMore, isLoading, isLoadingMore, page, fetchItems]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    isFirstLoad.current = true;
  }, [initialPage]);

  return {
    items,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    reset,
    ref
  };
}

// Simpler version for manual triggering
export function useLoadMore<T>({
  fetchFn,
  pageSize = 20
}: {
  fetchFn: (page: number) => Promise<T[]>;
  pageSize?: number;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newItems = await fetchFn(page);
      if (newItems.length < pageSize) {
        setHasMore(false);
      }
      setItems(prev => [...prev, ...newItems]);
      setPage(p => p + 1);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, page, pageSize, isLoading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, []);

  return { items, isLoading, hasMore, loadMore, reset };
}

// Virtual scroll hook for large lists
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex).map((item, index) => ({
    item,
    index: startIndex + index,
    style: {
      position: 'absolute' as const,
      top: (startIndex + index) * itemHeight,
      height: itemHeight,
      width: '100%'
    }
  }));

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    onScroll,
    containerStyle: {
      height: containerHeight,
      overflow: 'auto' as const,
      position: 'relative' as const
    },
    innerStyle: {
      height: totalHeight,
      position: 'relative' as const
    }
  };
}

// Paginated fetch hook
export function usePaginatedFetch<T>({
  fetchFn,
  pageSize = 20,
  initialPage = 1
}: {
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>;
  pageSize?: number;
  initialPage?: number;
}) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  const fetchPage = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn(pageNum, pageSize);
      setData(result.data);
      setTotal(result.total);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, pageSize]);

  useEffect(() => {
    fetchPage(initialPage);
  }, [fetchPage, initialPage]);

  return {
    data,
    page,
    totalPages,
    total,
    isLoading,
    error,
    goToPage: fetchPage,
    nextPage: () => page < totalPages && fetchPage(page + 1),
    prevPage: () => page > 1 && fetchPage(page - 1),
    refresh: () => fetchPage(page)
  };
}
