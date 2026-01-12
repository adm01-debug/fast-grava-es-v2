import React, { forwardRef, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X,
  Loader2,
  Sparkles,
  PartyPopper,
  Trophy,
  Zap,
} from 'lucide-react';

// ============= RIPPLE EFFECT =============

interface RippleProps {
  duration?: number;
  color?: string;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export function useRipple({ duration = 600, color = 'currentColor' }: RippleProps = {}) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const counter = useRef(0);

  const addRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const id = counter.current++;
    setRipples(prev => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, duration);
  }, [duration]);

  const RippleContainer = useCallback(() => (
    <span className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.35 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration / 1000, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              width: 100,
              height: 100,
              marginLeft: -50,
              marginTop: -50,
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
        ))}
      </AnimatePresence>
    </span>
  ), [ripples, duration, color]);

  return { addRipple, RippleContainer };
}

// ============= INTERACTIVE BUTTON WITH RIPPLE =============

interface InteractiveButtonProps {
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const InteractiveButton = forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  ({ variant = 'default', loading, children, className, onClick, disabled, type = 'button' }, ref) => {
    const { addRipple, RippleContainer } = useRipple({ 
      color: variant === 'destructive' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)' 
    });
    const prefersReducedMotion = useReducedMotion();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading && !prefersReducedMotion) {
        addRipple(e);
      }
      onClick?.(e);
    };

    const variantStyles = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      success: 'bg-success text-success-foreground hover:bg-success/90',
      warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        onClick={handleClick}
        disabled={disabled || loading}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium',
          'transition-colors duration-200',
          'disabled:opacity-50 disabled:pointer-events-none',
          variantStyles[variant],
          className
        )}
      >
        <RippleContainer />
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span className={cn(loading && 'opacity-70')}>{children}</span>
      </motion.button>
    );
  }
);

InteractiveButton.displayName = 'InteractiveButton';

// ============= PULSE DOT INDICATOR =============

interface PulseDotProps {
  variant?: 'success' | 'warning' | 'destructive' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PulseDot({ variant = 'default', size = 'md', className }: PulseDotProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const colors = {
    default: 'bg-muted-foreground',
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
    info: 'bg-info',
  };

  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  return (
    <span className={cn('relative inline-flex', className)}>
      {!prefersReducedMotion && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
            colors[variant]
          )}
        />
      )}
      <span className={cn('relative inline-flex rounded-full', sizes[size], colors[variant])} />
    </span>
  );
}

// ============= ENHANCED FEEDBACK TOAST =============

type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'celebration';

interface FeedbackToastProps {
  type: FeedbackType;
  title: string;
  message?: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const feedbackConfig = {
  success: {
    icon: CheckCircle2,
    bgClass: 'bg-success/10 border-success/20',
    iconClass: 'text-success',
  },
  error: {
    icon: AlertCircle,
    bgClass: 'bg-destructive/10 border-destructive/20',
    iconClass: 'text-destructive',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-warning/10 border-warning/20',
    iconClass: 'text-warning',
  },
  info: {
    icon: Info,
    bgClass: 'bg-info/10 border-info/20',
    iconClass: 'text-info',
  },
  loading: {
    icon: Loader2,
    bgClass: 'bg-primary/10 border-primary/20',
    iconClass: 'text-primary animate-spin',
  },
  celebration: {
    icon: PartyPopper,
    bgClass: 'bg-gradient-to-r from-primary/10 via-accent/10 to-success/10 border-primary/20',
    iconClass: 'text-primary',
  },
};

export function FeedbackToast({
  type,
  title,
  message,
  isVisible,
  onClose,
  duration = 5000,
  action,
}: FeedbackToastProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = feedbackConfig[type];
  const Icon = config.icon;

  React.useEffect(() => {
    if (isVisible && type !== 'loading') {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose, type]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={cn(
            'fixed bottom-6 right-6 z-50 max-w-sm',
            'rounded-xl border shadow-lg backdrop-blur-sm',
            'p-4 flex items-start gap-3',
            config.bgClass
          )}
        >
          <motion.div
            initial={prefersReducedMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
            className={cn('shrink-0 mt-0.5', config.iconClass)}
          >
            <Icon className="h-5 w-5" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">{title}</p>
            {message && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{message}</p>
            )}
            {action && (
              <button
                onClick={action.onClick}
                className="mt-2 text-sm font-medium text-primary hover:underline"
              >
                {action.label}
              </button>
            )}
          </div>

          {type !== 'loading' && (
            <button
              onClick={onClose}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============= SUCCESS CHECKMARK ANIMATION =============

interface SuccessCheckProps {
  isVisible: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SuccessCheck({ isVisible, size = 'md', className }: SuccessCheckProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={cn(
            'rounded-full bg-success flex items-center justify-center',
            sizes[size],
            className
          )}
        >
          <motion.div
            initial={prefersReducedMotion ? {} : { scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 500 }}
          >
            <CheckCircle2 className={cn('text-success-foreground', iconSizes[size])} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============= HOVER CARD EFFECT =============

interface HoverCardEffectProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function HoverCardEffect({ children, className, glowColor }: HoverCardEffectProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { 
        y: -4, 
        boxShadow: glowColor 
          ? `0 20px 40px -15px ${glowColor}`
          : '0 20px 40px -15px rgba(0,0,0,0.15)'
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn('cursor-pointer', className)}
    >
      {children}
    </motion.div>
  );
}

// ============= NUMBER COUNTER ANIMATION =============

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatFn?: (value: number) => string;
  className?: string;
}

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  formatFn = (v) => v.toLocaleString('pt-BR'),
  className 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setDisplayValue(Math.round(startValue + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, prefersReducedMotion]);

  return <span className={className}>{formatFn(displayValue)}</span>;
}

// ============= SHAKE ANIMATION FOR ERRORS =============

interface ShakeContainerProps {
  shake: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ShakeContainer({ shake, children, className }: ShakeContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={shake && !prefersReducedMotion ? {
        x: [0, -10, 10, -10, 10, -5, 5, 0],
      } : {}}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default {
  useRipple,
  InteractiveButton,
  PulseDot,
  FeedbackToast,
  SuccessCheck,
  HoverCardEffect,
  AnimatedCounter,
  ShakeContainer,
};
