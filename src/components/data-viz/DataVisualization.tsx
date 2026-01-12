// ============= DATA VISUALIZATION COMPONENTS =============
// Gráficos interativos, sparklines, indicadores e dashboards

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Info,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ============= TYPES =============
export interface DataPoint {
  value: number;
  label?: string;
  timestamp?: Date;
  color?: string;
}

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
}

// ============= SPARKLINE =============
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  showDots?: boolean;
  animated?: boolean;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 100,
  height = 32,
  strokeColor = 'hsl(var(--primary))',
  fillColor,
  strokeWidth = 2,
  showDots = false,
  animated = true,
  className,
}) => {
  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = useMemo(() => {
    if (data.length < 2) return '';
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    return data.map((value, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      return `${x},${y}`;
    }).join(' ');
  }, [data, chartWidth, chartHeight]);

  const areaPath = useMemo(() => {
    if (data.length < 2 || !fillColor) return '';
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const pathPoints = data.map((value, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      return { x, y };
    });
    
    const startPoint = `M ${padding},${padding + chartHeight}`;
    const linePoints = pathPoints.map((p, i) => i === 0 ? `L ${p.x},${p.y}` : `L ${p.x},${p.y}`).join(' ');
    const endPoint = `L ${padding + chartWidth},${padding + chartHeight} Z`;
    
    return `${startPoint} ${linePoints} ${endPoint}`;
  }, [data, fillColor, chartWidth, chartHeight]);

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      {fillColor && (
        <motion.path
          d={areaPath}
          fill={fillColor}
          opacity={0.2}
          initial={animated ? { opacity: 0 } : undefined}
          animate={animated ? { opacity: 0.2 } : undefined}
          transition={{ duration: 0.5 }}
        />
      )}
      <motion.polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { pathLength: 0 } : undefined}
        animate={animated ? { pathLength: 1 } : undefined}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {showDots && data.map((value, i) => {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((value - min) / range) * chartHeight;
        
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={3}
            fill={strokeColor}
            initial={animated ? { scale: 0 } : undefined}
            animate={animated ? { scale: 1 } : undefined}
            transition={{ delay: (i / data.length) * 0.5, duration: 0.2 }}
          />
        );
      })}
    </svg>
  );
};

// ============= TREND INDICATOR =============
interface TrendIndicatorProps {
  value: number;
  previousValue?: number;
  suffix?: string;
  showIcon?: boolean;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean; // true = down is good (e.g., for costs)
  className?: string;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  previousValue,
  suffix = '%',
  showIcon = true,
  showPercentage = true,
  size = 'md',
  inverted = false,
  className,
}) => {
  const change = previousValue !== undefined ? value - previousValue : 0;
  const changePercent = previousValue ? ((change / previousValue) * 100) : 0;
  
  const isPositive = inverted ? change < 0 : change > 0;
  const isNeutral = Math.abs(change) < 0.01;

  const sizeClasses = {
    sm: 'text-xs gap-0.5',
    md: 'text-sm gap-1',
    lg: 'text-base gap-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (previousValue === undefined) return null;

  return (
    <div className={cn(
      'inline-flex items-center font-medium',
      sizeClasses[size],
      isNeutral ? 'text-muted-foreground' : isPositive ? 'text-emerald-500' : 'text-red-500',
      className
    )}>
      {showIcon && (
        isNeutral ? (
          <Minus className={iconSizes[size]} />
        ) : isPositive ? (
          <TrendingUp className={iconSizes[size]} />
        ) : (
          <TrendingDown className={iconSizes[size]} />
        )
      )}
      {showPercentage && (
        <span>
          {change > 0 ? '+' : ''}{changePercent.toFixed(1)}{suffix}
        </span>
      )}
    </div>
  );
};

// ============= STAT CARD ENHANCED =============
interface StatCardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  numericValue?: number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  sparklineData?: number[];
  progress?: number;
  target?: number;
  status?: 'success' | 'warning' | 'error' | 'info';
  action?: { label: string; onClick: () => void };
  className?: string;
}

