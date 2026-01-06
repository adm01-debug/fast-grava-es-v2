import * as React from 'react';
import { useVirtualizer, VirtualizerOptions } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

// ============================================================================
// OPTIMIZED VIRTUAL LIST
// ============================================================================

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, virtualRow: { size: number; start: number }) => React.ReactNode;
  estimateSize?: number | ((index: number) => number);
  overscan?: number;
  getItemKey?: (item: T, index: number) => string | number;
  className?: string;
  containerClassName?: string;
  maxHeight?: number | string;
  gap?: number;
  horizontal?: boolean;
  paddingStart?: number;
  paddingEnd?: number;
  scrollToIndex?: number;
  onScroll?: (scrollOffset: number) => void;
  emptyComponent?: React.ReactNode;
  stickyIndices?: number[];
  rangeExtractor?: VirtualizerOptions<HTMLDivElement, Element>['rangeExtractor'];
}

export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 50,
  overscan = 5,
  getItemKey = (_, index) => index,
  className,
  containerClassName,
  maxHeight = 600,
  gap = 0,
  horizontal = false,
  paddingStart = 0,
  paddingEnd = 0,
  scrollToIndex,
  onScroll,
  emptyComponent,
  stickyIndices = [],
  rangeExtractor,
}: VirtualListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const scrollingRef = React.useRef<number | null>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof estimateSize === 'function' ? estimateSize : () => estimateSize + gap,
    overscan,
    horizontal,
    paddingStart,
    paddingEnd,
    getItemKey: (index) => getItemKey(items[index], index),
    rangeExtractor,
  });

  // Scroll to index when prop changes
  React.useEffect(() => {
    if (scrollToIndex !== undefined && scrollToIndex >= 0 && scrollToIndex < items.length) {
      virtualizer.scrollToIndex(scrollToIndex, { align: 'center', behavior: 'smooth' });
    }
  }, [scrollToIndex, items.length, virtualizer]);

  // Scroll event handling with debounce
  React.useEffect(() => {
    const element = parentRef.current;
    if (!element || !onScroll) return;

    const handleScroll = () => {
      if (scrollingRef.current) {
        cancelAnimationFrame(scrollingRef.current);
      }
      scrollingRef.current = requestAnimationFrame(() => {
        onScroll(horizontal ? element.scrollLeft : element.scrollTop);
      });
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollingRef.current) {
        cancelAnimationFrame(scrollingRef.current);
      }
    };
  }, [horizontal, onScroll]);

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  if (items.length === 0) {
    return emptyComponent || (
      <div className={cn('flex items-center justify-center py-8 text-muted-foreground', className)}>
        Nenhum item
      </div>
    );
  }

  const sizeKey = horizontal ? 'width' : 'height';
  const offsetKey = horizontal ? 'left' : 'top';

  return (
    <div
      ref={parentRef}
      className={cn(
        'overflow-auto',
        containerClassName
      )}
      style={{ 
        maxHeight: horizontal ? undefined : maxHeight,
        maxWidth: horizontal ? maxHeight : undefined,
      }}
    >
      <div
        className={cn('relative', className)}
        style={{
          [sizeKey]: `${totalSize}px`,
          [horizontal ? 'height' : 'width']: '100%',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index];
          const isSticky = stickyIndices.includes(virtualRow.index);

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className={cn(
                isSticky && 'sticky z-10 bg-background'
              )}
              style={{
                position: isSticky ? 'sticky' : 'absolute',
                [offsetKey]: isSticky ? 0 : `${virtualRow.start}px`,
                [horizontal ? 'top' : 'left']: 0,
                [sizeKey]: horizontal ? undefined : '100%',
                [horizontal ? 'height' : 'width']: horizontal ? '100%' : undefined,
                paddingBottom: gap > 0 && !horizontal ? gap : undefined,
                paddingRight: gap > 0 && horizontal ? gap : undefined,
              }}
            >
              {renderItem(item, virtualRow.index, {
                size: virtualRow.size,
                start: virtualRow.start,
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// VIRTUAL GRID
// ============================================================================

interface VirtualGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  columns: number;
  estimateRowHeight?: number;
  estimateColumnWidth?: number;
  overscan?: number;
  getItemKey?: (item: T, index: number) => string | number;
  className?: string;
  containerClassName?: string;
  maxHeight?: number | string;
  gap?: number;
  emptyComponent?: React.ReactNode;
}

export function VirtualGrid<T>({
  items,
  renderItem,
  columns,
  estimateRowHeight = 150,
  overscan = 3,
  getItemKey = (_, index) => index,
  className,
  containerClassName,
  maxHeight = 600,
  gap = 8,
  emptyComponent,
}: VirtualGridProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);
  
  const rows = Math.ceil(items.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight + gap,
    overscan,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  if (items.length === 0) {
    return emptyComponent || (
      <div className={cn('flex items-center justify-center py-8 text-muted-foreground', className)}>
        Nenhum item
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', containerClassName)}
      style={{ maxHeight }}
    >
      <div
        className={cn('relative', className)}
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowItems = items.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              className="absolute left-0 right-0 grid"
              style={{
                top: `${virtualRow.start}px`,
                height: `${virtualRow.size}px`,
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap,
                paddingBottom: gap,
              }}
            >
              {rowItems.map((item, colIndex) => {
                const globalIndex = startIndex + colIndex;
                return (
                  <div key={getItemKey(item, globalIndex)}>
                    {renderItem(item, globalIndex)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// VIRTUAL TABLE
// ============================================================================

interface VirtualTableColumn<T> {
  key: string;
  header: React.ReactNode;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  render: (item: T, index: number) => React.ReactNode;
  sticky?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface VirtualTableProps<T> {
  items: T[];
  columns: VirtualTableColumn<T>[];
  rowHeight?: number;
  headerHeight?: number;
  overscan?: number;
  getRowKey?: (item: T, index: number) => string | number;
  className?: string;
  maxHeight?: number | string;
  stickyHeader?: boolean;
  onRowClick?: (item: T, index: number) => void;
  selectedIndex?: number;
  emptyComponent?: React.ReactNode;
  zebra?: boolean;
}

export function VirtualTable<T>({
  items,
  columns,
  rowHeight = 48,
  headerHeight = 48,
  overscan = 10,
  getRowKey = (_, index) => index,
  className,
  maxHeight = 500,
  stickyHeader = true,
  onRowClick,
  selectedIndex,
  emptyComponent,
  zebra = true,
}: VirtualTableProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
    paddingStart: stickyHeader ? headerHeight : 0,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  if (items.length === 0) {
    return emptyComponent || (
      <div className={cn('flex items-center justify-center py-8 text-muted-foreground', className)}>
        Nenhum registro encontrado
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto border rounded-lg', className)}
      style={{ maxHeight }}
    >
      {/* Header */}
      {stickyHeader && (
        <div
          className="sticky top-0 z-20 flex bg-muted/50 backdrop-blur-sm border-b"
          style={{ height: headerHeight }}
        >
          {columns.map((col) => (
            <div
              key={col.key}
              className={cn(
                'flex items-center px-4 font-medium text-muted-foreground',
                col.sticky && 'sticky left-0 z-10 bg-muted/50',
                col.align === 'center' && 'justify-center',
                col.align === 'right' && 'justify-end'
              )}
              style={{
                width: col.width,
                minWidth: col.minWidth,
                maxWidth: col.maxWidth,
                flex: col.width ? undefined : 1,
              }}
            >
              {col.header}
            </div>
          ))}
        </div>
      )}

      {/* Body */}
      <div
        className="relative"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {virtualRows.map((virtualRow) => {
          const item = items[virtualRow.index];
          const isSelected = selectedIndex === virtualRow.index;
          const isEven = virtualRow.index % 2 === 0;

          return (
            <div
              key={getRowKey(item, virtualRow.index)}
              className={cn(
                'absolute left-0 right-0 flex border-b transition-colors',
                zebra && isEven && 'bg-muted/20',
                isSelected && 'bg-primary/10',
                onRowClick && 'cursor-pointer hover:bg-muted/40'
              )}
              style={{
                height: rowHeight,
                top: `${virtualRow.start}px`,
              }}
              onClick={() => onRowClick?.(item, virtualRow.index)}
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className={cn(
                    'flex items-center px-4',
                    col.sticky && 'sticky left-0 z-10 bg-inherit',
                    col.align === 'center' && 'justify-center',
                    col.align === 'right' && 'justify-end'
                  )}
                  style={{
                    width: col.width,
                    minWidth: col.minWidth,
                    maxWidth: col.maxWidth,
                    flex: col.width ? undefined : 1,
                  }}
                >
                  {col.render(item, virtualRow.index)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

export function useVirtualScroll<T>(
  items: T[],
  options: {
    estimateSize?: number;
    overscan?: number;
    horizontal?: boolean;
  } = {}
) {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const { estimateSize = 50, overscan = 5, horizontal = false } = options;

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    horizontal,
  });

  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    scrollToIndex: virtualizer.scrollToIndex,
    measureElement: virtualizer.measureElement,
  };
}
