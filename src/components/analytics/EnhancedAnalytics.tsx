import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Animated counter hook
export function useAnimatedCounter(target: number, duration: number = 1000) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(target * easeOutQuart));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
}

// Enhanced Stat card with animated value
interface EnhancedStatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percent';
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  loading?: boolean;
}

export function EnhancedStatCard({
  title,
  value,
  previousValue,
  format = 'number',
  icon,
  trend,
  trendValue,
  suffix,
  prefix,
  className,
  loading = false,
}: EnhancedStatCardProps) {
  const animatedValue = useAnimatedCounter(value);

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(val);
      case 'percent':
        return `${val}%`;
      default:
        return new Intl.NumberFormat('pt-BR').format(val);
    }
  };

  const calculatedTrend = React.useMemo(() => {
    if (trend) return trend;
    if (previousValue === undefined) return 'neutral';
    if (value > previousValue) return 'up';
    if (value < previousValue) return 'down';
    return 'neutral';
  }, [trend, value, previousValue]);

  const calculatedTrendValue = React.useMemo(() => {
    if (trendValue !== undefined) return trendValue;
    if (previousValue === undefined || previousValue === 0) return 0;
    return Math.round(((value - previousValue) / previousValue) * 100);
  }, [trendValue, value, previousValue]);

  const TrendIcon = calculatedTrend === 'up' ? TrendingUp : calculatedTrend === 'down' ? TrendingDown : Minus;
  const trendColor = calculatedTrend === 'up' ? 'text-success' : calculatedTrend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="flex items-baseline gap-1">
                {prefix && <span className="text-lg text-muted-foreground">{prefix}</span>}
                <span className="text-3xl font-bold tracking-tight">
                  {format === 'currency' ? formatValue(animatedValue) : animatedValue.toLocaleString('pt-BR')}
                </span>
                {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
              </div>
              <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
                <TrendIcon className="h-4 w-4" />
                <span>{Math.abs(calculatedTrendValue)}%</span>
                <span className="text-muted-foreground">vs período anterior</span>
              </div>
            </div>
            {icon && (
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Enhanced Progress ring
interface EnhancedProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  color?: string;
}

export function EnhancedProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
  children,
  color,
}: EnhancedProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          className={color ? '' : 'text-primary'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={color || 'currentColor'}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <span className="text-2xl font-bold">{Math.round(progress)}%</span>
        )}
      </div>
    </div>
  );
}

// KPI Card
interface KPICardProps {
  title: string;
  value: number;
  target: number;
  unit?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function KPICard({ title, value, target, unit, icon, className }: KPICardProps) {
  const progress = Math.min((value / target) * 100, 100);
  const isOnTrack = value >= target * 0.9;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold">
            {value.toLocaleString('pt-BR')} {unit}
          </span>
          <Badge variant={isOnTrack ? 'default' : 'secondary'}>
            {isOnTrack ? 'No alvo' : 'Abaixo'}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          Meta: {target.toLocaleString('pt-BR')} {unit}
        </p>
      </CardContent>
    </Card>
  );
}

// Activity feed item
interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description?: string;
  timestamp: Date;
  icon?: React.ReactNode;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
  className?: string;
}

export function ActivityFeed({ items, maxItems = 5, className }: ActivityFeedProps) {
  const displayItems = items.slice(0, maxItems);

  const getTypeStyles = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AnimatePresence>
            {displayItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className={cn(
                  "p-2 rounded-full border",
                  getTypeStyles(item.type)
                )}>
                  {item.icon || <Activity className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' }).format(
                      Math.round((item.timestamp.getTime() - Date.now()) / 60000),
                      'minute'
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard header with actions
interface DashboardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  onRefresh?: () => void;
  lastUpdated?: Date;
  className?: string;
}

export function DashboardHeader({
  title,
  description,
  actions,
  loading,
  onRefresh,
  lastUpdated,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {lastUpdated && (
          <span className="text-xs text-muted-foreground">
            Atualizado: {lastUpdated.toLocaleTimeString('pt-BR')}
          </span>
        )}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Atualizar
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}
