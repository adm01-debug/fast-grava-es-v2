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
      glow: '',
    },
    primary: {
      iconBg: 'gradient-primary',
      iconColor: 'text-primary-foreground',
      glow: 'glow-primary',
    },
    success: {
      iconBg: 'bg-accent',
      iconColor: 'text-accent-foreground',
      glow: '',
    },
    warning: {
      iconBg: 'bg-status-delayed',
      iconColor: 'text-status-delayed-foreground',
      glow: '',
    },
    danger: {
      iconBg: 'bg-destructive',
      iconColor: 'text-destructive-foreground',
      glow: '',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card className={cn(
      'p-5 hover:border-primary/30 transition-all duration-300 animate-fade-in glass-card',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-display font-bold tracking-tight text-foreground">{value}</p>
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
          styles.iconBg,
          styles.glow
        )}>
          <Icon className={cn('w-6 h-6', styles.iconColor)} />
        </div>
      </div>
    </Card>
  );
}
