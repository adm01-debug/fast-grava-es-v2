import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface InfiniteScrollListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;
  loadMoreRef: (node: HTMLElement | null) => void;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  totalCount: number;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  skeletonCount?: number;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
  itemClassName?: string;
}

export function InfiniteScrollList<T>({
  data,
  renderItem,
  keyExtractor,
  loadMoreRef,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  totalCount,
  emptyMessage = 'Nenhum item encontrado',
  emptyIcon,
  skeletonCount = 5,
  showLoadMore = false,
  onLoadMore,
  className = '',
  itemClassName = '',
}: InfiniteScrollListProps<T>) {
  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {emptyIcon && <div className="mb-4 text-muted-foreground">{emptyIcon}</div>}
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Items */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={keyExtractor(item)} className={itemClassName}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-1" />

      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Manual load more button */}
      {showLoadMore && hasNextPage && !isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Button variant="outline" onClick={onLoadMore}>
            Carregar mais
          </Button>
        </div>
      )}

      {/* End of list indicator */}
      {!hasNextPage && data.length > 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          {totalCount > 0 ? `${data.length} de ${totalCount} registros` : `${data.length} registros`}
        </div>
      )}
    </div>
  );
}
