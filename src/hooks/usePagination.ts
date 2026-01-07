import { useState, useCallback, useEffect } from 'react';

// Pagination types
interface UsePaginationOptions {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
  siblingCount?: number;
}

interface PaginationRange {
  start: number;
  end: number;
}

export function usePagination({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1,
  siblingCount = 1,
}: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(itemsPerPage);

  const totalPages = Math.ceil(totalItems / perPage);

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const changePerPage = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  }, []);

  // Calculate item range
  const range: PaginationRange = {
    start: (currentPage - 1) * perPage,
    end: Math.min(currentPage * perPage, totalItems),
  };

  // Generate page numbers for display
  const getPageNumbers = useCallback((): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    
    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const leftSibling = Math.max(currentPage - siblingCount, 2);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1);

    // Add left ellipsis if needed
    if (leftSibling > 2) {
      pages.push('ellipsis');
    }

    // Add sibling pages
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Add right ellipsis if needed
    if (rightSibling < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages, siblingCount]);

  return {
    currentPage,
    totalPages,
    perPage,
    totalItems,
    range,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    pageNumbers: getPageNumbers(),
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    changePerPage,
    setCurrentPage,
  };
}

// Cursor-based pagination (for infinite scroll)
interface UseCursorPaginationOptions<T> {
  fetchPage: (cursor: string | null, limit: number) => Promise<{
    items: T[];
    nextCursor: string | null;
    hasMore: boolean;
  }>;
  limit?: number;
  initialData?: T[];
}

export function useCursorPagination<T>({
  fetchPage,
  limit = 20,
  initialData = [],
}: UseCursorPaginationOptions<T>) {
  const [items, setItems] = useState<T[]>(initialData);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchPage(cursor, limit);
      setItems((prev) => [...prev, ...result.items]);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, fetchPage, hasMore, isLoading, limit]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setCursor(null);

    try {
      const result = await fetchPage(null, limit);
      setItems(result.items);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, limit]);

  const reset = useCallback(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setError(null);
  }, []);

  return {
    items,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    reset,
    isEmpty: items.length === 0 && !isLoading,
  };
}

// Offset-based pagination hook
interface UseOffsetPaginationOptions<T> {
  fetchPage: (offset: number, limit: number) => Promise<{
    items: T[];
    total: number;
  }>;
  limit?: number;
}

export function useOffsetPagination<T>({
  fetchPage,
  limit = 20,
}: UseOffsetPaginationOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  const loadPage = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchPage((pageNum - 1) * limit, limit);
      setItems(result.items);
      setTotal(result.total);
      setPage(pageNum);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, limit]);

  const goToPage = useCallback((pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      loadPage(pageNum);
    }
  }, [loadPage, totalPages]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      loadPage(page + 1);
    }
  }, [page, totalPages, loadPage]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      loadPage(page - 1);
    }
  }, [page, loadPage]);

  const refresh = useCallback(() => {
    loadPage(page);
  }, [loadPage, page]);

  return {
    items,
    total,
    page,
    totalPages,
    offset,
    limit,
    isLoading,
    error,
    isFirstPage: page === 1,
    isLastPage: page === totalPages,
    goToPage,
    nextPage,
    prevPage,
    refresh,
    loadPage,
  };
}
