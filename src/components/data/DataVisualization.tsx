import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  Activity,
  Zap
} from "lucide-react";

// ============================================================================
// MELHORIA #16: VISUALIZAÇÃO DE DADOS AVANÇADA
// Componentes de visualização de dados com animações e interatividade
// ============================================================================

// Componente de número animado
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const previousValue = React.useRef(0);

  React.useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const current = startValue + (endValue - startValue) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// Indicador de tendência
interface TrendIndicatorProps {
  value: number;
  previousValue: number;
  showPercentage?: boolean;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TrendIndicator({
  value,
  previousValue,
  showPercentage = true,
  showIcon = true,
  size = "md",
  className,
}: TrendIndicatorProps) {
  const change = previousValue !== 0 
    ? ((value - previousValue) / previousValue) * 100 
    : 0;
  
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const sizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium",
        sizes[size],
        isNeutral
          ? "text-muted-foreground"
          : isPositive
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400",
        className
      )}
    >
      {showIcon && (
        <>
          {isNeutral ? (
            <Minus className={iconSizes[size]} />
          ) : isPositive ? (
            <TrendingUp className={iconSizes[size]} />
          ) : (
            <TrendingDown className={iconSizes[size]} />
          )}
        </>
      )}
      {showPercentage && (
        <span>
          {isPositive && "+"}
          {change.toFixed(1)}%
        </span>
      )}
    </span>
  );
}

// Card de KPI animado
interface KPICardProps {
  title: string;
  value: number;
  previousValue?: number;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  previousValue,
  prefix,
  suffix,
  icon,
  description,
  trend,
  trendValue,
  className,
}: KPICardProps) {
  const trendColors = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground",
  };

  const trendIcons = {
    up: <ArrowUp className="h-4 w-4" />,
    down: <ArrowDown className="h-4 w-4" />,
    neutral: <Minus className="h-4 w-4" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-xl border bg-card shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold">
              <AnimatedNumber
                value={value}
                prefix={prefix}
                suffix={suffix}
              />
            </span>
            {previousValue !== undefined && (
              <TrendIndicator value={value} previousValue={previousValue} size="sm" />
            )}
          </div>
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>

      {(trend || description) && (
        <div className="mt-4 pt-4 border-t border-border/50">
          {trend && trendValue && (
            <div className={cn("flex items-center gap-1", trendColors[trend])}>
              {trendIcons[trend]}
              <span className="text-sm font-medium">{trendValue}</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Barra de progresso animada
interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  showValue?: boolean;
  label?: string;
  color?: string;
  height?: number;
  className?: string;
}

export function AnimatedProgressBar({
  value,
  max = 100,
  showLabel = true,
  showValue = true,
  label,
  color,
  height = 8,
  className,
}: AnimatedProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("space-y-2", className)}>
      {(showLabel || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {showLabel && label && (
            <span className="text-muted-foreground">{label}</span>
          )}
          {showValue && (
            <span className="font-medium">
              <AnimatedNumber value={percentage} decimals={0} suffix="%" />
            </span>
          )}
        </div>
      )}
      <div
        className="w-full bg-muted rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color || "hsl(var(--primary))" }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// Gauge/Speedometer
interface GaugeChartProps {
  value: number;
  max?: number;
  min?: number;
  label?: string;
  thresholds?: { value: number; color: string }[];
  size?: number;
  className?: string;
}

export function GaugeChart({
  value,
  max = 100,
  min = 0,
  label,
  thresholds = [
    { value: 33, color: "#ef4444" },
    { value: 66, color: "#eab308" },
    { value: 100, color: "#22c55e" },
  ],
  size = 200,
  className,
}: GaugeChartProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const angle = (percentage / 100) * 180 - 90;

  const getColor = () => {
    for (const threshold of thresholds) {
      if (percentage <= threshold.value) {
        return threshold.color;
      }
    }
    return thresholds[thresholds.length - 1].color;
  };

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size / 2 }}>
      {/* Background arc */}
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* Value arc */}
        <motion.path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke={getColor()}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="282.74"
          initial={{ strokeDashoffset: 282.74 }}
          animate={{ strokeDashoffset: 282.74 - (percentage / 100) * 282.74 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Needle */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformOrigin: "100px 100px" }}
        >
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="25"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </motion.g>

        {/* Center dot */}
        <circle cx="100" cy="100" r="8" fill="currentColor" />
      </svg>

      {/* Value display */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <span className="text-2xl font-bold">
          <AnimatedNumber value={value} />
        </span>
        {label && (
          <p className="text-xs text-muted-foreground">{label}</p>
        )}
      </div>
    </div>
  );
}

// Sparkline chart simples
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = "hsl(var(--primary))",
  showArea = true,
  className,
}: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(" L ")}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      style={{ width, height }}
    >
      {showArea && (
        <motion.path
          d={areaPath}
          fill={color}
          opacity={0.1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
        />
      )}
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      
      {/* End dot */}
      <motion.circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r={3}
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      />
    </svg>
  );
}

// Mini barra de distribuição
interface DistributionBarProps {
  segments: { value: number; color: string; label?: string }[];
  height?: number;
  showLabels?: boolean;
  className?: string;
}

export function DistributionBar({
  segments,
  height = 8,
  showLabels = false,
  className,
}: DistributionBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="w-full flex rounded-full overflow-hidden"
        style={{ height }}
      >
        {segments.map((segment, i) => {
          const width = (segment.value / total) * 100;
          return (
            <motion.div
              key={i}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ backgroundColor: segment.color }}
              initial={{ width: 0 }}
              animate={{ width: `${width}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          );
        })}
      </div>
      
      {showLabels && (
        <div className="flex items-center gap-4 flex-wrap">
          {segments.map((segment, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-muted-foreground">
                {segment.label || `${((segment.value / total) * 100).toFixed(0)}%`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Stat card compacto
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: number;
  changeLabel?: string;
  sparklineData?: number[];
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  change,
  changeLabel,
  sparklineData,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "p-4 rounded-lg border bg-card",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold mt-1">
            {typeof value === "number" ? (
              <AnimatedNumber value={value} />
            ) : (
              value
            )}
          </p>
        </div>
        {icon && (
          <div className="p-2 rounded-md bg-muted">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        {change !== undefined && (
          <span
            className={cn(
              "text-xs font-medium",
              isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {isPositive ? "+" : ""}{change}%
            {changeLabel && ` ${changeLabel}`}
          </span>
        )}
        {sparklineData && (
          <Sparkline data={sparklineData} width={60} height={20} />
        )}
      </div>
    </motion.div>
  );
}

// Live indicator pulsante
interface LiveIndicatorProps {
  isLive?: boolean;
  label?: string;
  className?: string;
}

export function LiveIndicator({
  isLive = true,
  label = "Ao vivo",
  className,
}: LiveIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            isLive ? "bg-green-500" : "bg-muted"
          )}
        />
      </span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
