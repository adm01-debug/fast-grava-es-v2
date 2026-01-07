import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// #42 - Stat Cards Reutilizáveis

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  onClick
}: StatCardProps) {
  return (
    <Card 
      className={cn(
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:border-primary/50',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span className={cn(
                'text-xs font-medium flex items-center gap-0.5',
                trend.isPositive === true && 'text-green-600',
                trend.isPositive === false && 'text-red-600',
                trend.isPositive === undefined && 'text-muted-foreground'
              )}>
                {trend.isPositive === true && <TrendingUp className="h-3 w-3" />}
                {trend.isPositive === false && <TrendingDown className="h-3 w-3" />}
                {trend.isPositive === undefined && <Minus className="h-3 w-3" />}
                {trend.value > 0 && '+'}{trend.value}%
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact stat card
export function CompactStatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  className
}: {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg bg-card border',
      className
    )}>
      {icon && (
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
      {change !== undefined && (
        <div className={cn(
          'flex items-center gap-0.5 text-xs font-medium',
          isPositive ? 'text-green-600' : 'text-red-600'
        )}>
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {Math.abs(change)}%
        </div>
      )}
    </div>
  );
}

// Large stat with progress
export function ProgressStatCard({
  title,
  value,
  max,
  unit = '',
  description,
  className
}: {
  title: string;
  value: number;
  max: number;
  unit?: string;
  description?: string;
  className?: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-sm text-muted-foreground">/ {max} {unit}</span>
        </div>
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Stats grid
export function StatsGrid({
  stats,
  columns = 4,
  className
}: {
  stats: StatCardProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

// Comparison stat card
export function ComparisonStatCard({
  title,
  current,
  previous,
  currentLabel = 'Atual',
  previousLabel = 'Anterior',
  className
}: {
  title: string;
  current: number;
  previous: number;
  currentLabel?: string;
  previousLabel?: string;
  className?: string;
}) {
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{currentLabel}</p>
            <p className="text-2xl font-bold">{current.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{previousLabel}</p>
            <p className="text-lg text-muted-foreground">{previous.toLocaleString()}</p>
          </div>
        </div>
        <div className={cn(
          'flex items-center gap-1 mt-2 text-sm font-medium',
          isPositive ? 'text-green-600' : 'text-red-600'
        )}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {isPositive && '+'}{change.toFixed(1)}% vs período anterior
        </div>
      </CardContent>
    </Card>
  );
}

// Mini stat inline
export function InlineStat({
  label,
  value,
  icon,
  className
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
