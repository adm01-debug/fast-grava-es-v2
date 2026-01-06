import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, ThumbsUp, Flame, Zap, Award, LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Types
type RatingIcon = 'star' | 'heart' | 'thumbs' | 'flame' | 'zap' | 'award';

interface RatingProps {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
  icon?: RatingIcon | LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  emptyColor?: string;
  allowHalf?: boolean;
  readonly?: boolean;
  showValue?: boolean;
  showLabel?: boolean;
  labels?: string[];
  animated?: boolean;
  highlightSelected?: boolean;
  className?: string;
}

// Icon mapping
const iconMap: Record<RatingIcon, LucideIcon> = {
  star: Star,
  heart: Heart,
  thumbs: ThumbsUp,
  flame: Flame,
  zap: Zap,
  award: Award,
};

// Size configurations
const sizeConfig = {
  sm: { icon: 'h-4 w-4', gap: 'gap-0.5', text: 'text-xs' },
  md: { icon: 'h-5 w-5', gap: 'gap-1', text: 'text-sm' },
  lg: { icon: 'h-6 w-6', gap: 'gap-1.5', text: 'text-base' },
  xl: { icon: 'h-8 w-8', gap: 'gap-2', text: 'text-lg' },
};

// Default labels
const defaultLabels = ['Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'];

