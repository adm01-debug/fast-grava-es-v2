import { useMemo, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Info,
  Maximize2,
  Download,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';

// Metric Card with trend
interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  format?: 'number' | 'percentage' | 'currency' | 'duration';
  icon?: React.ElementType;
  color?: string;
  info?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  previousValue,
  format = 'number',
  icon: Icon,
  color = 'primary',
  info,
  className
}: MetricCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  
  const trend = useMemo(() => {
    if (previousValue === undefined) return null;
    const change = ((numericValue - previousValue) / previousValue) * 100;
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(change).toFixed(1)
    };
  }, [numericValue, previousValue]);

  const formattedValue = useMemo(() => {
    switch (format) {
      case 'percentage':
        return `${numericValue.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericValue);
      case 'duration':
        const hours = Math.floor(numericValue / 60);
        const minutes = numericValue % 60;
        return `${hours}h ${minutes}m`;
      default:
        return numericValue.toLocaleString('pt-BR');
    }
  }, [numericValue, format]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 bg-card border border-border rounded-xl",
        className
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center",
              `bg-${color}/10`
            )}>
              <Icon className={cn("h-4 w-4", `text-${color}`)} />
            </div>
          )}
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
        {info && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground/50" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{info}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <motion.span 
          key={formattedValue}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold"
        >
          {formattedValue}
        </motion.span>
        
        {trend && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
              trend.direction === 'up' && "bg-green-500/10 text-green-600",
              trend.direction === 'down' && "bg-red-500/10 text-red-600",
              trend.direction === 'neutral' && "bg-muted text-muted-foreground"
            )}
          >
            {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
            {trend.direction === 'neutral' && <Minus className="h-3 w-3" />}
            <span>{trend.percentage}%</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Progress Ring
interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  label,
  sublabel
}: ProgressRingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={`text-${color}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          key={percentage}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xl font-bold"
        >
          {label || `${percentage.toFixed(0)}%`}
        </motion.span>
        {sublabel && (
          <span className="text-xs text-muted-foreground">{sublabel}</span>
        )}
      </div>
    </div>
  );
}

// Sparkline
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showArea?: boolean;
}

export function Sparkline({
  data,
  color = 'primary',
  height = 40,
  width = 100,
  showArea = false
}: SparklineProps) {
  const points = useMemo(() => {
    if (data.length === 0) return '';
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    return data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
  }, [data, height, width]);

  const areaPath = useMemo(() => {
    if (data.length === 0 || !showArea) return '';
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const pathPoints = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' L');
    
    return `M0,${height} L${pathPoints} L${width},${height} Z`;
  }, [data, height, width, showArea]);

  return (
    <svg width={width} height={height} className="overflow-visible">
      {showArea && (
        <path
          d={areaPath}
          fill={`url(#sparkline-gradient-${color})`}
          opacity={0.2}
        />
      )}
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" className={`text-${color}`} />
          <stop offset="100%" stopColor="currentColor" className={`text-${color}`} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-${color}`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
}

// Chart Container with actions
interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onRefresh?: () => void;
  onExpand?: () => void;
  onDownload?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ChartContainer({
  title,
  subtitle,
  children,
  onRefresh,
  onExpand,
  onDownload,
  isLoading = false,
  className
}: ChartContainerProps) {
  return (
    <div className={cn("p-4 bg-card border border-border rounded-xl", className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          )}
          {onExpand && (
            <Button variant="ghost" size="icon" onClick={onExpand}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
          {onDownload && (
            <Button variant="ghost" size="icon" onClick={onDownload}>
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-64 flex items-center justify-center"
          >
            <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Status Indicator
interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label?: string;
  pulse?: boolean;
}

export function StatusIndicator({ status, label, pulse = false }: StatusIndicatorProps) {
  const colors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-500'
  };

  return (
    <div className="flex items-center gap-2">
      <span className={cn("relative flex h-2.5 w-2.5", pulse && "animate-pulse")}>
        <span className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-75",
          colors[status],
          pulse && "animate-ping"
        )} />
        <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", colors[status])} />
      </span>
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

// Mini Bar Chart
interface MiniBarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  showLabels?: boolean;
}

export function MiniBarChart({ data, height = 60, showLabels = true }: MiniBarChartProps) {
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((item, index) => {
          const barHeight = (item.value / max) * 100;
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${barHeight}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className={cn(
                      "flex-1 rounded-t-sm cursor-pointer hover:opacity-80 transition-opacity",
                      item.color || "bg-primary"
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      {showLabels && (
        <div className="flex gap-1">
          {data.map((item, index) => (
            <span key={index} className="flex-1 text-[10px] text-muted-foreground text-center truncate">
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Comparison Display
interface ComparisonDisplayProps {
  current: number;
  previous: number;
  label?: string;
  format?: 'number' | 'percentage';
}

export function ComparisonDisplay({ current, previous, label, format = 'number' }: ComparisonDisplayProps) {
  const change = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const formatValue = (val: number) => {
    return format === 'percentage' ? `${val.toFixed(1)}%` : val.toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-1">
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold">{formatValue(current)}</span>
        <div className={cn(
          "flex items-center gap-1 text-sm",
          isPositive ? "text-green-600" : isNeutral ? "text-muted-foreground" : "text-red-600"
        )}>
          {isPositive ? <TrendingUp className="h-4 w-4" /> : isNeutral ? <Minus className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span>{Math.abs(change).toFixed(1)}%</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        vs anterior: {formatValue(previous)}
      </p>
    </div>
  );
}
