import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Skeleton com variantes
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%]',
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-muted',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// Skeleton para texto com múltiplas linhas
interface TextSkeletonProps {
  lines?: number;
  lastLineWidth?: string;
  className?: string;
}

export function TextSkeleton({ lines = 3, lastLineWidth = '60%', className }: TextSkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
}

// Skeleton para card
interface CardSkeletonProps {
  hasImage?: boolean;
  hasTitle?: boolean;
  hasDescription?: boolean;
  hasActions?: boolean;
  className?: string;
}

export function CardSkeleton({
  hasImage = true,
  hasTitle = true,
  hasDescription = true,
  hasActions = false,
  className,
}: CardSkeletonProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-4 space-y-4', className)}>
      {hasImage && <Skeleton variant="rounded" height={160} className="w-full" />}
      {hasTitle && <Skeleton variant="text" width="70%" height={24} />}
      {hasDescription && <TextSkeleton lines={2} />}
      {hasActions && (
        <div className="flex gap-2">
          <Skeleton variant="rounded" width={80} height={36} />
          <Skeleton variant="rounded" width={80} height={36} />
        </div>
      )}
    </div>
  );
}

// Skeleton para tabela
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  hasHeader?: boolean;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  hasHeader = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn('w-full', className)}>
      {hasHeader && (
        <div className="flex gap-4 pb-4 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" className="flex-1" height={20} />
          ))}
        </div>
      )}
      <div className="space-y-3 pt-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" className="flex-1" height={16} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton para lista
interface ListSkeletonProps {
  items?: number;
  hasAvatar?: boolean;
  hasSubtitle?: boolean;
  className?: string;
}

export function ListSkeleton({
  items = 5,
  hasAvatar = true,
  hasSubtitle = true,
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          {hasAvatar && <Skeleton variant="circular" width={40} height={40} />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" height={16} />
            {hasSubtitle && <Skeleton variant="text" width="40%" height={12} />}
          </div>
        </div>
      ))}
    </div>
  );
}

// Loading spinner com variantes
interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
  );
}

// Loading overlay
interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  text?: string;
  blur?: boolean;
  className?: string;
}

export function LoadingOverlay({
  loading,
  children,
  text,
  blur = true,
  className,
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {loading && (
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-50',
            blur && 'backdrop-blur-sm'
          )}
        >
          <Spinner size="lg" />
          {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
        </div>
      )}
    </div>
  );
}

// Loading button content
interface LoadingButtonContentProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export function LoadingButtonContent({
  loading,
  children,
  loadingText,
}: LoadingButtonContentProps) {
  if (loading) {
    return (
      <span className="flex items-center gap-2">
        <Spinner size="sm" />
        {loadingText || 'Carregando...'}
      </span>
    );
  }
  return <>{children}</>;
}

// Progress loader
interface ProgressLoaderProps {
  progress: number;
  showPercentage?: boolean;
  label?: string;
  className?: string;
}

export function ProgressLoader({
  progress,
  showPercentage = true,
  label,
  className,
}: ProgressLoaderProps) {
  return (
    <div className={cn('w-full space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && <span className="font-medium">{Math.round(progress)}%</span>}
        </div>
      )}
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

// Infinite scroll loader
interface InfiniteScrollLoaderProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  threshold?: number;
  className?: string;
}

export function InfiniteScrollLoader({
  loading,
  hasMore,
  onLoadMore,
  threshold = 100,
  className,
}: InfiniteScrollLoaderProps) {
  const loaderRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore, threshold]);

  if (!hasMore && !loading) return null;

  return (
    <div ref={loaderRef} className={cn('flex justify-center py-4', className)}>
      {loading && <Spinner size="md" />}
    </div>
  );
}

// Dots loader
export function DotsLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

// Pulse loader
export function PulseLoader({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-10 w-10', className)}>
      <div className="absolute inset-0 rounded-full bg-primary opacity-75 animate-ping" />
      <div className="absolute inset-2 rounded-full bg-primary" />
    </div>
  );
}

// Bar loader
export function BarLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-1 h-8 items-end', className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full animate-pulse"
          style={{
            height: `${Math.random() * 50 + 50}%`,
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}

// Skeleton wrapper with loading state
interface WithLoadingProps<T> {
  data: T | null | undefined;
  loading: boolean;
  error?: Error | null;
  skeleton: React.ReactNode;
  children: (data: T) => React.ReactNode;
  errorFallback?: React.ReactNode;
}

export function WithLoading<T>({
  data,
  loading,
  error,
  skeleton,
  children,
  errorFallback,
}: WithLoadingProps<T>) {
  if (loading) return <>{skeleton}</>;
  if (error) return <>{errorFallback || <div className="text-destructive">Erro ao carregar</div>}</>;
  if (!data) return null;
  return <>{children(data)}</>;
}

// Suspense-like loading boundary
interface LoadingBoundaryProps {
  loading: boolean;
  fallback: React.ReactNode;
  children: React.ReactNode;
  minLoadingTime?: number;
}

export function LoadingBoundary({
  loading,
  fallback,
  children,
  minLoadingTime = 0,
}: LoadingBoundaryProps) {
  const [showLoading, setShowLoading] = React.useState(loading);
  const startTime = React.useRef(Date.now());

  React.useEffect(() => {
    if (loading) {
      startTime.current = Date.now();
      setShowLoading(true);
    } else {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, minLoadingTime - elapsed);
      
      if (remaining > 0) {
        const timer = setTimeout(() => setShowLoading(false), remaining);
        return () => clearTimeout(timer);
      } else {
        setShowLoading(false);
      }
    }
  }, [loading, minLoadingTime]);

  return showLoading ? <>{fallback}</> : <>{children}</>;
}
