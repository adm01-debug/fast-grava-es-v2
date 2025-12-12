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
  variant?: 'blue' | 'cyan' | 'green' | 'purple' | 'orange' | 'yellow';
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'blue',
  className 
}: StatsCardProps) {
  // Cores vibrantes como na referência Task Gifts
  const variantStyles = {
    blue: {
      iconBg: 'bg-[hsl(210,100%,50%)]/20',
      iconColor: 'text-[hsl(210,100%,60%)]',
      borderColor: 'border-[hsl(210,100%,50%)]/20',
      hoverBorder: 'hover:border-[hsl(210,100%,50%)]/40',
    },
    cyan: {
      iconBg: 'bg-[hsl(180,100%,45%)]/20',
      iconColor: 'text-[hsl(180,100%,55%)]',
      borderColor: 'border-[hsl(180,100%,45%)]/20',
      hoverBorder: 'hover:border-[hsl(180,100%,45%)]/40',
    },
    green: {
      iconBg: 'bg-[hsl(145,80%,45%)]/20',
      iconColor: 'text-[hsl(145,80%,55%)]',
      borderColor: 'border-[hsl(145,80%,45%)]/20',
      hoverBorder: 'hover:border-[hsl(145,80%,45%)]/40',
    },
    purple: {
      iconBg: 'bg-[hsl(280,85%,60%)]/20',
      iconColor: 'text-[hsl(280,85%,65%)]',
      borderColor: 'border-[hsl(280,85%,60%)]/20',
      hoverBorder: 'hover:border-[hsl(280,85%,60%)]/40',
    },
    orange: {
      iconBg: 'bg-[hsl(24,100%,50%)]/20',
      iconColor: 'text-[hsl(24,100%,60%)]',
      borderColor: 'border-[hsl(24,100%,50%)]/20',
      hoverBorder: 'hover:border-[hsl(24,100%,50%)]/40',
    },
    yellow: {
      iconBg: 'bg-[hsl(48,100%,50%)]/20',
      iconColor: 'text-[hsl(48,100%,60%)]',
      borderColor: 'border-[hsl(48,100%,50%)]/20',
      hoverBorder: 'hover:border-[hsl(48,100%,50%)]/40',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card className={cn(
      'p-6 bg-card rounded-xl animate-fade-in',
      'opacity-0 [animation-fill-mode:forwards]',
      'border transition-all duration-300 hover:-translate-y-0.5',
      styles.borderColor,
      styles.hoverBorder,
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-4xl font-display font-bold tracking-tight text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className={cn(
                'text-sm font-semibold',
                trend.isPositive ? 'text-[hsl(145,80%,50%)]' : 'text-destructive'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs. ontem</span>
            </div>
          )}
        </div>
        <div className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-105',
          styles.iconBg
        )}>
          <Icon className={cn('w-7 h-7', styles.iconColor)} />
        </div>
      </div>
    </Card>
  );
}
