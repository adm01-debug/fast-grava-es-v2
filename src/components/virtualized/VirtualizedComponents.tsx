import React, { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

// Virtual List Component
interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  emptyMessage?: string;
  gap?: number;
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
  emptyMessage = 'Nenhum item encontrado',
  gap = 0,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof itemHeight === 'function' ? itemHeight : () => itemHeight,
    overscan,
    gap,
  });

  if (items.length === 0) {
    return (
      <div 
        className={cn('flex items-center justify-center text-muted-foreground', className)}
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', className)}
      style={{ height }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Virtual Grid Component
interface VirtualGridProps<T> {
  items: T[];
  height: number;
  columns: number;
  rowHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  gap?: number;
}

export function VirtualGrid<T>({
  items,
  height,
  columns,
  rowHeight,
  renderItem,
  overscan = 3,
  className = '',
  gap = 8,
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(items.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight + gap,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', className)}
      style={{ height }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowItems = items.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
                paddingBottom: `${gap}px`,
              }}
            >
              {rowItems.map((item, i) => (
                <div key={startIndex + i}>
                  {renderItem(item, startIndex + i)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Infinite scroll hook
interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 100,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            onLoadMore();
          }
        },
        { rootMargin: `${threshold}px` }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasMore, onLoadMore, threshold]
  );

  return { lastElementRef };
}

// Virtual Table Component
interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: number | string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface VirtualTableProps<T> {
  items: T[];
  columns: Column<T>[];
  height: number;
  rowHeight?: number;
  headerHeight?: number;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
  selectedIndex?: number;
}

export function VirtualTable<T extends Record<string, any>>({
  items,
  columns,
  height,
  rowHeight = 48,
  headerHeight = 40,
  className = '',
  onRowClick,
  selectedIndex,
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div
        className="flex border-b bg-muted/50 font-medium text-sm"
        style={{ height: headerHeight }}
      >
        {columns.map((col) => (
          <div
            key={String(col.key)}
            className="flex items-center px-4"
            style={{ width: col.width || 'auto', flex: col.width ? 'none' : 1 }}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* Body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: height - headerHeight }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const item = items[virtualRow.index];
            const isSelected = selectedIndex === virtualRow.index;

            return (
              <div
                key={virtualRow.key}
                className={cn(
                  'flex border-b text-sm transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-muted/50',
                  isSelected && 'bg-primary/10'
                )}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onRowClick?.(item, virtualRow.index)}
              >
                {columns.map((col) => (
                  <div
                    key={String(col.key)}
                    className="flex items-center px-4 truncate"
                    style={{ width: col.width || 'auto', flex: col.width ? 'none' : 1 }}
                  >
                    {col.render
                      ? col.render(item, virtualRow.index)
                      : item[col.key as keyof T]}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
