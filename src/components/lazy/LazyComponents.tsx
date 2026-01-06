import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// LAZY COMPONENT WRAPPER
// ============================================================================

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onError?: (error: Error) => void;
  delay?: number;
  minLoadTime?: number;
  className?: string;
}

export function LazyWrapper({
  children,
  fallback,
  errorFallback,
  onError,
  delay = 200,
  minLoadTime = 300,
  className,
}: LazyWrapperProps) {
  return (
    <React.Suspense
      fallback={
        <DelayedFallback delay={delay} minLoadTime={minLoadTime}>
          {fallback || <DefaultFallback className={className} />}
        </DelayedFallback>
      }
    >
      <ErrorBoundary
        fallback={errorFallback || <DefaultErrorFallback />}
        onError={onError}
      >
        {children}
      </ErrorBoundary>
    </React.Suspense>
  );
}

// ============================================================================
// DELAYED FALLBACK - Prevents flash of loading state
// ============================================================================

interface DelayedFallbackProps {
  children: React.ReactNode;
  delay?: number;
  minLoadTime?: number;
}

function DelayedFallback({ children, delay = 200, minLoadTime = 300 }: DelayedFallbackProps) {
  const [show, setShow] = React.useState(false);
  const startTimeRef = React.useRef(Date.now());

  React.useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  React.useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  if (!show) return null;

  return <>{children}</>;
}

// ============================================================================
// DEFAULT FALLBACKS
// ============================================================================

function DefaultFallback({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </motion.div>
    </div>
  );
}

function DefaultErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="font-semibold text-lg mb-2">Erro ao carregar componente</h3>
      <p className="text-muted-foreground mb-4">
        Algo deu errado. Tente recarregar a página.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Recarregar
      </Button>
    </div>
  );
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback />;
    }

    return this.props.children;
  }
}

// ============================================================================
// LAZY FACTORY - Creates lazy components with consistent loading states
// ============================================================================

interface LazyFactoryOptions {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  delay?: number;
  minLoadTime?: number;
  preload?: boolean;
}

export function createLazyComponent(
  importFn: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>,
  options: LazyFactoryOptions = {}
): React.FC<Record<string, unknown>> & { preload: () => void } {
  const LazyComponent = React.lazy(importFn);

  // Preload if specified
  if (options.preload) {
    importFn();
  }

  const WrappedComponent: React.FC<Record<string, unknown>> = (props) => (
    <LazyWrapper
      fallback={options.fallback}
      errorFallback={options.errorFallback}
      delay={options.delay}
      minLoadTime={options.minLoadTime}
    >
      <LazyComponent {...props} />
    </LazyWrapper>
  );

  WrappedComponent.displayName = 'LazyComponent';

  // Add preload method
  const componentWithPreload = WrappedComponent as React.FC<Record<string, unknown>> & { preload: () => void };
  componentWithPreload.preload = () => {
    importFn();
  };

  return componentWithPreload;
}

// ============================================================================
// LAZY MODAL
// ============================================================================

interface LazyModalProps {
  isOpen: boolean;
  onClose: () => void;
  loader: () => Promise<{ default: React.ComponentType<{ onClose: () => void }> }>;
  fallback?: React.ReactNode;
}

export function LazyModal({ isOpen, onClose, loader, fallback }: LazyModalProps) {
  const [Component, setComponent] = React.useState<React.ComponentType<{
    onClose: () => void;
  }> | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (isOpen && !Component) {
      setIsLoading(true);
      setError(null);
      
      loader()
        .then((module) => {
          setComponent(() => module.default);
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, Component, loader]);

  if (!isOpen) return null;

  if (isLoading) {
    return fallback || (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="bg-background p-6 rounded-lg shadow-lg text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">Erro ao carregar modal</p>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    );
  }

  if (!Component) return null;

  return <Component onClose={onClose} />;
}

// ============================================================================
// LAZY IMAGE
// ============================================================================

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: 'blur' | 'shimmer' | 'none';
  blurDataUrl?: string;
  threshold?: number;
}

export function LazyImage({
  src,
  alt,
  placeholder = 'shimmer',
  blurDataUrl,
  threshold = 0.1,
  className,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const element = imgRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '100px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div className="relative overflow-hidden" ref={imgRef}>
      {/* Placeholder */}
      <AnimatePresence>
        {!isLoaded && placeholder !== 'none' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'absolute inset-0',
              placeholder === 'shimmer' && 'bg-muted animate-pulse',
              placeholder === 'blur' && 'backdrop-blur-sm'
            )}
            style={{
              backgroundImage: blurDataUrl ? `url(${blurDataUrl})` : undefined,
              backgroundSize: 'cover',
            }}
          />
        )}
      </AnimatePresence>

      {/* Image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
          className={cn('w-full h-full object-cover', className)}
        />
      )}
    </div>
  );
}

// ============================================================================
// PROGRESSIVE HYDRATION
// ============================================================================

interface ProgressiveHydrationProps {
  children: React.ReactNode;
  priority?: 'critical' | 'high' | 'low' | 'idle';
  placeholder?: React.ReactNode;
}

export function ProgressiveHydration({
  children,
  priority = 'low',
  placeholder,
}: ProgressiveHydrationProps) {
  const [isHydrated, setIsHydrated] = React.useState(priority === 'critical');

  React.useEffect(() => {
    if (priority === 'critical') return;

    const hydrate = () => setIsHydrated(true);

    switch (priority) {
      case 'high':
        // Hydrate immediately after critical content
        setTimeout(hydrate, 0);
        break;
      case 'low':
        // Hydrate after a short delay
        setTimeout(hydrate, 100);
        break;
      case 'idle':
        // Hydrate when browser is idle
        if ('requestIdleCallback' in window) {
          requestIdleCallback(hydrate);
        } else {
          setTimeout(hydrate, 200);
        }
        break;
    }
  }, [priority]);

  if (!isHydrated) {
    return <>{placeholder || <div className="animate-pulse bg-muted rounded h-20" />}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// CONDITIONAL LAZY LOAD
// ============================================================================

interface ConditionalLazyProps {
  condition: boolean;
  loader: () => Promise<{ default: React.ComponentType<object> }>;
  fallback?: React.ReactNode;
  props?: object;
}

export function ConditionalLazy({
  condition,
  loader,
  fallback,
  props = {},
}: ConditionalLazyProps) {
  const [Component, setComponent] = React.useState<React.ComponentType<object> | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (condition && !Component) {
      setIsLoading(true);
      loader()
        .then((module) => setComponent(() => module.default))
        .finally(() => setIsLoading(false));
    }
  }, [condition, Component, loader]);

  if (!condition) return null;
  if (isLoading) return <>{fallback || <DefaultFallback />}</>;
  if (!Component) return null;

  return <Component {...props} />;
}
