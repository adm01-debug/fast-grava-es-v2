import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, WifiOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type LoadingVariant = 
  | 'spinner' 
  | 'dots' 
  | 'pulse' 
  | 'skeleton' 
  | 'progress'
  | 'shimmer';

interface LoadingStateProps {
  variant?: LoadingVariant;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  subtext?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  className?: string;
}

export function LoadingState({
  variant = 'spinner',
  size = 'md',
  text,
  subtext,
  fullScreen = false,
  overlay = false,
  className,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader size={size} />;
      case 'pulse':
        return <PulseLoader size={size} />;
      case 'progress':
        return <ProgressLoader />;
      case 'shimmer':
        return <ShimmerLoader />;
      default:
        return (
          <Loader2
            className={cn(
              sizeClasses[size],
              'text-primary animate-spin'
            )}
          />
        );
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      {renderLoader()}
      {text && (
        <p className="text-sm font-medium text-foreground">{text}</p>
      )}
      {subtext && (
        <p className="text-xs text-muted-foreground">{subtext}</p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          'absolute inset-0 z-50 flex items-center justify-center',
          'bg-background/80 backdrop-blur-sm',
          className
        )}
      >
        {content}
      </motion.div>
    );
  }

  if (fullScreen) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          'bg-background',
          className
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center p-8',
        className
      )}
    >
      {content}
    </div>
  );
}

// Dots loader
function DotsLoader({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn('rounded-full bg-primary', dotSize[size])}
          animate={{
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

// Pulse loader
function PulseLoader({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const containerSize = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={cn('relative', containerSize[size])}>
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/30"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-2 rounded-full bg-primary/50"
        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.3, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      />
      <div className="absolute inset-4 rounded-full bg-primary" />
    </div>
  );
}

// Progress loader
function ProgressLoader() {
  return (
    <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-primary rounded-full"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ width: '50%' }}
      />
    </div>
  );
}

// Shimmer loader
function ShimmerLoader() {
  return (
    <div className="w-full space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

// Error state component
interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | null;
  variant?: 'default' | 'network' | 'empty' | 'permission';
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  children?: ReactNode;
}

export function ErrorState({
  title,
  message,
  error,
  variant = 'default',
  onRetry,
  retryText = 'Tentar novamente',
  className,
  children,
}: ErrorStateProps) {
  const variants = {
    default: {
      icon: AlertCircle,
      iconClass: 'text-destructive bg-destructive/10',
      title: title || 'Ocorreu um erro',
      message: message || error?.message || 'Algo deu errado. Tente novamente.',
    },
    network: {
      icon: WifiOff,
      iconClass: 'text-warning bg-warning/10',
      title: title || 'Sem conexão',
      message: message || 'Verifique sua conexão com a internet.',
    },
    empty: {
      icon: AlertCircle,
      iconClass: 'text-muted-foreground bg-muted',
      title: title || 'Nenhum resultado',
      message: message || 'Não encontramos o que você procura.',
    },
    permission: {
      icon: AlertCircle,
      iconClass: 'text-destructive bg-destructive/10',
      title: title || 'Acesso negado',
      message: message || 'Você não tem permissão para acessar este recurso.',
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
    >
      <div className={cn('p-4 rounded-full mb-4', config.iconClass)}>
        <Icon className="h-8 w-8" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {config.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {config.message}
      </p>

      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {retryText}
        </Button>
      )}

      {children}
    </motion.div>
  );
}

// Inline loading indicator
interface InlineLoadingProps {
  loading: boolean;
  children: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export function InlineLoading({
  loading,
  children,
  size = 'sm',
  className,
}: InlineLoadingProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2
              className={cn(
                'animate-spin text-muted-foreground',
                size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
              )}
            />
          </motion.span>
        ) : (
          <motion.span
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

// Button loading state
interface LoadingButtonProps {
  loading: boolean;
  loadingText?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
}

export function LoadingButton({
  loading,
  loadingText,
  children,
  className,
  disabled,
  onClick,
  variant = 'default',
  size = 'default',
}: LoadingButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={loading || disabled}
      onClick={onClick}
      className={className}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center"
          >
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {loadingText || 'Carregando...'}
          </motion.span>
        ) : (
          <motion.span
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}

// Content placeholder while loading
interface ContentPlaceholderProps {
  loading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  delay?: number;
}

export function ContentPlaceholder({
  loading,
  skeleton,
  children,
  delay = 0,
}: ContentPlaceholderProps) {
  const [showSkeleton, setShowSkeleton] = React.useState(true);

  React.useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowSkeleton(false), delay);
      return () => clearTimeout(timer);
    }
    setShowSkeleton(true);
  }, [loading, delay]);

  return (
    <AnimatePresence mode="wait">
      {loading || showSkeleton ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
