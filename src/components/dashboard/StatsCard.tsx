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
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: StatsCardProps) {
  const variantStyles = {
    default: {
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
    },
    primary: {
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    success: {
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    warning: {
      iconBg: 'bg-status-delayed/10',
      iconColor: 'text-status-delayed',
    },
    danger: {
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card className={cn(
      'p-5 hover:shadow-lg transition-shadow duration-300 animate-fade-in',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-display font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1">
              <span className={cn(
                'text-sm font-medium',
                trend.isPositive ? 'text-accent' : 'text-destructive'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs. ontem</span>
            </div>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          styles.iconBg
        )}>
          <Icon className={cn('w-6 h-6', styles.iconColor)} />
        </div>
      </div>
    </Card>
  );
}
