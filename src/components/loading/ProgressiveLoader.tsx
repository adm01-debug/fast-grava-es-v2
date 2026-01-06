import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// PROGRESSIVE LOADING COMPONENT
// ============================================================================

interface ProgressiveLoaderProps {
  isLoading: boolean;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  minLoadTime?: number;
  fadeIn?: boolean;
  className?: string;
}

export function ProgressiveLoader({
  isLoading,
  skeleton,
  children,
  delay = 200,
  minLoadTime = 500,
  fadeIn = true,
  className,
}: ProgressiveLoaderProps) {
  const [showLoading, setShowLoading] = React.useState(false);
  const [canShow, setCanShow] = React.useState(false);
  const loadStartRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (isLoading) {
      loadStartRef.current = Date.now();
      const timer = setTimeout(() => setShowLoading(true), delay);
      return () => clearTimeout(timer);
    } else {
      const elapsed = Date.now() - loadStartRef.current;
      const remaining = Math.max(0, minLoadTime - elapsed);
      
      const timer = setTimeout(() => {
        setShowLoading(false);
        setCanShow(true);
      }, remaining);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, delay, minLoadTime]);

  if (isLoading || showLoading) {
    return skeleton || (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!fadeIn || !canShow) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// STAGED LOADER - Loads content in stages
// ============================================================================

interface Stage {
  id: string;
  content: React.ReactNode;
  skeleton?: React.ReactNode;
  delay?: number;
}

interface StagedLoaderProps {
  stages: Stage[];
  isLoading: boolean;
  className?: string;
  staggerDelay?: number;
}

export function StagedLoader({
  stages,
  isLoading,
  className,
  staggerDelay = 100,
}: StagedLoaderProps) {
  const [visibleStages, setVisibleStages] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (!isLoading) {
      stages.forEach((stage, index) => {
        const delay = stage.delay ?? index * staggerDelay;
        setTimeout(() => {
          setVisibleStages((prev) => new Set([...prev, stage.id]));
        }, delay);
      });
    } else {
      setVisibleStages(new Set());
    }
  }, [isLoading, stages, staggerDelay]);

  return (
    <div className={cn('space-y-4', className)}>
      <AnimatePresence mode="wait">
        {stages.map((stage) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: visibleStages.has(stage.id) ? 1 : 0.5, 
              y: visibleStages.has(stage.id) ? 0 : 10 
            }}
            transition={{ duration: 0.3 }}
          >
            {visibleStages.has(stage.id) 
              ? stage.content 
              : (stage.skeleton || <DefaultStageSkeleton />)
            }
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function DefaultStageSkeleton() {
  return (
    <div className="h-20 rounded-lg bg-muted animate-pulse" />
  );
}

// ============================================================================
// CONTENT PLACEHOLDER
// ============================================================================

interface ContentPlaceholderProps {
  lines?: number;
  lineHeight?: number;
  gap?: number;
  animated?: boolean;
  className?: string;
}

export function ContentPlaceholder({
  lines = 3,
  lineHeight = 16,
  gap = 8,
  animated = true,
  className,
}: ContentPlaceholderProps) {
  const widths = React.useMemo(() => {
    return Array.from({ length: lines }, (_, i) => 
      i === lines - 1 ? Math.random() * 40 + 30 : Math.random() * 30 + 70
    );
  }, [lines]);

  return (
    <div className={cn('space-y-2', className)} style={{ gap }}>
      {widths.map((width, index) => (
        <div
          key={index}
          className={cn(
            'rounded bg-muted',
            animated && 'animate-pulse'
          )}
          style={{
            height: lineHeight,
            width: `${width}%`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// LAZY CONTENT
// ============================================================================

interface LazyContentProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  offset?: number;
  once?: boolean;
  className?: string;
}

export function LazyContent({
  children,
  placeholder,
  offset = 100,
  once = true,
  className,
}: LazyContentProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        rootMargin: `${offset}px`,
        threshold: 0,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [offset, once]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (placeholder || <ContentPlaceholder />)}
    </div>
  );
}

// ============================================================================
// SKELETON SCREEN
// ============================================================================

interface SkeletonScreenProps {
  type: 'list' | 'grid' | 'detail' | 'dashboard' | 'table' | 'form';
  count?: number;
  className?: string;
}

export function SkeletonScreen({ type, count = 5, className }: SkeletonScreenProps) {
  switch (type) {
    case 'list':
      return (
        <div className={cn('space-y-3', className)}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      );

    case 'grid':
      return (
        <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden border">
              <div className="aspect-video bg-muted animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      );

    case 'detail':
      return (
        <div className={cn('space-y-6', className)}>
          <div className="h-8 w-1/3 bg-muted rounded animate-pulse" />
          <div className="aspect-video bg-muted rounded-lg animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
          </div>
        </div>
      );

    case 'dashboard':
      return (
        <div className={cn('space-y-6', className)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 border rounded-lg">
                <div className="h-3 w-1/2 bg-muted rounded animate-pulse mb-2" />
                <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded-lg animate-pulse" />
            <div className="h-64 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      );

    case 'table':
      return (
        <div className={cn('border rounded-lg overflow-hidden', className)}>
          <div className="bg-muted/50 p-4 flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 flex-1 bg-muted rounded animate-pulse" />
            ))}
          </div>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-4 flex gap-4 border-t">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 flex-1 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      );

    case 'form':
      return (
        <div className={cn('space-y-6', className)}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-10 w-full bg-muted rounded animate-pulse" />
            </div>
          ))}
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
      );

    default:
      return null;
  }
}

// ============================================================================
// LOADING OVERLAY
// ============================================================================

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  blur?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({
  isLoading,
  message,
  blur = true,
  className,
  children,
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'absolute inset-0 z-50 flex items-center justify-center bg-background/80',
              blur && 'backdrop-blur-sm'
            )}
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              {message && (
                <p className="text-sm text-muted-foreground">{message}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
