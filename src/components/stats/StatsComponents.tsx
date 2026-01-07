import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Stat simples inline
interface InlineStatProps {
  label: string;
  value: string | number;
  trend?: { value: number; isPositive?: boolean };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InlineStat({ label, value, trend, size = 'md', className }: InlineStatProps) {
  const sizeClasses = {
    sm: { label: 'text-xs', value: 'text-lg' },
    md: { label: 'text-sm', value: 'text-2xl' },
    lg: { label: 'text-base', value: 'text-4xl' }
  };

  return (
    <div className={className}>
      <p className={cn('text-muted-foreground', sizeClasses[size].label)}>{label}</p>
      <div className="flex items-baseline gap-2">
        <span className={cn('font-bold', sizeClasses[size].value)}>{value}</span>
        {trend && (
          <span className={cn(
            'text-sm flex items-center',
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {trend.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}

// Grid de stats
interface StatItem {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  variant?: 'cards' | 'simple' | 'bordered';
  className?: string;
}

export function StatsGrid({ stats, columns = 4, variant = 'cards', className }: StatsGridProps) {
  const colorClasses = {
    default: 'text-foreground',
    primary: 'text-primary',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600'
  };

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4'
  };

  if (variant === 'simple') {
    return (
      <div className={cn('grid gap-6', gridCols[columns], className)}>
        {stats.map((stat, index) => (
          <div key={index}>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={cn('text-2xl font-bold', colorClasses[stat.color || 'default'])}>
              {stat.value}
            </p>
            {stat.change !== undefined && (
              <p className={cn('text-sm', stat.change >= 0 ? 'text-green-600' : 'text-red-600')}>
                {stat.change >= 0 ? '+' : ''}{stat.change}%
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'bordered') {
    return (
      <div className={cn('grid divide-x divide-border', gridCols[columns], className)}>
        {stats.map((stat, index) => (
          <div key={index} className="px-4 first:pl-0 last:pr-0">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={cn('text-2xl font-bold', colorClasses[stat.color || 'default'])}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={cn('text-2xl font-bold', colorClasses[stat.color || 'default'])}>
                  {stat.value}
                </p>
                {stat.change !== undefined && (
                  <div className={cn(
                    'flex items-center text-sm mt-1',
                    stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {stat.change >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span>{Math.abs(stat.change)}%</span>
                  </div>
                )}
              </div>
              {stat.icon && (
                <div className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center',
                  stat.color === 'primary' ? 'bg-primary/10 text-primary' :
                  stat.color === 'success' ? 'bg-green-100 text-green-600' :
                  stat.color === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  stat.color === 'danger' ? 'bg-red-100 text-red-600' :
                  'bg-muted'
                )}>
                  {stat.icon}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Barra de progresso com stat
interface ProgressStatProps {
  label: string;
  value: number;
  max: number;
  showPercentage?: boolean;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressStat({
  label,
  value,
  max,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  className
}: ProgressStatProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    default: 'bg-foreground',
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {showPercentage ? `${percentage.toFixed(0)}%` : `${value}/${max}`}
        </span>
      </div>
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Comparação de stats
interface ComparisonStatProps {
  label: string;
  current: { value: number; label?: string };
  previous: { value: number; label?: string };
  format?: (value: number) => string;
  className?: string;
}

export function ComparisonStat({
  label,
  current,
  previous,
  format = (v) => v.toString(),
  className
}: ComparisonStatProps) {
  const diff = current.value - previous.value;
  const percentChange = previous.value !== 0 
    ? ((diff / previous.value) * 100).toFixed(1) 
    : '0';
  const isPositive = diff >= 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold">{format(current.value)}</p>
            {current.label && (
              <p className="text-xs text-muted-foreground">{current.label}</p>
            )}
          </div>
          <div className="text-right">
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium',
              isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {percentChange}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs {format(previous.value)} {previous.label && `(${previous.label})`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Donut stat
interface DonutStatProps {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function DonutStat({
  value,
  max,
  label,
  sublabel,
  size = 'md',
  color = 'hsl(var(--primary))',
  className
}: DonutStatProps) {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: { svg: 'w-20 h-20', text: 'text-lg', sub: 'text-xs' },
    md: { svg: 'w-32 h-32', text: 'text-2xl', sub: 'text-sm' },
    lg: { svg: 'w-40 h-40', text: 'text-3xl', sub: 'text-base' }
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative">
        <svg className={sizeClasses[size].svg} viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', sizeClasses[size].text)}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <p className={cn('font-medium mt-2', sizeClasses[size].sub)}>{label}</p>
      {sublabel && (
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      )}
    </div>
  );
}

// Mini sparkline
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = 'hsl(var(--primary))',
  showDots = false,
  className
}: SparklineProps) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className={className}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {showDots && data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="2"
            fill={color}
          />
        );
      })}
    </svg>
  );
}
