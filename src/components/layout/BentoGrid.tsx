import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Bento item size variants
type BentoSize = '1x1' | '1x2' | '2x1' | '2x2' | '1x3' | '3x1' | '2x3' | '3x2';

interface BentoItemProps {
  size?: BentoSize;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  gradient?: boolean;
  blur?: boolean;
}

// Size to grid span mapping
const sizeMap: Record<BentoSize, string> = {
  '1x1': 'col-span-1 row-span-1',
  '1x2': 'col-span-1 row-span-2',
  '2x1': 'col-span-2 row-span-1',
  '2x2': 'col-span-2 row-span-2',
  '1x3': 'col-span-1 row-span-3',
  '3x1': 'col-span-3 row-span-1',
  '2x3': 'col-span-2 row-span-3',
  '3x2': 'col-span-3 row-span-2',
};

export function BentoItem({
  size = '1x1',
  children,
  className,
  onClick,
  interactive = false,
  gradient = false,
  blur = false,
}: BentoItemProps) {
  const Component = interactive ? motion.div : 'div';

  return (
    <Component
      className={cn(
        sizeMap[size],
        "relative rounded-2xl border border-border bg-card overflow-hidden",
        "transition-all duration-300",
        interactive && "cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
        gradient && "bg-gradient-to-br from-card via-card to-muted/30",
        blur && "backdrop-blur-sm bg-card/80",
        className
      )}
      onClick={onClick}
      whileHover={interactive ? { scale: 1.02, y: -4 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </Component>
  );
}

interface BentoGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
  rowHeight?: number;
  className?: string;
  autoRows?: boolean;
}

const gapMap = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

const columnMap = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
};

export function BentoGrid({
  children,
  columns = 4,
  gap = 'md',
  rowHeight = 150,
  className,
  autoRows = true,
}: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid",
        columnMap[columns],
        gapMap[gap],
        className
      )}
      style={autoRows ? { gridAutoRows: `${rowHeight}px` } : undefined}
    >
      {children}
    </div>
  );
}

// Preset Bento layouts
interface BentoPresetProps {
  items: {
    content: ReactNode;
    size?: BentoSize;
    className?: string;
    onClick?: () => void;
  }[];
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BentoDashboard({ items, gap = 'md', className }: BentoPresetProps) {
  // Default dashboard layout: 1 large + 2 medium + 3 small
  const defaultSizes: BentoSize[] = ['2x2', '2x1', '2x1', '1x1', '1x1', '1x1'];

  return (
    <BentoGrid columns={4} gap={gap} className={className}>
      {items.map((item, index) => (
        <BentoItem
          key={index}
          size={item.size || defaultSizes[index] || '1x1'}
          className={item.className}
          onClick={item.onClick}
          interactive={!!item.onClick}
        >
          {item.content}
        </BentoItem>
      ))}
    </BentoGrid>
  );
}

// Featured content card for Bento
interface BentoFeatureProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  value?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  children?: ReactNode;
  className?: string;
}

export function BentoFeature({
  title,
  description,
  icon: Icon,
  value,
  trend,
  trendValue,
  children,
  className,
}: BentoFeatureProps) {
  return (
    <div className={cn("flex flex-col h-full p-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-auto">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>

      {/* Value */}
      {value !== undefined && (
        <div className="mt-4">
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  trend === 'up' && "text-success",
                  trend === 'down' && "text-destructive",
                  trend === 'neutral' && "text-muted-foreground"
                )}
              >
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trendValue}
              </span>
              <span className="text-xs text-muted-foreground">vs período anterior</span>
            </div>
          )}
        </div>
      )}

      {/* Custom content */}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

// Bento card with image background
interface BentoImageCardProps {
  title: string;
  subtitle?: string;
  image: string;
  overlay?: 'dark' | 'light' | 'gradient' | 'none';
  children?: ReactNode;
  className?: string;
}

export function BentoImageCard({
  title,
  subtitle,
  image,
  overlay = 'gradient',
  children,
  className,
}: BentoImageCardProps) {
  const overlayStyles = {
    dark: 'bg-black/50',
    light: 'bg-white/50',
    gradient: 'bg-gradient-to-t from-black/80 via-black/20 to-transparent',
    none: '',
  };

  return (
    <div
      className={cn(
        "relative h-full bg-cover bg-center overflow-hidden",
        className
      )}
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className={cn("absolute inset-0", overlayStyles[overlay])} />
      <div className="relative h-full flex flex-col justify-end p-4 text-white">
        <h3 className="font-semibold">{title}</h3>
        {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

// Animated stat bento
interface BentoStatProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon?: React.ElementType;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  animate?: boolean;
}

export function BentoStat({
  label,
  value,
  suffix,
  prefix,
  icon: Icon,
  color = 'primary',
  animate = true,
}: BentoStatProps) {
  const colorStyles = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    destructive: 'text-destructive bg-destructive/10',
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      {Icon && (
        <div className={cn("p-3 rounded-full mb-3", colorStyles[color])}>
          <Icon className="h-6 w-6" />
        </div>
      )}
      <motion.p
        className="text-3xl font-bold text-foreground"
        initial={animate ? { opacity: 0, scale: 0.5 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {prefix}
        {value.toLocaleString('pt-BR')}
        {suffix}
      </motion.p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

// Quick action grid for Bento
interface BentoQuickAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
}

interface BentoQuickActionsProps {
  actions: BentoQuickAction[];
  columns?: 2 | 3 | 4;
}

export function BentoQuickActions({ actions, columns = 2 }: BentoQuickActionsProps) {
  return (
    <div
      className={cn(
        "grid gap-2 h-full p-2",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
        columns === 4 && "grid-cols-4"
      )}
    >
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={index}
            onClick={action.onClick}
            className={cn(
              "flex flex-col items-center justify-center gap-2 p-3 rounded-xl",
              "bg-muted/50 hover:bg-muted transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon
              className="h-5 w-5"
              style={{ color: action.color || 'currentColor' }}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {action.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
