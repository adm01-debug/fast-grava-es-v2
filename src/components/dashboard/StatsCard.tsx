import { memo, useMemo } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'accent' | 'muted';
  className?: string;
}

const variantStyles = {
  primary: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    accentColor: 'text-primary',
  },
  success: {
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    accentColor: 'text-success',
  },
  warning: {
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    accentColor: 'text-warning',
  },
  info: {
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
    accentColor: 'text-info',
  },
  accent: {
    iconBg: 'bg-accent',
    iconColor: 'text-accent-foreground',
    accentColor: 'text-accent-foreground',
  },
  muted: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    accentColor: 'text-muted-foreground',
  },
};

function StatsCardComponent({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'primary',
  className 
}: StatsCardProps) {
  const styles = useMemo(() => variantStyles[variant], [variant]);

  return (
    <Card className={cn(
      'p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground truncate">
            {title}
          </p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className={cn(
                'text-sm font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs. ontem</span>
            </div>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
          styles.iconBg
        )}>
          <Icon className={cn('w-6 h-6', styles.iconColor)} />
        </div>
      </div>
    </Card>
  );
}

export const StatsCard = memo(StatsCardComponent);
StatsCard.displayName = 'StatsCard';
