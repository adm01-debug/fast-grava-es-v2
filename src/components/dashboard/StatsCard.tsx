import { memo, useMemo } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export interface StatsCardProps {
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
  compact?: boolean;
}

const variantStyles = {
  primary: {
    iconBg: 'bg-primary/12 dark:bg-primary/15',
    iconColor: 'text-primary',
    accentColor: 'text-primary',
    glowClass: 'group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)]',
  },
  success: {
    iconBg: 'bg-success/12 dark:bg-success/15',
    iconColor: 'text-success',
    accentColor: 'text-success',
    glowClass: 'group-hover:shadow-[0_0_20px_hsl(var(--success)/0.15)]',
  },
  warning: {
    iconBg: 'bg-warning/12 dark:bg-warning/15',
    iconColor: 'text-warning',
    accentColor: 'text-warning',
    glowClass: 'group-hover:shadow-[0_0_20px_hsl(var(--warning)/0.15)]',
  },
  info: {
    iconBg: 'bg-info/12 dark:bg-info/15',
    iconColor: 'text-info',
    accentColor: 'text-info',
    glowClass: 'group-hover:shadow-[0_0_20px_hsl(var(--info)/0.15)]',
  },
  accent: {
    iconBg: 'bg-accent',
    iconColor: 'text-accent-foreground',
    accentColor: 'text-accent-foreground',
    glowClass: '',
  },
  muted: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    accentColor: 'text-muted-foreground',
    glowClass: '',
  },
};

function StatsCardComponent({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'primary',
  className,
  compact = false
}: StatsCardProps) {
  const styles = useMemo(() => variantStyles[variant], [variant]);

  if (compact) {
    return (
      <Card className={cn(
        'group p-4 bg-card/40 backdrop-blur-md border-border/40 shadow-lg rounded-2xl overflow-hidden transition-all duration-300 ring-1 ring-white/5',
        'hover:-translate-y-0.5 hover:bg-card/60',
        styles.glowClass,
        className
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110',
            styles.iconBg
          )}>
            <Icon className={cn('w-[18px] h-[18px]', styles.iconColor)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-muted-foreground truncate uppercase tracking-wider">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight text-foreground font-display">
                {value}
              </p>
              {subtitle && (
                <p className="text-[11px] text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'group p-6 bg-card/40 backdrop-blur-md border-border/40 shadow-xl rounded-3xl overflow-hidden group hover:shadow-glow-primary/10 transition-all duration-500 ring-1 ring-white/5',
      'hover:-translate-y-1',
      styles.glowClass,
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground truncate uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight text-foreground font-display">
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
                'text-sm font-semibold',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-[11px] text-muted-foreground">vs. ontem</span>
            </div>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
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
