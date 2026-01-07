import { Suspense, lazy, ComponentType, ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

// Loading fallback component
interface LoadingFallbackProps {
  text?: string;
  className?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
}

export function LoadingFallback({ 
  text = 'Carregando...', 
  className,
  variant = 'spinner'
}: LoadingFallbackProps) {
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ 
                  duration: 0.6, 
                  repeat: Infinity, 
                  delay: i * 0.15 
                }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return (
          <motion.div
            className="h-8 w-8 rounded-full bg-primary/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        );
      case 'skeleton':
        return (
          <div className="w-full max-w-xs space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        );
      default:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="h-8 w-8 text-primary" />
          </motion.div>
        );
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3 p-8",
      className
    )}>
      {renderLoader()}
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

// Lazy component wrapper with preload
interface LazyComponentOptions {
  fallback?: ReactNode;
  minDelay?: number;
}

export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
) {
  const { fallback, minDelay = 0 } = options;
  
  const LazyComponent = lazy(async () => {
    const [module] = await Promise.all([
      importFn(),
      minDelay > 0 ? new Promise(r => setTimeout(r, minDelay)) : Promise.resolve()
    ]);
    return module;
  });

  const preload = () => importFn();

  const WrappedComponent = (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );

  WrappedComponent.preload = preload;
  
  return WrappedComponent;
}

// Intersection observer based lazy loading
interface LazyLoadProps {
  children: ReactNode;
  placeholder?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  once?: boolean;
}

export function LazyLoad({
  children,
  placeholder,
  rootMargin = '100px',
  threshold = 0.1,
  className,
  once = true
}: LazyLoadProps) {
  const { ref, inView } = useInView({
    rootMargin,
    threshold,
    triggerOnce: once
  });

  return (
    <div ref={ref} className={className}>
      <AnimatePresence mode="wait">
        {inView ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {placeholder || (
              <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Progressive image loading
interface ProgressiveImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
}

export function ProgressiveImage({
  src,
  alt,
  placeholder,
  className,
  containerClassName
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      <motion.img
        src={currentSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-500",
          !isLoaded && "blur-sm scale-105",
          className
        )}
        animate={{ 
          filter: isLoaded ? 'blur(0px)' : 'blur(10px)',
          scale: isLoaded ? 1 : 1.05
        }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
}

// Route preloading hook
export function useRoutePreload(routes: Record<string, () => Promise<any>>) {
  const preloadRoute = (routeName: string) => {
    if (routes[routeName]) {
      routes[routeName]();
    }
  };

  const preloadOnHover = (routeName: string) => ({
    onMouseEnter: () => preloadRoute(routeName),
    onFocus: () => preloadRoute(routeName)
  });

  return { preloadRoute, preloadOnHover };
}

// Skeleton with content transition
interface ContentSkeletonProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ContentSkeleton({
  isLoading,
  skeleton,
  children,
  className
}: ContentSkeletonProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
