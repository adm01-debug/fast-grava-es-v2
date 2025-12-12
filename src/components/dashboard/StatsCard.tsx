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
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
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
      iconBg: 'bg-muted/50',
      iconColor: 'text-muted-foreground',
    },
    primary: {
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary',
    },
    secondary: {
      iconBg: 'bg-accent/20',
      iconColor: 'text-accent',
    },
    success: {
      iconBg: 'bg-status-finished/20',
      iconColor: 'text-status-finished',
    },
    warning: {
      iconBg: 'bg-status-rework/20',
      iconColor: 'text-status-rework',
    },
    danger: {
      iconBg: 'bg-destructive/20',
      iconColor: 'text-destructive',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card className={cn(
      'p-6 glass-card card-interactive animate-fade-in',
      'opacity-0 [animation-fill-mode:forwards]',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-4xl font-display font-bold tracking-tight text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className={cn(
                'text-sm font-semibold',
                trend.isPositive ? 'text-status-finished' : 'text-destructive'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs. ontem</span>
            </div>
          )}
        </div>
        <div className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-110',
          styles.iconBg
        )}>
          <Icon className={cn('w-7 h-7', styles.iconColor)} />
        </div>
      </div>
    </Card>
  );
}
