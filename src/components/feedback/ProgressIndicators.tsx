import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  strokeWidth?: number;
  showValue?: boolean;
  color?: string;
  bgColor?: string;
  className?: string;
  animated?: boolean;
}

const sizeConfig = {
  sm: { size: 40, fontSize: 'text-xs' },
  md: { size: 56, fontSize: 'text-sm' },
  lg: { size: 80, fontSize: 'text-lg' },
};

export function ProgressRing({
  progress,
  size = 'md',
  strokeWidth = 4,
  showValue = true,
  color = 'stroke-primary',
  bgColor = 'stroke-muted',
  className,
  animated = true,
}: ProgressRingProps) {
  const config = sizeConfig[size];
  const radius = (config.size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.size}
        height={config.size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={bgColor}
        />
        {/* Progress circle */}
        <motion.circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={color}
          initial={animated ? { strokeDashoffset: circumference } : undefined}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      
      {showValue && (
        <span className={cn(
          'absolute font-semibold text-foreground',
          config.fontSize
        )}>
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}

// Linear progress bar with segments
interface ProgressBarProps {
  progress: number;
  segments?: number;
  showValue?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  segments,
  showValue = false,
  color = 'bg-primary',
  size = 'md',
  className,
  animated = true,
}: ProgressBarProps) {
  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  if (segments) {
    const activeSegments = Math.ceil((progress / 100) * segments);
    
    return (
      <div className={cn('flex gap-1', className)}>
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            key={i}
            initial={animated ? { scaleX: 0 } : undefined}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            className={cn(
              'flex-1 rounded-full origin-left',
              heightClass[size],
              i < activeSegments ? color : 'bg-muted'
            )}
          />
        ))}
        {showValue && (
          <span className="text-sm font-medium text-foreground ml-2">
            {Math.round(progress)}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('w-full flex items-center gap-3', className)}>
      <div className={cn('flex-1 bg-muted rounded-full overflow-hidden', heightClass[size])}>
        <motion.div
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={cn('h-full rounded-full', color)}
        />
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground min-w-[3ch]">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}

// Step progress indicator
interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function StepProgress({
  currentStep,
  totalSteps,
  labels,
  className,
}: StepProgressProps) {
  return (
    <div className={cn('flex items-center w-full', className)}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-fast',
                isCompleted && 'bg-primary border-primary text-primary-foreground',
                isCurrent && 'border-primary text-primary bg-primary/10',
                !isCompleted && !isCurrent && 'border-muted bg-muted text-muted-foreground'
              )}
            >
              {isCompleted ? '✓' : i + 1}
            </motion.div>
            
            {/* Connector line */}
            {i < totalSteps - 1 && (
              <div className="flex-1 h-0.5 mx-2">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="h-full bg-primary origin-left"
                  style={{ width: '100%' }}
                />
                <div className={cn(
                  'h-full -mt-0.5',
                  isCompleted ? 'bg-primary' : 'bg-muted'
                )} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
