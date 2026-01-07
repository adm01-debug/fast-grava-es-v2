import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUp, 
  ArrowDown,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ============================================
// STAT CARD
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  currentValue?: number;
  suffix?: string;
  prefix?: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatCard({
  title,
  value,
  previousValue,
  currentValue,
  suffix = '',
  prefix = '',
  description,
  icon,
  trend,
  trendValue,
  className,
  variant = 'default'
}: StatCardProps) {
  const calculatedTrend = trend || (
    previousValue !== undefined && currentValue !== undefined
      ? currentValue > previousValue ? 'up' : currentValue < previousValue ? 'down' : 'neutral'
      : undefined
  );

  const calculatedTrendValue = trendValue || (
    previousValue !== undefined && currentValue !== undefined && previousValue !== 0
      ? `${(((currentValue - previousValue) / previousValue) * 100).toFixed(1)}%`
      : undefined
  );

  const variantStyles = {
    default: '',
    success: 'border-green-500/20 bg-green-500/5',
    warning: 'border-yellow-500/20 bg-yellow-500/5',
    danger: 'border-red-500/20 bg-red-500/5'
  };

  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground'
  };

  const TrendIcon = calculatedTrend === 'up' ? TrendingUp : calculatedTrend === 'down' ? TrendingDown : Minus;

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-lg text-muted-foreground">{prefix}</span>}
          <span className="text-2xl font-bold">{value}</span>
          {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
        </div>
        
        {(calculatedTrend || description) && (
          <div className="flex items-center gap-2 mt-2">
            {calculatedTrend && calculatedTrendValue && (
              <div className={cn("flex items-center gap-1 text-sm", trendColors[calculatedTrend])}>
                <TrendIcon className="h-4 w-4" />
                <span>{calculatedTrendValue}</span>
              </div>
            )}
            {description && (
              <span className="text-sm text-muted-foreground">
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// TREND INDICATOR
// ============================================

interface TrendIndicatorProps {
  value: number;
  previousValue?: number;
  format?: 'percent' | 'absolute' | 'custom';
  formatFn?: (value: number) => string;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  invertColors?: boolean;
  className?: string;
}

export function TrendIndicator({
  value,
  previousValue,
  format = 'percent',
  formatFn,
  showIcon = true,
  showLabel = true,
  size = 'md',
  invertColors = false,
  className
}: TrendIndicatorProps) {
  const change = previousValue !== undefined ? value - previousValue : value;
  const percentChange = previousValue !== undefined && previousValue !== 0
    ? ((change / previousValue) * 100)
    : 0;

  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  const formattedValue = formatFn
    ? formatFn(change)
    : format === 'percent'
      ? `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`
      : `${change >= 0 ? '+' : ''}${change}`;

  const colorClass = isNeutral
    ? 'text-muted-foreground'
    : (isPositive !== invertColors)
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';

  const bgClass = isNeutral
    ? 'bg-muted'
    : (isPositive !== invertColors)
      ? 'bg-green-100 dark:bg-green-900/30'
      : 'bg-red-100 dark:bg-red-900/30';

  const sizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const Icon = isPositive ? ArrowUp : isNegative ? ArrowDown : ArrowRight;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full font-medium",
      colorClass,
      bgClass,
      sizes[size],
      className
    )}>
      {showIcon && <Icon className={iconSizes[size]} />}
      {showLabel && formattedValue}
    </span>
  );
}

// ============================================
// SPARKLINE
// ============================================

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  fillOpacity?: number;
  showDots?: boolean;
  showArea?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 32,
  strokeWidth = 2,
  color = 'currentColor',
  fillOpacity = 0.1,
  showDots = false,
  showArea = true,
  className
}: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = strokeWidth;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((value, index) => ({
    x: padding + (index / (data.length - 1)) * chartWidth,
    y: padding + chartHeight - ((value - min) / range) * chartHeight
  }));

  const linePath = points
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  const trend = data[data.length - 1] >= data[0] ? 'up' : 'down';
  const trendColor = trend === 'up' 
    ? 'text-green-500' 
    : 'text-red-500';

  return (
    <svg
      width={width}
      height={height}
      className={cn(trendColor, className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      {showArea && (
        <path
          d={areaPath}
          fill={color}
          fillOpacity={fillOpacity}
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDots && points.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={strokeWidth}
          fill={color}
        />
      ))}
    </svg>
  );
}

// ============================================
// MINI BAR CHART
// ============================================

interface MiniBarChartProps {
  data: { value: number; label?: string }[];
  width?: number;
  height?: number;
  barWidth?: number;
  gap?: number;
  color?: string;
  showLabels?: boolean;
  className?: string;
}

export function MiniBarChart({
  data,
  width = 100,
  height = 32,
  barWidth,
  gap = 2,
  color = 'currentColor',
  showLabels = false,
  className
}: MiniBarChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map(d => d.value));
  const calculatedBarWidth = barWidth || (width - gap * (data.length - 1)) / data.length;

  return (
    <TooltipProvider>
      <svg
        width={width}
        height={height}
        className={cn("text-primary", className)}
        viewBox={`0 0 ${width} ${height}`}
      >
        {data.map((item, i) => {
          const barHeight = (item.value / max) * height;
          const x = i * (calculatedBarWidth + gap);
          const y = height - barHeight;

          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <rect
                  x={x}
                  y={y}
                  width={calculatedBarWidth}
                  height={barHeight}
                  fill={color}
                  rx={2}
                  className="transition-opacity hover:opacity-80 cursor-pointer"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{item.value}</p>
                {item.label && <p className="text-xs text-muted-foreground">{item.label}</p>}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </svg>
    </TooltipProvider>
  );
}

// ============================================
// PROGRESS RING
// ============================================

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  valueFormat?: (value: number, max: number) => string;
  color?: string;
  trackColor?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  showValue = true,
  valueFormat = (v, m) => `${Math.round((v / m) * 100)}%`,
  color,
  trackColor,
  className,
  children
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor || 'currentColor'}
          strokeWidth={strokeWidth}
          fill="none"
          className={cn(!trackColor && "text-muted opacity-20")}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color || 'currentColor'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-500 ease-out",
            !color && "text-primary"
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showValue && (
          <span className="text-sm font-semibold">
            {valueFormat(value, max)}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================
// COMPARISON BAR
// ============================================

interface ComparisonBarProps {
  label: string;
  value: number;
  maxValue: number;
  compareValue?: number;
  showValues?: boolean;
  format?: (value: number) => string;
  className?: string;
}

export function ComparisonBar({
  label,
  value,
  maxValue,
  compareValue,
  showValues = true,
  format = (v) => v.toString(),
  className
}: ComparisonBarProps) {
  const percentage = (value / maxValue) * 100;
  const comparePercentage = compareValue ? (compareValue / maxValue) * 100 : 0;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium truncate">{label}</span>
        {showValues && (
          <span className="text-muted-foreground">
            {format(value)}
            {compareValue !== undefined && (
              <span className="text-xs ml-1">
                vs {format(compareValue)}
              </span>
            )}
          </span>
        )}
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        {compareValue !== undefined && (
          <div
            className="absolute inset-y-0 left-0 bg-muted-foreground/30 rounded-full"
            style={{ width: `${comparePercentage}%` }}
          />
        )}
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// METRIC GRID
// ============================================

interface Metric {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

interface MetricGridProps {
  metrics: Metric[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MetricGrid({ metrics, columns = 3, className }: MetricGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {metrics.map((metric, i) => (
        <div key={i} className="p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{metric.label}</span>
            {metric.icon}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{metric.value}</span>
            {metric.change !== undefined && (
              <TrendIndicator value={metric.change} size="sm" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
