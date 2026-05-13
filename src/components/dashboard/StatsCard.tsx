import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

/**
 * Props for the StatsCard component
 */
export interface StatsCardProps {
  /** The title of the statistic */
  title: string;
  /** The main value to display */
  value: string | number;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Icon from lucide-react */
  icon: LucideIcon;
  /** Optional trend data (percentage and direction) */
  trend?: {
    value: number;
    isPositive: boolean;
  };
  /** Visual variant affecting colors and glow effects */
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'accent' | 'muted';
  /** Additional CSS classes */
  className?: string;
  /** Whether to use a more compact layout */
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
  const { t } = useTranslation();
  const styles = useMemo(() => variantStyles[variant], [variant]);

  if (compact) {
    return (
      <Card className={cn(
        'group p-3.5 glass-card card-shine transition-all duration-300',
        'hover:-translate-y-0.5 hover:shadow-md',
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
      'group p-5 glass-card card-shine transition-all duration-300',
      'hover:-translate-y-1 hover:shadow-lg',
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
              <span className="text-[11px] text-muted-foreground">{t('common.vsYesterday', 'vs. ontem')}</span>
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
