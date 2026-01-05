import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InfiniteScrollOptions {
  tableName: string;
  selectColumns?: string;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, unknown>;
  pageSize?: number;
  enabled?: boolean;
}

export interface InfiniteScrollResult<T> {
  data: T[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  totalCount: number;
  loadMoreRef: (node: HTMLElement | null) => void;
}

export function useInfiniteScroll<T extends { id: string }>(
  queryKey: string[],
  options: InfiniteScrollOptions
): InfiniteScrollResult<T> {
  const {
    tableName,
    selectColumns = '*',
    orderBy = { column: 'created_at', ascending: false },
    filters = {},
    pageSize = 20,
    enabled = true,
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: [...queryKey, 'infinite', filters],
    queryFn: async ({ pageParam = 0 }) => {
      // @ts-ignore - Dynamic table access
      let query = supabase.from(tableName)
        .select(selectColumns, { count: 'exact' })
        .order(orderBy.column, { ascending: orderBy.ascending ?? false })
        .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'string' && value.includes('%')) {
            query = query.ilike(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      const { data: resultData, error: queryError, count } = await query;

      if (queryError) throw queryError;

      return {
        items: (resultData || []) as T[],
        nextPage: (resultData?.length ?? 0) === pageSize ? pageParam + 1 : undefined,
        totalCount: count ?? 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled,
  });

  const allItems = data?.pages.flatMap(page => page.items) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const setLoadMoreRef = useCallback((node: HTMLElement | null) => {
    if (loadMoreRef.current) observerRef.current?.unobserve(loadMoreRef.current);
    loadMoreRef.current = node;
    if (node) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
        },
        { threshold: 0.1, rootMargin: '100px' }
      );
      observerRef.current.observe(node);
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => () => { observerRef.current?.disconnect(); }, []);

  return { data: allItems, fetchNextPage, hasNextPage: hasNextPage ?? false, isFetchingNextPage, isLoading, isError, error: error as Error | null, totalCount, loadMoreRef: setLoadMoreRef };
}
