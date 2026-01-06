import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2, RefreshCw, AlertCircle, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// INFINITE SCROLL COMPONENT
// ============================================================================

interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  threshold?: number;
  rootMargin?: string;
  getItemKey?: (item: T, index: number) => string | number;
  className?: string;
  itemClassName?: string;
  loadingComponent?: React.ReactNode;
  endComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  showScrollToTop?: boolean;
  scrollToTopThreshold?: number;
  animateItems?: boolean;
  batchSize?: number;
  gap?: number;
}

export function InfiniteScroll<T>({
  items,
  renderItem,
  loadMore,
  hasMore,
  isLoading,
  isError = false,
  error,
  onRetry,
  threshold = 0.1,
  rootMargin = '100px',
  getItemKey = (_, index) => index,
  className,
  itemClassName,
  loadingComponent,
  endComponent,
  emptyComponent,
  errorComponent,
  showScrollToTop = true,
  scrollToTopThreshold = 500,
  animateItems = true,
  gap = 4,
}: InfiniteScrollProps<T>) {
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { ref: loadMoreRef, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: false,
  });

  // Auto-load when sentinel is in view
  React.useEffect(() => {
    if (inView && hasMore && !isLoading && !isError) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, isError, loadMore]);

  // Scroll position tracking
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > scrollToTopThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollToTopThreshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Empty state
  if (items.length === 0 && !isLoading) {
    return emptyComponent || (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">Nenhum item encontrado</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Items */}
      <div className={cn('flex flex-col', `gap-${gap}`)}>
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={getItemKey(item, index)}
              initial={animateItems ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={animateItems ? { opacity: 0, scale: 0.95 } : undefined}
              transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }}
              className={itemClassName}
            >
              {renderItem(item, index)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load more sentinel */}
      <div ref={loadMoreRef} className="h-px w-full" aria-hidden="true" />

      {/* Loading state */}
      {isLoading && (
        loadingComponent || (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando...</span>
          </div>
        )
      )}

      {/* Error state */}
      {isError && (
        errorComponent || (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-destructive mb-4">
              {error?.message || 'Erro ao carregar dados'}
            </p>
            {onRetry && (
              <Button variant="outline" onClick={onRetry} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            )}
          </div>
        )
      )}

      {/* End of list */}
      {!hasMore && items.length > 0 && (
        endComponent || (
          <div className="text-center py-6 text-sm text-muted-foreground">
            Fim da lista • {items.length} itens
          </div>
        )
      )}

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollToTop && showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <Button
              variant="secondary"
              size="icon"
              onClick={scrollToTop}
              className="rounded-full shadow-lg"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// BIDIRECTIONAL INFINITE SCROLL
// ============================================================================

interface BidirectionalScrollProps<T> extends Omit<InfiniteScrollProps<T>, 'loadMore' | 'hasMore'> {
  loadNewer: () => void;
  loadOlder: () => void;
  hasNewer: boolean;
  hasOlder: boolean;
  isLoadingNewer?: boolean;
  isLoadingOlder?: boolean;
}

export function BidirectionalScroll<T>({
  items,
  renderItem,
  loadNewer,
  loadOlder,
  hasNewer,
  hasOlder,
  isLoading,
  isLoadingNewer = false,
  isLoadingOlder = false,
  threshold = 0.1,
  rootMargin = '100px',
  getItemKey = (_, index) => index,
  className,
  itemClassName,
  animateItems = true,
  gap = 4,
}: BidirectionalScrollProps<T>) {
  const { ref: newerRef, inView: newerInView } = useInView({
    threshold,
    rootMargin,
  });

  const { ref: olderRef, inView: olderInView } = useInView({
    threshold,
    rootMargin,
  });

  React.useEffect(() => {
    if (newerInView && hasNewer && !isLoadingNewer) {
      loadNewer();
    }
  }, [newerInView, hasNewer, isLoadingNewer, loadNewer]);

  React.useEffect(() => {
    if (olderInView && hasOlder && !isLoadingOlder) {
      loadOlder();
    }
  }, [olderInView, hasOlder, isLoadingOlder, loadOlder]);

  return (
    <div className={cn('relative', className)}>
      {/* Load newer sentinel */}
      <div ref={newerRef} className="h-px w-full" aria-hidden="true" />
      
      {isLoadingNewer && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {/* Items */}
      <div className={cn('flex flex-col', `gap-${gap}`)}>
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={getItemKey(item, index)}
              initial={animateItems ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={animateItems ? { opacity: 0 } : undefined}
              className={itemClassName}
            >
              {renderItem(item, index)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isLoadingOlder && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {/* Load older sentinel */}
      <div ref={olderRef} className="h-px w-full" aria-hidden="true" />
    </div>
  );
}

// ============================================================================
// USE INFINITE SCROLL HOOK
// ============================================================================

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useInfiniteScroll(
  callback: () => void,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 0.1, rootMargin = '100px', enabled = true } = options;

  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: false,
  });

  React.useEffect(() => {
    if (inView && enabled) {
      callback();
    }
  }, [inView, enabled, callback]);

  return { ref, inView };
}

// ============================================================================
// PULL TO REFRESH
// ============================================================================

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
  refreshingComponent?: React.ReactNode;
  pullingComponent?: React.ReactNode;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  className,
  refreshingComponent,
  pullingComponent,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isPulling, setIsPulling] = React.useState(false);
  const startY = React.useRef(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, (currentY - startY.current) * 0.5);
    setPullDistance(Math.min(distance, threshold * 1.5));
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  };

  const progress = Math.min(pullDistance / threshold, 1);

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
        className="absolute left-0 right-0 flex items-center justify-center overflow-hidden"
        style={{
          height: pullDistance,
          top: 0,
          transform: 'translateY(-100%)',
        }}
      >
        {isRefreshing ? (
          refreshingComponent || (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          )
        ) : (
          pullingComponent || (
            <div
              className="transition-transform"
              style={{
                opacity: progress,
                transform: `rotate(${progress * 180}deg)`,
              }}
            >
              <RefreshCw className="h-6 w-6 text-primary" />
            </div>
          )
        )}
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
