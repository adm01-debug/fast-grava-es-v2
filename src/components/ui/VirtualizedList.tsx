import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface VirtualizedListProps<T> {
  /** Items to render */
  items: T[];
  /** Height of each item in pixels */
  itemHeight: number;
  /** Height of the container */
  containerHeight: number;
  /** Number of items to render above/below visible area */
  overscan?: number;
  /** Render function for each item */
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  /** Optional key extractor */
  getItemKey?: (item: T, index: number) => string | number;
  /** Container className */
  className?: string;
  /** Empty state component */
  emptyState?: React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Loading component */
  loadingComponent?: React.ReactNode;
  /** On scroll callback */
  onScroll?: (scrollTop: number) => void;
  /** Gap between items */
  gap?: number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
  renderItem,
  getItemKey,
  className,
  emptyState,
  isLoading,
  loadingComponent,
  onScroll,
  gap = 0,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate effective item height including gap
  const effectiveItemHeight = itemHeight + gap;

  // Calculate visible range
  const { startIndex, endIndex, visibleCount } = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / effectiveItemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / effectiveItemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor(scrollTop / effectiveItemHeight) + visibleCount + overscan
    );
    return { startIndex, endIndex, visibleCount };
  }, [scrollTop, containerHeight, effectiveItemHeight, items.length, overscan]);

  // Total height of all items
  const totalHeight = items.length * effectiveItemHeight - gap; // Remove last gap

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Generate visible items
  const visibleItems = useMemo(() => {
    const result: React.ReactNode[] = [];

    for (let i = startIndex; i <= endIndex; i++) {
      const item = items[i];
      if (!item) continue;

      const key = getItemKey ? getItemKey(item, i) : i;
      const style: React.CSSProperties = {
        position: 'absolute',
        top: i * effectiveItemHeight,
        left: 0,
        right: 0,
        height: itemHeight,
      };

      result.push(
        <div key={key} style={style}>
          {renderItem(item, i, style)}
        </div>
      );
    }

    return result;
  }, [items, startIndex, endIndex, effectiveItemHeight, itemHeight, renderItem, getItemKey]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ height: containerHeight }}
      >
        {loadingComponent || (
          <div className="text-muted-foreground">Carregando...</div>
        )}
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ height: containerHeight }}
      >
        {emptyState || (
          <div className="text-muted-foreground">Nenhum item encontrado</div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto relative', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
}

/**
 * Variable height virtualized list
 */
export interface VariableHeightVirtualizedListProps<T> {
  items: T[];
  containerHeight: number;
  estimatedItemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
  className?: string;
  emptyState?: React.ReactNode;
  overscan?: number;
}

export function VariableHeightVirtualizedList<T>({
  items,
  containerHeight,
  estimatedItemHeight,
  renderItem,
  getItemKey,
  className,
  emptyState,
  overscan = 3,
}: VariableHeightVirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [measuredHeights, setMeasuredHeights] = useState<Map<number, number>>(new Map());

  // Calculate positions based on measured or estimated heights
  const { positions, totalHeight } = useMemo(() => {
    const positions: { top: number; height: number }[] = [];
    let currentTop = 0;

    for (let i = 0; i < items.length; i++) {
      const height = measuredHeights.get(i) || estimatedItemHeight;
      positions.push({ top: currentTop, height });
      currentTop += height;
    }

    return { positions, totalHeight: currentTop };
  }, [items.length, measuredHeights, estimatedItemHeight]);

  // Find visible range
  const { startIndex, endIndex } = useMemo(() => {
    let start = 0;
    let end = items.length - 1;

    // Binary search for start
    let low = 0;
    let high = items.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const pos = positions[mid];
      if (pos.top + pos.height < scrollTop) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    start = Math.max(0, low - overscan);

    // Find end
    const viewportBottom = scrollTop + containerHeight;
    for (let i = start; i < items.length; i++) {
      const pos = positions[i];
      if (pos.top > viewportBottom) {
        end = Math.min(items.length - 1, i + overscan);
        break;
      }
    }

    return { startIndex: start, endIndex: end };
  }, [scrollTop, containerHeight, positions, items.length, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Measure item heights
  const measureRef = useCallback((node: HTMLDivElement | null, index: number) => {
    if (node && !measuredHeights.has(index)) {
      const height = node.getBoundingClientRect().height;
      if (height !== estimatedItemHeight) {
        setMeasuredHeights(prev => new Map(prev).set(index, height));
      }
    }
  }, [measuredHeights, estimatedItemHeight]);

  if (items.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ height: containerHeight }}
      >
        {emptyState || <div className="text-muted-foreground">Nenhum item</div>}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto relative', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {items.slice(startIndex, endIndex + 1).map((item, i) => {
          const index = startIndex + i;
          const pos = positions[index];
          const key = getItemKey ? getItemKey(item, index) : index;

          return (
            <div
              key={key}
              ref={(node) => measureRef(node, index)}
              style={{
                position: 'absolute',
                top: pos.top,
                left: 0,
                right: 0,
              }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Grid virtualization
 */
export interface VirtualizedGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  gap?: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
  className?: string;
  emptyState?: React.ReactNode;
}

export function VirtualizedGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  gap = 8,
  overscan = 2,
  renderItem,
  getItemKey,
  className,
  emptyState,
}: VirtualizedGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate columns and rows
  const columns = Math.floor((containerWidth + gap) / (itemWidth + gap)) || 1;
  const rows = Math.ceil(items.length / columns);
  const rowHeight = itemHeight + gap;
  const totalHeight = rows * rowHeight - gap;

  // Calculate visible row range
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleRows = Math.ceil(containerHeight / rowHeight) + 2 * overscan;
  const endRow = Math.min(rows - 1, startRow + visibleRows);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const visibleItems = useMemo(() => {
    const result: React.ReactNode[] = [];

    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        if (index >= items.length) break;

        const item = items[index];
        const key = getItemKey ? getItemKey(item, index) : index;
        const left = col * (itemWidth + gap);
        const top = row * rowHeight;

        result.push(
          <div
            key={key}
            style={{
              position: 'absolute',
              left,
              top,
              width: itemWidth,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        );
      }
    }

    return result;
  }, [items, startRow, endRow, columns, itemWidth, itemHeight, gap, rowHeight, renderItem, getItemKey]);

  if (items.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ height: containerHeight }}
      >
        {emptyState || <div className="text-muted-foreground">Nenhum item</div>}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto relative', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
}

export default VirtualizedList;
