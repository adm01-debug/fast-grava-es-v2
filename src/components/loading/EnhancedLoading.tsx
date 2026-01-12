/**
 * Enhanced Loading Components - Advanced loading states
 * Spinners, progress indicators, skeleton animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// ============= SPINNER VARIANTS =============

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'bars' | 'ring';
  color?: 'primary' | 'secondary' | 'muted';
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const colorMap = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  muted: 'text-muted-foreground',
};

export function Spinner({ 
  size = 'md', 
  variant = 'default', 
  color = 'primary',
  className,
}: SpinnerProps) {
  const baseClass = cn(sizeMap[size], colorMap[color], className);

  switch (variant) {
    case 'dots':
      return (
        <div className={cn('flex items-center gap-1', className)}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
              }}
              className={cn(
                'rounded-full bg-current',
                size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3',
                colorMap[color]
              )}
            />
          ))}
        </div>
      );

    case 'pulse':
      return (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={cn(baseClass, 'rounded-full bg-current')}
        />
      );

    case 'bars':
      return (
        <div className={cn('flex items-end gap-0.5', className)}>
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                height: ['40%', '100%', '40%'],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
              }}
              className={cn(
                'w-1 bg-current rounded-t',
                size === 'sm' ? 'h-3' : size === 'md' ? 'h-5' : 'h-8',
                colorMap[color]
              )}
            />
          ))}
        </div>
      );

    case 'ring':
      return (
        <div className={cn(baseClass, 'relative')}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-current border-t-transparent"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-1 rounded-full border-2 border-current border-b-transparent opacity-50"
          />
        </div>
      );

    default:
      return (
        <Loader2 className={cn(baseClass, 'animate-spin')} />
      );
  }
}

// ============= LOADING BUTTON =============

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface LoadingButtonContentProps {
  state: LoadingState;
  idleText: string;
  loadingText?: string;
  successText?: string;
  errorText?: string;
}

export function LoadingButtonContent({
  state,
  idleText,
  loadingText = 'Carregando...',
  successText = 'Sucesso!',
  errorText = 'Erro',
}: LoadingButtonContentProps) {
  switch (state) {
    case 'loading':
      return (
        <span className="flex items-center gap-2">
          <Spinner size="sm" />
          {loadingText}
        </span>
      );
    case 'success':
      return (
        <motion.span
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 text-green-600"
        >
          <CheckCircle className="h-4 w-4" />
          {successText}
        </motion.span>
      );
    case 'error':
      return (
        <motion.span
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 text-red-600"
        >
          <XCircle className="h-4 w-4" />
          {errorText}
        </motion.span>
      );
    default:
      return <span>{idleText}</span>;
  }
}

// ============= PROGRESS INDICATOR =============

interface ProgressIndicatorProps {
  value: number;
  max?: number;
  variant?: 'line' | 'circle' | 'steps';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function ProgressIndicator({
  value,
  max = 100,
  variant = 'line',
  size = 'md',
  showValue = true,
  label,
  className,
}: ProgressIndicatorProps) {
  const percentage = Math.min((value / max) * 100, 100);

  if (variant === 'circle') {
    const circleSize = size === 'sm' ? 48 : size === 'md' ? 64 : 96;
    const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 6 : 8;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={cn('relative inline-flex items-center justify-center', className)}>
        <svg
          width={circleSize}
          height={circleSize}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted"
          />
          {/* Progress circle */}
          <motion.circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            className="text-primary"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>
        {showValue && (
          <span className={cn(
            'absolute font-semibold',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'
          )}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }

  if (variant === 'steps') {
    const steps = Math.ceil(max / (max / 5)); // 5 steps by default
    const completedSteps = Math.floor((value / max) * steps);

    return (
      <div className={cn('flex items-center gap-2', className)}>
        {Array.from({ length: steps }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={cn(
              'rounded-full transition-colors',
              size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4',
              i < completedSteps ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
        {showValue && (
          <span className="text-sm text-muted-foreground ml-2">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }

  // Default: line variant
  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showValue && (
            <span className="text-sm text-muted-foreground">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={cn(
        'w-full bg-muted rounded-full overflow-hidden',
        size === 'sm' ? 'h-1' : size === 'md' ? 'h-2' : 'h-3'
      )}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-primary rounded-full relative overflow-hidden"
        >
          {/* Shine effect */}
          <motion.div
            animate={{ x: ['0%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
}

// ============= SKELETON PULSE =============

interface SkeletonPulseProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function SkeletonPulse({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonPulseProps) {
  const variantClass = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-md',
  };

  const animationClass = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-muted',
        variantClass[variant],
        animationClass[animation],
        className
      )}
      style={{ width, height }}
    />
  );
}

// ============= LOADING OVERLAY =============

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  blur?: boolean;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  message = 'Carregando...',
  blur = true,
  className,
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'absolute inset-0 z-50 flex flex-col items-center justify-center',
        blur ? 'backdrop-blur-sm' : '',
        'bg-background/80',
        className
      )}
    >
      <Spinner size="lg" variant="ring" />
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-sm text-muted-foreground"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}

// ============= REFRESH INDICATOR =============

interface RefreshIndicatorProps {
  isRefreshing: boolean;
  progress?: number;
  className?: string;
}

export function RefreshIndicator({
  isRefreshing,
  progress = 0,
  className,
}: RefreshIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: isRefreshing ? 1 : 0, 
        y: isRefreshing ? 0 : -20,
      }}
      className={cn(
        'flex items-center justify-center p-4',
        className
      )}
    >
      <motion.div
        animate={{ rotate: isRefreshing ? 360 : 0 }}
        transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
      >
        <RefreshCw className={cn(
          'h-6 w-6 text-primary',
          !isRefreshing && 'opacity-50'
        )} />
      </motion.div>
      {progress > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">
          {Math.round(progress)}%
        </span>
      )}
    </motion.div>
  );
}

// ============= STATUS LOADING =============

interface StatusLoadingProps {
  status: 'loading' | 'success' | 'error' | 'warning' | 'idle';
  message?: string;
  className?: string;
}

export function StatusLoading({ status, message, className }: StatusLoadingProps) {
  const statusConfig = {
    loading: { icon: <Spinner size="sm" />, color: 'text-primary' },
    success: { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-500' },
    error: { icon: <XCircle className="h-4 w-4" />, color: 'text-red-500' },
    warning: { icon: <AlertCircle className="h-4 w-4" />, color: 'text-yellow-500' },
    idle: { icon: null, color: 'text-muted-foreground' },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('flex items-center gap-2', config.color, className)}
    >
      {config.icon}
      {message && <span className="text-sm">{message}</span>}
    </motion.div>
  );
}

export default {
  Spinner,
  LoadingButtonContent,
  ProgressIndicator,
  SkeletonPulse,
  LoadingOverlay,
  RefreshIndicator,
  StatusLoading,
};
