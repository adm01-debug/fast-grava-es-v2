import React, { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Activity,
  RefreshCw,
  AlertCircle,
  Download,
  Maximize2,
  Minimize2,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types
type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'composed';

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  type?: ChartType;
  children: ReactNode;
  
  // State
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyMessage?: string;
  
  // Features
  showRefresh?: boolean;
  showExport?: boolean;
  showFullscreen?: boolean;
  showFilters?: boolean;
  
  // Callbacks
  onRefresh?: () => void;
  onExport?: () => void;
  onFilterChange?: (filter: string) => void;
  
  // Filters
  filters?: { label: string; value: string }[];
  activeFilter?: string;
  
  // Styling
  className?: string;
  contentClassName?: string;
  height?: number | string;
  
  // Animation
  animateOnLoad?: boolean;
}

// Chart type icons
const chartIcons: Record<ChartType, React.ElementType> = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  area: Activity,
  composed: BarChart3,
};

// Skeleton variants for different chart types
const ChartSkeletons: Record<ChartType, React.FC<{ height: number | string }>> = {
  bar: ({ height }) => (
    <div className="flex items-end justify-around gap-2 h-full p-4" style={{ minHeight: height }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1"
          style={{
            height: `${30 + Math.random() * 50}%`,
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  ),
  line: ({ height }) => (
    <div className="relative h-full p-4" style={{ minHeight: height }}>
      <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
        <motion.path
          d="M0,150 Q50,100 100,120 T200,80 T300,100 T400,60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted-foreground/20"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>
      <div className="absolute inset-4 flex flex-col justify-between">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-px w-full" />
        ))}
      </div>
    </div>
  ),
  pie: ({ height }) => (
    <div className="flex items-center justify-center h-full p-4" style={{ minHeight: height }}>
      <div className="relative">
        <Skeleton className="w-40 h-40 rounded-full" />
        <div className="absolute inset-4 bg-background rounded-full" />
      </div>
    </div>
  ),
  area: ({ height }) => (
    <div className="relative h-full p-4" style={{ minHeight: height }}>
      <Skeleton className="absolute inset-4 rounded-lg opacity-30" />
      <svg className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)]" viewBox="0 0 400 200" preserveAspectRatio="none">
        <motion.path
          d="M0,200 L0,150 Q50,100 100,120 T200,80 T300,100 T400,60 L400,200 Z"
          className="fill-muted-foreground/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </svg>
    </div>
  ),
  composed: ({ height }) => (
    <div className="flex items-end justify-around gap-2 h-full p-4" style={{ minHeight: height }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton
            className="w-full"
            style={{
              height: `${20 + Math.random() * 40}%`,
              animationDelay: `${i * 100}ms`,
            }}
          />
        </div>
      ))}
    </div>
  ),
};

// Empty state component
const ChartEmptyState: React.FC<{ type: ChartType; message: string }> = ({ type, message }) => {
  const Icon = chartIcons[type];
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="p-4 rounded-full bg-muted/50 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

// Error state component
const ChartErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <div className="p-4 rounded-full bg-destructive/10 mb-4">
      <AlertCircle className="h-8 w-8 text-destructive" />
    </div>
    <p className="text-sm text-destructive mb-4">{message}</p>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Tentar novamente
      </Button>
    )}
  </div>
);

export function ChartWrapper({
  title,
  subtitle,
  type = 'bar',
  children,
  loading = false,
  error,
  empty = false,
  emptyMessage = 'Sem dados para exibir',
  showRefresh = false,
  showExport = false,
  showFullscreen = false,
  showFilters = false,
  onRefresh,
  onExport,
  onFilterChange,
  filters = [],
  activeFilter,
  className,
  contentClassName,
  height = 300,
  animateOnLoad = true,
}: ChartWrapperProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ChartIcon = chartIcons[type];
  const SkeletonComponent = ChartSkeletons[type];

  // Animate on mount
  useEffect(() => {
    if (animateOnLoad && !loading) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
    setIsVisible(true);
  }, [animateOnLoad, loading]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Render content based on state
  const renderContent = () => {
    if (loading) {
      return <SkeletonComponent height={height} />;
    }

    if (error) {
      return <ChartErrorState message={error} onRetry={onRefresh} />;
    }

    if (empty) {
      return <ChartEmptyState type={type} message={emptyMessage} />;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          initial={animateOnLoad ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  };

  const wrapperContent = (
    <div
      className={cn(
        "relative border border-border rounded-xl bg-card overflow-hidden",
        "transition-all duration-300",
        isFullscreen && "fixed inset-4 z-50 rounded-2xl shadow-2xl",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ChartIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {showFilters && filters.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {filters.map((filter) => (
                  <DropdownMenuItem
                    key={filter.value}
                    onClick={() => onFilterChange?.(filter.value)}
                    className={cn(
                      activeFilter === filter.value && "bg-primary/10 text-primary"
                    )}
                  >
                    {filter.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {showRefresh && onRefresh && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onRefresh}
                    disabled={loading}
                  >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Atualizar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {showExport && onExport && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onExport}
                    disabled={loading || empty}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Exportar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {showFullscreen && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? 'Minimizar' : 'Tela cheia'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={cn("p-4", contentClassName)}
        style={{ minHeight: isFullscreen ? 'calc(100% - 80px)' : height }}
      >
        {renderContent()}
      </div>

      {/* Loading overlay for refresh */}
      <AnimatePresence>
        {loading && !animateOnLoad && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
          >
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Fullscreen backdrop
  if (isFullscreen) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={toggleFullscreen}
        />
        {wrapperContent}
      </>
    );
  }

  return wrapperContent;
}

// Mini chart for compact displays
interface MiniChartProps {
  data: number[];
  type?: 'line' | 'bar';
  color?: string;
  height?: number;
  className?: string;
}

export function MiniChart({
  data,
  type = 'line',
  color = 'hsl(var(--primary))',
  height = 40,
  className,
}: MiniChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  if (type === 'bar') {
    return (
      <div
        className={cn("flex items-end gap-0.5", className)}
        style={{ height }}
      >
        {data.map((value, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${((value - min) / range) * 100}%` }}
            transition={{ delay: i * 0.05 }}
            className="flex-1 rounded-t-sm"
            style={{ backgroundColor: color, minHeight: 2 }}
          />
        ))}
      </div>
    );
  }

  // Line chart
  const points = data.map((value, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - ((value - min) / range) * 100,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      style={{ height }}
    >
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
    </svg>
  );
}

// Export chart color utilities
export const chartColors = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  destructive: 'hsl(var(--destructive))',
  muted: 'hsl(var(--muted-foreground))',
  series: [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ],
};