export const StatCardEnhanced: React.FC<StatCardProps> = ({
  title,
  value,
  previousValue,
  numericValue,
  subtitle,
  icon,
  trend,
  trendValue,
  sparklineData,
  progress,
  target,
  status,
  action,
  className,
}) => {
  const statusColors = {
    success: 'border-l-emerald-500',
    warning: 'border-l-amber-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500',
  };

  const statusIcons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    error: <AlertTriangle className="w-4 h-4 text-red-500" />,
    info: <Info className="w-4 h-4 text-blue-500" />,
  };

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all hover:shadow-md',
      status && `border-l-4 ${statusColors[status]}`,
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground truncate">
                {title}
              </span>
              {status && statusIcons[status]}
            </div>
            
            <div className="flex items-baseline gap-2">
              <motion.span
                key={String(value)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold tracking-tight"
              >
                {value}
              </motion.span>
              
              {(previousValue !== undefined || trend) && (
                <TrendIndicator
                  value={numericValue || 0}
                  previousValue={previousValue}
                  size="sm"
                />
              )}
            </div>
            
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          
          {icon && (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {icon}
            </div>
          )}
        </div>
        
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-3 -mx-1">
            <Sparkline
              data={sparklineData}
              width={200}
              height={40}
              strokeColor="hsl(var(--primary))"
              fillColor="hsl(var(--primary))"
            />
          </div>
        )}
        
        {progress !== undefined && (
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progresso</span>
              {target && (
                <span className="font-medium">
                  {progress}% de {target}
                </span>
              )}
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
        
        {action && (
          <button
            onClick={action.onClick}
            className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {action.label}
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </CardContent>
    </Card>
  );
};

// ============= MINI PROGRESS BAR =============
interface MiniProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  animated?: boolean;
  className?: string;
}

export const MiniProgress: React.FC<MiniProgressProps> = ({
  value,
  max = 100,
  label,
  showValue = true,
  color = 'default',
  size = 'md',
  animated = true,
  className,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    default: 'bg-primary',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
  };

  return (
    <div className={cn('space-y-1', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="font-medium">{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className={cn('bg-muted rounded-full overflow-hidden', heightClasses[size])}>
        <motion.div
          className={cn('h-full rounded-full', colorClasses[color])}
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// ============= COMPARISON BAR =============
interface ComparisonBarProps {
  label: string;
  value: number;
  compareValue: number;
  maxValue?: number;
  valueLabel?: string;
  compareLabel?: string;
  className?: string;
}

export const ComparisonBar: React.FC<ComparisonBarProps> = ({
  label,
  value,
  compareValue,
  maxValue,
  valueLabel = 'Atual',
  compareLabel = 'Anterior',
  className,
}) => {
  const max = maxValue || Math.max(value, compareValue);
  const valuePercent = (value / max) * 100;
  const comparePercent = (compareValue / max) * 100;
  const isHigher = value > compareValue;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <TrendIndicator
          value={value}
          previousValue={compareValue}
          size="sm"
        />
      </div>
      
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-16">{valueLabel}</span>
          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${valuePercent}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <span className="text-xs font-medium w-12 text-right">{value}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-16">{compareLabel}</span>
          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-muted-foreground/50 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${comparePercent}%` }}
              transition={{ duration: 0.6, delay: 0.1 }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-12 text-right">{compareValue}</span>
        </div>
      </div>
    </div>
  );
};

// ============= METRIC GRID =============
interface MetricItem {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

interface MetricGridProps {
  metrics: MetricItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export const MetricGrid: React.FC<MetricGridProps> = ({
  metrics,
  columns = 4,
  className,
}) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
        >
          {metric.icon && (
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {metric.icon}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{metric.label}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-semibold">{metric.value}</span>
              {metric.change !== undefined && (
                <span className={cn(
                  'text-xs font-medium',
                  metric.change > 0 ? 'text-emerald-500' : metric.change < 0 ? 'text-red-500' : 'text-muted-foreground'
                )}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============= GAUGE CHART =============
interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  thresholds?: { warning: number; critical: number };
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min = 0,
  max = 100,
  label,
  unit = '%',
  thresholds,
  size = 'md',
  showValue = true,
  className,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const rotation = (percentage / 100) * 180;
  
  const getColor = () => {
    if (!thresholds) return 'text-primary';
    if (value >= thresholds.critical) return 'text-red-500';
    if (value >= thresholds.warning) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const sizeConfig = {
    sm: { width: 80, height: 50, strokeWidth: 6, fontSize: 'text-lg' },
    md: { width: 120, height: 70, strokeWidth: 8, fontSize: 'text-2xl' },
    lg: { width: 160, height: 90, strokeWidth: 10, fontSize: 'text-3xl' },
  };

  const config = sizeConfig[size];

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M ${config.strokeWidth} ${config.height - 4} A ${config.width / 2 - config.strokeWidth} ${config.height - config.strokeWidth - 4} 0 0 1 ${config.width - config.strokeWidth} ${config.height - 4}`}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Value arc */}
        <motion.path
          d={`M ${config.strokeWidth} ${config.height - 4} A ${config.width / 2 - config.strokeWidth} ${config.height - config.strokeWidth - 4} 0 0 1 ${config.width - config.strokeWidth} ${config.height - 4}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          className={getColor()}
          strokeDasharray={`${(percentage / 100) * 3.14 * (config.width / 2 - config.strokeWidth)} 1000`}
          initial={{ strokeDasharray: '0 1000' }}
          animate={{ strokeDasharray: `${(percentage / 100) * 3.14 * (config.width / 2 - config.strokeWidth)} 1000` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      
      {showValue && (
        <motion.div
          className={cn('font-bold -mt-2', config.fontSize, getColor())}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {value}{unit}
        </motion.div>
      )}
      
      {label && (
        <span className="text-xs text-muted-foreground mt-1">{label}</span>
      )}
    </div>
  );
};

// ============= STATUS INDICATOR =============
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'error' | 'idle';
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  pulse = true,
  size = 'md',
  className,
}) => {
  const statusConfig = {
    online: { color: 'bg-emerald-500', label: 'Online' },
    offline: { color: 'bg-gray-400', label: 'Offline' },
    warning: { color: 'bg-amber-500', label: 'Atenção' },
    error: { color: 'bg-red-500', label: 'Erro' },
    idle: { color: 'bg-blue-400', label: 'Ocioso' },
  };

  const config = statusConfig[status];
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative flex">
        <span className={cn('rounded-full', dotSize, config.color)} />
        {pulse && status !== 'offline' && (
          <span className={cn(
            'absolute inset-0 rounded-full animate-ping opacity-75',
            config.color
          )} />
        )}
      </span>
      {label !== undefined ? (
        <span className={cn('text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {label || config.label}
        </span>
      ) : null}
    </div>
  );
};

// Types already exported above via 'export interface'
