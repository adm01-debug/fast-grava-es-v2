import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Infinite scroll hook
interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useInfiniteScrollHook(
  onLoadMore: () => void,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 0.5, rootMargin = '100px', enabled = true } = options;
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setIsLoading(true);
          await onLoadMore();
          setIsLoading(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onLoadMore, threshold, rootMargin, enabled, isLoading]);

  return { sentinelRef, isLoading };
}

// Infinite scroll container
interface InfiniteScrollContainerProps {
  children: React.ReactNode;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  endComponent?: React.ReactNode;
  className?: string;
  threshold?: number;
}

export function InfiniteScrollContainer({
  children,
  onLoadMore,
  hasMore,
  isLoading = false,
  loadingComponent,
  endComponent,
  className,
  threshold = 0.5,
}: InfiniteScrollContainerProps) {
  const { sentinelRef, isLoading: loadingMore } = useInfiniteScrollHook(
    onLoadMore,
    { enabled: hasMore && !isLoading, threshold }
  );

  const loading = isLoading || loadingMore;

  return (
    <div className={className}>
      {children}
      
      {hasMore && (
        <div ref={sentinelRef} className="py-4">
          {loading ? (
            loadingComponent || (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )
          ) : null}
        </div>
      )}
      
      {!hasMore && endComponent && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 text-center">
          {endComponent}
        </motion.div>
      )}
    </div>
  );
}

// Enhanced Pagination component
interface EnhancedPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSize?: boolean;
  className?: string;
  disabled?: boolean;
}

export function EnhancedPagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSize = true,
  className,
  disabled = false,
}: EnhancedPaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range: (number | 'ellipsis')[] = [];
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    range.push(1);
    if (left > 2) range.push('ellipsis');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push('ellipsis');
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      {showPageSize && onPageSizeChange && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Exibir</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
            disabled={disabled}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">por página</span>
        </div>
      )}

      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(1)} disabled={currentPage === 1 || disabled}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1 || disabled}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => (
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(page)}
                disabled={disabled}
              >
                {page}
              </Button>
            )
          ))}
        </div>

        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || disabled}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages || disabled}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </div>
    </div>
  );
}

// Load more button
interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  className?: string;
}

export function LoadMoreButton({ onClick, isLoading, hasMore = true, className }: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("flex justify-center py-4", className)}>
      <Button variant="outline" onClick={onClick} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Carregando...
          </>
        ) : (
          'Carregar mais'
        )}
      </Button>
    </motion.div>
  );
}