export const Rating: React.FC<RatingProps> = ({
  value = 0,
  onChange,
  max = 5,
  icon = 'star',
  size = 'md',
  color = 'text-yellow-400',
  emptyColor = 'text-muted-foreground/30',
  allowHalf = false,
  readonly = false,
  showValue = false,
  showLabel = false,
  labels = defaultLabels,
  animated = true,
  highlightSelected = true,
  className,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const config = sizeConfig[size];
  const Icon = typeof icon === 'string' ? iconMap[icon] : icon;
  const displayValue = hoverValue ?? value;

  const handleClick = useCallback(
    (index: number, isHalf: boolean) => {
      if (readonly || !onChange) return;
      const newValue = isHalf && allowHalf ? index + 0.5 : index + 1;
      onChange(newValue === value ? 0 : newValue);
    },
    [readonly, onChange, allowHalf, value]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, index: number) => {
      if (readonly) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const isHalf = allowHalf && e.clientX - rect.left < rect.width / 2;
      setHoverValue(isHalf ? index + 0.5 : index + 1);
    },
    [readonly, allowHalf]
  );

  const getLabel = () => {
    const labelIndex = Math.ceil(displayValue) - 1;
    return labels[labelIndex] || '';
  };

  return (
    <div className={cn('flex items-center', config.gap, className)}>
      <div
        className={cn('flex items-center', config.gap)}
        onMouseLeave={() => setHoverValue(null)}
      >
        {Array.from({ length: max }).map((_, index) => {
          const isFilled = displayValue >= index + 1;
          const isHalfFilled = allowHalf && displayValue === index + 0.5;
          const isActive = highlightSelected && value >= index + 1;

          return (
            <motion.button
              key={index}
              type="button"
              disabled={readonly}
              className={cn(
                'relative cursor-pointer disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded',
                !readonly && 'hover:scale-110 transition-transform'
              )}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const isHalf = allowHalf && e.clientX - rect.left < rect.width / 2;
                handleClick(index, isHalf);
              }}
              onMouseMove={(e) => handleMouseMove(e, index)}
              whileTap={!readonly && animated ? { scale: 0.9 } : undefined}
            >
              {/* Empty icon */}
              <Icon
                className={cn(
                  config.icon,
                  emptyColor,
                  'transition-colors'
                )}
              />

              {/* Filled icon */}
              <AnimatePresence>
                {(isFilled || isHalfFilled) && (
                  <motion.div
                    initial={animated ? { scale: 0 } : undefined}
                    animate={{ scale: 1 }}
                    exit={animated ? { scale: 0 } : undefined}
                    className={cn(
                      'absolute inset-0 overflow-hidden',
                      isHalfFilled && 'w-1/2'
                    )}
                  >
                    <Icon
                      className={cn(
                        config.icon,
                        color,
                        'fill-current',
                        isActive && 'drop-shadow-sm'
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Value display */}
      {showValue && (
        <span className={cn(config.text, 'font-medium text-foreground ml-2')}>
          {displayValue.toFixed(allowHalf ? 1 : 0)}
        </span>
      )}

      {/* Label display */}
      {showLabel && displayValue > 0 && (
        <span className={cn(config.text, 'text-muted-foreground ml-2')}>
          {getLabel()}
        </span>
      )}
    </div>
  );
};

// Rating with Breakdown
interface RatingBreakdownProps {
  ratings: { value: number; count: number }[];
  total: number;
  average: number;
  showBars?: boolean;
  className?: string;
}

export const RatingBreakdown: React.FC<RatingBreakdownProps> = ({
  ratings,
  total,
  average,
  showBars = true,
  className,
}) => {
  return (
    <div className={cn('flex gap-6', className)}>
      {/* Average */}
      <div className="text-center">
        <div className="text-4xl font-bold">{average.toFixed(1)}</div>
        <Rating value={average} readonly size="sm" className="justify-center mt-1" />
        <p className="text-sm text-muted-foreground mt-1">
          {total} avaliações
        </p>
      </div>

      {/* Breakdown */}
      {showBars && (
        <div className="flex-1 space-y-1">
          {ratings.map(({ value, count }) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={value} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-muted-foreground">{value}</span>
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: (5 - value) * 0.1 }}
                    className="h-full bg-yellow-400 rounded-full"
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Emoji Rating
interface EmojiRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const emojis = ['😡', '😕', '😐', '😊', '😍'];
const emojiLabels = ['Muito insatisfeito', 'Insatisfeito', 'Neutro', 'Satisfeito', 'Muito satisfeito'];

export const EmojiRating: React.FC<EmojiRatingProps> = ({
  value,
  onChange,
  readonly = false,
  size = 'md',
  className,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const emojiSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <TooltipProvider>
      <div
        className={cn('flex items-center gap-2', className)}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {emojis.map((emoji, index) => {
          const isSelected = value === index + 1;
          const isHovered = hoverIndex === index;

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  disabled={readonly}
                  className={cn(
                    emojiSizes[size],
                    'cursor-pointer disabled:cursor-default transition-all',
                    !readonly && 'hover:scale-125',
                    isSelected && 'scale-125',
                    !isSelected && !isHovered && value && 'opacity-50'
                  )}
                  onClick={() => onChange?.(index + 1)}
                  onMouseEnter={() => setHoverIndex(index)}
                  whileTap={!readonly ? { scale: 0.9 } : undefined}
                >
                  {emoji}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{emojiLabels[index]}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

// Thumbs Rating (Like/Dislike)
interface ThumbsRatingProps {
  value?: 'up' | 'down' | null;
  onChange?: (value: 'up' | 'down' | null) => void;
  upCount?: number;
  downCount?: number;
  showCounts?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ThumbsRating: React.FC<ThumbsRatingProps> = ({
  value,
  onChange,
  upCount = 0,
  downCount = 0,
  showCounts = true,
  size = 'md',
  className,
}) => {
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleClick = (type: 'up' | 'down') => {
    onChange?.(value === type ? null : type);
  };

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <button
        type="button"
        className={cn(
          'flex items-center gap-1.5 transition-colors',
          value === 'up' ? 'text-green-500' : 'text-muted-foreground hover:text-green-500'
        )}
        onClick={() => handleClick('up')}
      >
        <motion.div whileTap={{ scale: 0.9 }}>
          <ThumbsUp
            className={cn(
              iconSizes[size],
              value === 'up' && 'fill-current'
            )}
          />
        </motion.div>
        {showCounts && <span className="text-sm">{upCount}</span>}
      </button>

      <button
        type="button"
        className={cn(
          'flex items-center gap-1.5 transition-colors',
          value === 'down' ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
        )}
        onClick={() => handleClick('down')}
      >
        <motion.div whileTap={{ scale: 0.9 }} className="rotate-180">
          <ThumbsUp
            className={cn(
              iconSizes[size],
              value === 'down' && 'fill-current'
            )}
          />
        </motion.div>
        {showCounts && <span className="text-sm">{downCount}</span>}
      </button>
    </div>
  );
};

// Slider Rating
interface SliderRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  showLabels?: boolean;
  minLabel?: string;
  maxLabel?: string;
  readonly?: boolean;
  className?: string;
}

export const SliderRating: React.FC<SliderRatingProps> = ({
  value = 5,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  showValue = true,
  showLabels = true,
  minLabel = 'Muito ruim',
  maxLabel = 'Excelente',
  readonly = false,
  className,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  const getColor = () => {
    if (percentage <= 25) return 'bg-destructive';
    if (percentage <= 50) return 'bg-yellow-500';
    if (percentage <= 75) return 'bg-green-400';
    return 'bg-green-500';
  };

  return (
    <div className={cn('w-full', className)}>
      {showValue && (
        <div className="flex justify-center mb-2">
          <motion.span
            key={value}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold"
          >
            {value}
          </motion.span>
        </div>
      )}

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange?.(Number(e.target.value))}
          disabled={readonly}
          className="w-full h-2 appearance-none bg-muted rounded-full cursor-pointer disabled:cursor-default [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${percentage}%, hsl(var(--muted)) ${percentage}%, hsl(var(--muted)) 100%)`,
          }}
        />
      </div>

      {showLabels && (
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
};

export default Rating;
