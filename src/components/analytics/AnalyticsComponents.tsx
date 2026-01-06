import { ReactNode, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// KPI CARD
// ============================================

interface KPICardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percent';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  target?: number;
  description?: string;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function KPICard({
  title,
  value,
  previousValue,
  format = 'number',
  trend,
  trendValue,
  target,
  description,
  icon,
  size = 'md',
  variant = 'default',
  className,
}: KPICardProps) {
  const calculatedTrend = useMemo(() => {
    if (trend) return trend;
    if (previousValue !== undefined && typeof value === 'number') {
      if (value > previousValue) return 'up';
      if (value < previousValue) return 'down';
      return 'stable';
    }
    return undefined;
  }, [trend, value, previousValue]);

  const calculatedTrendValue = useMemo(() => {
    if (trendValue) return trendValue;
    if (previousValue !== undefined && typeof value === 'number' && previousValue !== 0) {
      const change = ((value - previousValue) / previousValue) * 100;
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    }
    return undefined;
  }, [trendValue, value, previousValue]);

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('pt-BR').format(val);
    }
  };

  const TrendIcon = calculatedTrend === 'up' ? TrendingUp : calculatedTrend === 'down' ? TrendingDown : Minus;
  
  const trendColor = calculatedTrend === 'up' 
    ? 'text-green-600 dark:text-green-400' 
    : calculatedTrend === 'down' 
      ? 'text-red-600 dark:text-red-400' 
      : 'text-muted-foreground';

  const variantStyles = {
    default: '',
    success: 'border-green-500/20 bg-green-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
    danger: 'border-red-500/20 bg-red-500/5',
  };

  const sizeStyles = {
    sm: { card: 'p-3', title: 'text-xs', value: 'text-xl' },
    md: { card: 'p-4', title: 'text-sm', value: 'text-2xl' },
    lg: { card: 'p-6', title: 'text-base', value: 'text-4xl' },
  };

  const progress = target && typeof value === 'number' ? (value / target) * 100 : undefined;

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardContent className={sizeStyles[size].card}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className={cn("text-muted-foreground font-medium", sizeStyles[size].title)}>
              {title}
            </p>
            <motion.p
              key={String(value)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("font-bold tracking-tight", sizeStyles[size].value)}
            >
              {formatValue(value)}
            </motion.p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {icon && (
            <div className="p-2 bg-muted rounded-lg">
              {icon}
            </div>
          )}
        </div>

        {(calculatedTrend || progress !== undefined) && (
          <div className="mt-3 flex items-center gap-3">
            {calculatedTrend && calculatedTrendValue && (
              <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
                <TrendIcon className="h-4 w-4" />
                <span className="font-medium">{calculatedTrendValue}</span>
              </div>
            )}
            {progress !== undefined && (
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Meta</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-1.5" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// SPARKLINE
// ============================================

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  showDots?: boolean;
  animated?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = 'hsl(var(--primary))',
  fillColor,
  showDots = false,
  animated = true,
  className,
}: SparklineProps) {
  const points = useMemo(() => {
    if (data.length === 0) return '';
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const xStep = width / (data.length - 1);
    const padding = 2;
    
    return data.map((value, index) => {
      const x = index * xStep;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');
  }, [data, width, height]);

  const areaPath = useMemo(() => {
    if (data.length === 0) return '';
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const xStep = width / (data.length - 1);
    const padding = 2;
    
    const pathPoints = data.map((value, index) => {
      const x = index * xStep;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return `${pathPoints} L ${width} ${height} L 0 ${height} Z`;
  }, [data, width, height]);

  const dotPositions = useMemo(() => {
    if (!showDots || data.length === 0) return [];
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const xStep = width / (data.length - 1);
    const padding = 2;
    
    return data.map((value, index) => ({
      x: index * xStep,
      y: height - padding - ((value - min) / range) * (height - padding * 2),
      value,
    }));
  }, [data, width, height, showDots]);

  return (
    <svg 
      width={width} 
      height={height} 
      className={cn("overflow-visible", className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      {fillColor && (
        <motion.path
          d={areaPath}
          fill={fillColor}
          initial={animated ? { opacity: 0 } : undefined}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 0.5 }}
        />
      )}
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { pathLength: 0 } : undefined}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      {showDots && dotPositions.map((dot, index) => (
        <motion.circle
          key={index}
          cx={dot.x}
          cy={dot.y}
          r={3}
          fill={color}
          initial={animated ? { scale: 0 } : undefined}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
        />
      ))}
    </svg>
  );
}

// ============================================
// MINI CHART (Sparkline with context)
// ============================================

interface MiniChartProps {
  label: string;
  value: string | number;
  data: number[];
  trend?: 'up' | 'down' | 'stable';
  color?: string;
  className?: string;
}

export function MiniChart({
  label,
  value,
  data,
  trend,
  color = 'hsl(var(--primary))',
  className,
}: MiniChartProps) {
  const calculatedTrend = useMemo(() => {
    if (trend) return trend;
    if (data.length >= 2) {
      const last = data[data.length - 1];
      const prev = data[data.length - 2];
      if (last > prev) return 'up';
      if (last < prev) return 'down';
      return 'stable';
    }
    return 'stable';
  }, [trend, data]);

  const trendColor = calculatedTrend === 'up' 
    ? 'text-green-600 dark:text-green-400'
    : calculatedTrend === 'down'
      ? 'text-red-600 dark:text-red-400'
      : 'text-muted-foreground';

  const ArrowIcon = calculatedTrend === 'up' ? ArrowUpRight : calculatedTrend === 'down' ? ArrowDownRight : Minus;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <div className="flex items-center gap-1">
          <span className="text-lg font-semibold">{value}</span>
          <ArrowIcon className={cn("h-4 w-4", trendColor)} />
        </div>
      </div>
      <Sparkline data={data} width={60} height={24} color={color} />
    </div>
  );
}

// ============================================
// TREND INDICATOR
// ============================================

interface TrendIndicatorProps {
  value: number;
  previousValue: number;
  format?: 'percent' | 'absolute';
  showIcon?: boolean;
  showLabel?: boolean;
  positiveIsGood?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TrendIndicator({
  value,
  previousValue,
  format = 'percent',
  showIcon = true,
  showLabel = false,
  positiveIsGood = true,
  size = 'md',
  className,
}: TrendIndicatorProps) {
  const change = value - previousValue;
  const percentChange = previousValue !== 0 ? (change / previousValue) * 100 : 0;
  
  const isPositive = change > 0;
  const isNeutral = change === 0;
  
  const isGood = isNeutral ? null : positiveIsGood ? isPositive : !isPositive;

  const displayValue = format === 'percent' 
    ? `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`
    : `${change >= 0 ? '+' : ''}${change.toLocaleString('pt-BR')}`;

  const colorClass = isNeutral 
    ? 'text-muted-foreground bg-muted'
    : isGood 
      ? 'text-green-700 dark:text-green-400 bg-green-500/10'
      : 'text-red-700 dark:text-red-400 bg-red-500/10';

  const Icon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown;

  const sizeStyles = {
    sm: 'text-xs px-1.5 py-0.5 gap-0.5',
    md: 'text-sm px-2 py-1 gap-1',
    lg: 'text-base px-3 py-1.5 gap-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        sizeStyles[size],
        colorClass,
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {displayValue}
      {showLabel && (
        <span className="text-muted-foreground ml-1">
          vs anterior
        </span>
      )}
    </span>
  );
}

// ============================================
// STAT COMPARISON
// ============================================

interface StatComparisonProps {
  label: string;
  current: number;
  previous: number;
  target?: number;
  format?: 'number' | 'currency' | 'percent';
  className?: string;
}

export function StatComparison({
  label,
  current,
  previous,
  target,
  format = 'number',
  className,
}: StatComparisonProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('pt-BR').format(val);
    }
  };

  const percentChange = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  const targetProgress = target ? (current / target) * 100 : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <TrendIndicator value={current} previousValue={previous} size="sm" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{formatValue(current)}</span>
        <span className="text-sm text-muted-foreground">
          de {formatValue(previous)}
        </span>
      </div>
      {target && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Target className="h-3 w-3" />
              Meta: {formatValue(target)}
            </span>
            <span className={cn(
              "font-medium",
              targetProgress && targetProgress >= 100 ? 'text-green-600' : 'text-muted-foreground'
            )}>
              {targetProgress?.toFixed(0)}%
            </span>
          </div>
          <Progress value={Math.min(targetProgress || 0, 100)} className="h-1.5" />
        </div>
      )}
    </div>
  );
}

// ============================================
// STATUS INDICATOR
// ============================================

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label?: string;
  description?: string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIndicator({
  status,
  label,
  description,
  pulse = false,
  size = 'md',
  className,
}: StatusIndicatorProps) {
  const statusConfig = {
    success: {
      color: 'bg-green-500',
      textColor: 'text-green-700 dark:text-green-400',
      icon: CheckCircle2,
      label: label || 'Sucesso',
    },
    warning: {
      color: 'bg-amber-500',
      textColor: 'text-amber-700 dark:text-amber-400',
      icon: AlertTriangle,
      label: label || 'Atenção',
    },
    error: {
      color: 'bg-red-500',
      textColor: 'text-red-700 dark:text-red-400',
      icon: AlertTriangle,
      label: label || 'Erro',
    },
    info: {
      color: 'bg-blue-500',
      textColor: 'text-blue-700 dark:text-blue-400',
      icon: Info,
      label: label || 'Informação',
    },
    neutral: {
      color: 'bg-muted-foreground',
      textColor: 'text-muted-foreground',
      icon: Minus,
      label: label || 'Neutro',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeStyles = {
    sm: { dot: 'h-2 w-2', icon: 'h-3 w-3', text: 'text-xs' },
    md: { dot: 'h-2.5 w-2.5', icon: 'h-4 w-4', text: 'text-sm' },
    lg: { dot: 'h-3 w-3', icon: 'h-5 w-5', text: 'text-base' },
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative flex">
        <span className={cn(
          "rounded-full",
          config.color,
          sizeStyles[size].dot,
          pulse && "animate-ping absolute inline-flex h-full w-full opacity-75"
        )} />
        <span className={cn(
          "relative rounded-full",
          config.color,
          sizeStyles[size].dot
        )} />
      </span>
      <div className="flex flex-col">
        <span className={cn("font-medium", config.textColor, sizeStyles[size].text)}>
          {config.label}
        </span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
    </div>
  );
}

// ============================================
// METRIC ROW
// ============================================

interface MetricRowProps {
  metrics: {
    label: string;
    value: string | number;
    subValue?: string;
    trend?: 'up' | 'down' | 'stable';
    icon?: ReactNode;
  }[];
  className?: string;
}

export function MetricRow({ metrics, className }: MetricRowProps) {
  return (
    <div className={cn("flex items-center divide-x divide-border", className)}>
      {metrics.map((metric, index) => {
        const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
        const trendColor = metric.trend === 'up' 
          ? 'text-green-600' 
          : metric.trend === 'down' 
            ? 'text-red-600' 
            : 'text-muted-foreground';

        return (
          <div key={index} className={cn("flex-1 px-4 first:pl-0 last:pr-0")}>
            <div className="flex items-center gap-2">
              {metric.icon}
              <div>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-semibold">{metric.value}</span>
                  {metric.trend && (
                    <TrendIcon className={cn("h-4 w-4", trendColor)} />
                  )}
                </div>
                {metric.subValue && (
                  <p className="text-xs text-muted-foreground">{metric.subValue}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// ANALYTICS CARD (Combined component)
// ============================================

interface AnalyticsCardProps {
  title: string;
  description?: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  sparklineData?: number[];
  status?: 'success' | 'warning' | 'error' | 'info';
  footer?: ReactNode;
  className?: string;
}

export function AnalyticsCard({
  title,
  description,
  value,
  trend,
  trendValue,
  sparklineData,
  status,
  footer,
  className,
}: AnalyticsCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' 
    ? 'text-green-600 dark:text-green-400' 
    : trend === 'down' 
      ? 'text-red-600 dark:text-red-400' 
      : 'text-muted-foreground';

  const statusColors = {
    success: 'border-l-green-500',
    warning: 'border-l-amber-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500',
  };

  return (
    <Card className={cn(
      status && `border-l-4 ${statusColors[status]}`,
      className
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <motion.p
              key={String(value)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold"
            >
              {value}
            </motion.p>
            {trend && trendValue && (
              <div className={cn("flex items-center gap-1 mt-1", trendColor)}>
                <TrendIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{trendValue}</span>
              </div>
            )}
          </div>
          {sparklineData && sparklineData.length > 0 && (
            <Sparkline 
              data={sparklineData} 
              width={80} 
              height={32}
              color={trend === 'up' ? 'hsl(142, 76%, 36%)' : trend === 'down' ? 'hsl(0, 84%, 60%)' : 'hsl(var(--primary))'}
              fillColor={trend === 'up' ? 'hsl(142, 76%, 36%)' : trend === 'down' ? 'hsl(0, 84%, 60%)' : 'hsl(var(--primary))'}
            />
          )}
        </div>
        {footer && (
          <div className="mt-4 pt-4 border-t">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
