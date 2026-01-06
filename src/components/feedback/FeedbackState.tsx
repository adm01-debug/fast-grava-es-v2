import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  WifiOff, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type FeedbackType = 'loading' | 'success' | 'error' | 'offline';

interface FeedbackStateProps {
  type: FeedbackType;
  message?: string;
  description?: string;
  onRetry?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const feedbackConfig = {
  loading: {
    icon: RefreshCw,
    defaultMessage: 'Carregando...',
    defaultDescription: 'Aguarde um momento',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    animate: true,
  },
  success: {
    icon: CheckCircle2,
    defaultMessage: 'Sucesso!',
    defaultDescription: 'Operação concluída',
    color: 'text-success',
    bgColor: 'bg-success/10',
    animate: false,
  },
  error: {
    icon: AlertCircle,
    defaultMessage: 'Algo deu errado',
    defaultDescription: 'Tente novamente',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    animate: false,
  },
  offline: {
    icon: WifiOff,
    defaultMessage: 'Sem conexão',
    defaultDescription: 'Verifique sua internet',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    animate: false,
  },
};

const sizeConfig = {
  sm: {
    icon: 'w-8 h-8',
    container: 'p-4',
    title: 'text-sm',
    description: 'text-xs',
    iconContainer: 'w-12 h-12',
  },
  md: {
    icon: 'w-10 h-10',
    container: 'p-6',
    title: 'text-base',
    description: 'text-sm',
    iconContainer: 'w-16 h-16',
  },
  lg: {
    icon: 'w-12 h-12',
    container: 'p-8',
    title: 'text-lg',
    description: 'text-base',
    iconContainer: 'w-20 h-20',
  },
};

export function FeedbackState({
  type,
  message,
  description,
  onRetry,
  onAction,
  actionLabel,
  className,
  size = 'md',
}: FeedbackStateProps) {
  const config = feedbackConfig[type];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        className
      )}
    >
      {/* Icon container */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={cn(
          'rounded-full flex items-center justify-center mb-4',
          sizes.iconContainer,
          config.bgColor
        )}
      >
        <Icon 
          className={cn(
            sizes.icon,
            config.color,
            config.animate && 'animate-spin'
          )} 
        />
      </motion.div>

      {/* Message */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          'font-semibold text-foreground',
          sizes.title
        )}
      >
        {message || config.defaultMessage}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn(
          'text-muted-foreground mt-1',
          sizes.description
        )}
      >
        {description || config.defaultDescription}
      </motion.p>

      {/* Action buttons */}
      {(onRetry || onAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 mt-4"
        >
          {onRetry && (
            <Button
              variant="outline"
              size={size === 'sm' ? 'sm' : 'default'}
              onClick={onRetry}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </Button>
          )}
          {onAction && actionLabel && (
            <Button
              size={size === 'sm' ? 'sm' : 'default'}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// Inline loading spinner
interface InlineLoaderProps {
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function InlineLoader({ size = 'sm', className }: InlineLoaderProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  return (
    <RefreshCw 
      className={cn(
        'animate-spin text-muted-foreground',
        sizeClasses[size],
        className
      )} 
    />
  );
}

// Success checkmark with animation
interface SuccessCheckProps {
  className?: string;
}

export function SuccessCheck({ className }: SuccessCheckProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('text-success', className)}
    >
      <CheckCircle2 className="w-5 h-5" />
    </motion.div>
  );
}
