import { useState, useCallback, useMemo } from 'react';

export function usePagination({ totalItems, pageSize: initialPageSize = 10, initialPage = 1 }: { totalItems: number; pageSize?: number; initialPage?: number }) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => Math.ceil(totalItems / pageSize), [totalItems, pageSize]);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const nextPage = useCallback(() => { if (hasNextPage) setPage(p => p + 1); }, [hasNextPage]);
  const prevPage = useCallback(() => { if (hasPrevPage) setPage(p => p - 1); }, [hasPrevPage]);
  const goToPage = useCallback((p: number) => setPage(Math.min(Math.max(1, p), totalPages)), [totalPages]);
  const changePageSize = useCallback((size: number) => { setPageSize(size); setPage(1); }, []);

  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return { page, pageSize, totalPages, hasNextPage, hasPrevPage, nextPage, prevPage, goToPage, setPageSize: changePageSize, startIndex, endIndex };
}
