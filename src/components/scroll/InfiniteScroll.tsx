import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { Loader2, ArrowUp, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useInView } from 'react-intersection-observer';

// ============================================================================
// TYPES
// ============================================================================

interface InfiniteScrollState<T> {
  items: T[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
}

interface InfiniteScrollOptions<T> {
  fetchFn: (page: number) => Promise<{ data: T[]; hasMore: boolean }>;
  initialPage?: number;
  threshold?: number;
  enabled?: boolean;
}

interface InfiniteScrollContextValue<T> {
  state: InfiniteScrollState<T>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useInfiniteScroll<T>({
  fetchFn,
  initialPage = 1,
  threshold = 0.5,
  enabled = true,
}: InfiniteScrollOptions<T>) {
  const [state, setState] = useState<InfiniteScrollState<T>>({
    items: [],
    page: initialPage,
    hasMore: true,
    isLoading: false,
    isRefreshing: false,
    error: null,
  });

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (state.isLoading || !state.hasMore || !enabled) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await fetchFn(state.page);

      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          items: [...prev.items, ...result.data],
          page: prev.page + 1,
          hasMore: result.hasMore,
          isLoading: false,
        }));
      }
    } catch (error) {
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error as Error,
        }));
      }
    }
  }, [state.page, state.isLoading, state.hasMore, fetchFn, enabled]);

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, isRefreshing: true, error: null }));

    try {
      const result = await fetchFn(initialPage);

      if (isMounted.current) {
        setState({
          items: result.data,
          page: initialPage + 1,
          hasMore: result.hasMore,
          isLoading: false,
          isRefreshing: false,
          error: null,
        });
      }
    } catch (error) {
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          isRefreshing: false,
          error: error as Error,
        }));
      }
    }
  }, [fetchFn, initialPage]);

  const reset = useCallback(() => {
    setState({
      items: [],
      page: initialPage,
      hasMore: true,
      isLoading: false,
      isRefreshing: false,
      error: null,
    });
  }, [initialPage]);

  // Initial load
  useEffect(() => {
    if (enabled && state.items.length === 0 && !state.isLoading) {
      loadMore();
    }
  }, [enabled]);

  return {
    state,
    loadMore,
    refresh,
    reset,
    threshold,
  };
}

// ============================================================================
// INFINITE SCROLL CONTAINER
// ============================================================================

interface InfiniteScrollContainerProps<T> {
  items: T[];
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
  loadMore: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  threshold?: number;
  className?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  endComponent?: React.ReactNode;
  showBackToTop?: boolean;
  backToTopThreshold?: number;
}

export function InfiniteScrollContainer<T>({
  items,
  hasMore,
  isLoading,
  error,
  loadMore,
  renderItem,
  keyExtractor,
  threshold = 0.5,
  className,
  loadingComponent,
  errorComponent,
  emptyComponent,
  endComponent,
  showBackToTop = true,
  backToTopThreshold = 400,
}: InfiniteScrollContainerProps<T>) {
  const [showBack, setShowBack] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { ref: sentinelRef, inView } = useInView({
    threshold,
    rootMargin: '100px',
  });

  // Load more when sentinel is in view
  useEffect(() => {
    if (inView && hasMore && !isLoading && !error) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, error, loadMore]);

  // Back to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBack(window.scrollY > backToTopThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [backToTopThreshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isLoading && items.length === 0 && !error) {
    return emptyComponent || (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>Nenhum item encontrado</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Items */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={keyExtractor(item, index)}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Sentinel for intersection observer */}
      <div ref={sentinelRef} className="h-px" />

      {/* Loading indicator */}
      {isLoading && (
        loadingComponent || (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando...</span>
          </div>
        )
      )}

      {/* Error state */}
      {error && (
        errorComponent || (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Erro ao carregar</span>
            </div>
            <Button variant="outline" size="sm" onClick={loadMore}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        )
      )}

      {/* End of list */}
      {!hasMore && items.length > 0 && (
        endComponent || (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Você chegou ao fim da lista
          </div>
        )
      )}

      {/* Back to top button */}
      {showBackToTop && (
        <Button
          variant="secondary"
          size="icon"
          onClick={scrollToTop}
          className={cn(
            'fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-all duration-300',
            showBack ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          )}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// PULL TO REFRESH
// ============================================================================

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({
  children,
  onRefresh,
  className,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    // Apply resistance
    const resistedDistance = Math.min(distance * 0.5, threshold * 1.5);
    setPullDistance(resistedDistance);
  };

  const handleTouchEnd = async () => {
    if (!isPulling || disabled) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const rotation = Math.min((pullDistance / threshold) * 360, 360);
  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute left-0 right-0 flex items-center justify-center transition-all duration-200 overflow-hidden',
          showIndicator ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          height: pullDistance,
          top: 0,
        }}
      >
        <div
          className="transition-transform"
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {isRefreshing ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <RefreshCw className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// VIRTUAL INFINITE LIST
// ============================================================================

interface VirtualInfiniteListProps<T> {
  items: T[];
  itemHeight: number;
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  overscan?: number;
}

export function VirtualInfiniteList<T>({
  items,
  itemHeight,
  hasMore,
  isLoading,
  loadMore,
  renderItem,
  keyExtractor,
  className,
  overscan = 5,
}: VirtualInfiniteListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);

      // Load more when near bottom
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 200 && hasMore && !isLoading) {
        loadMore();
      }
    };

    const handleResize = () => {
      setContainerHeight(container.clientHeight);
    };

    handleResize();
    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [hasMore, isLoading, loadMore]);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: '100%' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={keyExtractor(item, startIndex + index)}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LOAD MORE BUTTON
// ============================================================================

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
  hasMore: boolean;
  className?: string;
}

export function LoadMoreButton({
  onClick,
  isLoading,
  hasMore,
  className,
}: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <div className={cn('flex justify-center py-4', className)}>
      <Button
        variant="outline"
        onClick={onClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Carregando...
          </>
        ) : (
          'Carregar mais'
        )}
      </Button>
    </div>
  );
}

export default InfiniteScrollContainer;
