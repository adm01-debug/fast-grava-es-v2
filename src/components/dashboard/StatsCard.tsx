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
  // Cores vibrantes com glow effects para gaming
  const variantStyles = {
    blue: {
      iconBg: 'bg-[hsl(210,100%,55%)]/15 dark:bg-[hsl(210,100%,55%)]/20',
      iconColor: 'text-[hsl(210,100%,55%)] dark:text-[hsl(210,100%,65%)]',
      borderColor: 'border-[hsl(210,100%,55%)]/10 dark:border-[hsl(210,100%,55%)]/20',
      hoverBorder: 'hover:border-[hsl(210,100%,55%)]/30 dark:hover:border-[hsl(210,100%,55%)]/50',
      hoverGlow: 'dark:hover:shadow-[0_8px_32px_-8px_hsl(210,100%,55%,0.3)]',
    },
    cyan: {
      iconBg: 'bg-[hsl(180,100%,45%)]/15 dark:bg-[hsl(180,100%,45%)]/20',
      iconColor: 'text-[hsl(180,100%,45%)] dark:text-[hsl(180,100%,55%)]',
      borderColor: 'border-[hsl(180,100%,45%)]/10 dark:border-[hsl(180,100%,45%)]/20',
      hoverBorder: 'hover:border-[hsl(180,100%,45%)]/30 dark:hover:border-[hsl(180,100%,45%)]/50',
      hoverGlow: 'dark:hover:shadow-[0_8px_32px_-8px_hsl(180,100%,45%,0.3)]',
    },
    green: {
      iconBg: 'bg-[hsl(142,70%,45%)]/15 dark:bg-[hsl(142,70%,50%)]/20',
      iconColor: 'text-[hsl(142,70%,45%)] dark:text-[hsl(142,70%,55%)]',
      borderColor: 'border-[hsl(142,70%,45%)]/10 dark:border-[hsl(142,70%,50%)]/20',
      hoverBorder: 'hover:border-[hsl(142,70%,45%)]/30 dark:hover:border-[hsl(142,70%,50%)]/50',
      hoverGlow: 'dark:hover:shadow-[0_8px_32px_-8px_hsl(142,70%,50%,0.3)]',
    },
    purple: {
      iconBg: 'bg-[hsl(280,80%,55%)]/15 dark:bg-[hsl(280,80%,60%)]/20',
      iconColor: 'text-[hsl(280,80%,55%)] dark:text-[hsl(280,80%,65%)]',
      borderColor: 'border-[hsl(280,80%,55%)]/10 dark:border-[hsl(280,80%,60%)]/20',
      hoverBorder: 'hover:border-[hsl(280,80%,55%)]/30 dark:hover:border-[hsl(280,80%,60%)]/50',
      hoverGlow: 'dark:hover:shadow-[0_8px_32px_-8px_hsl(280,80%,60%,0.3)]',
    },
    orange: {
      iconBg: 'bg-[hsl(24,95%,50%)]/15 dark:bg-[hsl(24,95%,55%)]/20',
      iconColor: 'text-[hsl(24,95%,50%)] dark:text-[hsl(24,95%,60%)]',
      borderColor: 'border-[hsl(24,95%,50%)]/10 dark:border-[hsl(24,95%,55%)]/20',
      hoverBorder: 'hover:border-[hsl(24,95%,50%)]/30 dark:hover:border-[hsl(24,95%,55%)]/50',
      hoverGlow: 'dark:hover:shadow-[0_8px_32px_-8px_hsl(24,95%,55%,0.3)]',
    },
    yellow: {
      iconBg: 'bg-[hsl(45,100%,50%)]/15 dark:bg-[hsl(45,100%,55%)]/20',
      iconColor: 'text-[hsl(45,100%,45%)] dark:text-[hsl(45,100%,60%)]',
      borderColor: 'border-[hsl(45,100%,50%)]/10 dark:border-[hsl(45,100%,55%)]/20',
      hoverBorder: 'hover:border-[hsl(45,100%,50%)]/30 dark:hover:border-[hsl(45,100%,55%)]/50',
      hoverGlow: 'dark:hover:shadow-[0_8px_32px_-8px_hsl(45,100%,55%,0.3)]',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card className={cn(
      'p-6 rounded-xl animate-fade-in',
      'opacity-0 [animation-fill-mode:forwards]',
      'border transition-all duration-300 hover:-translate-y-1',
      'dark:bg-card/60 dark:backdrop-blur-xl',
      styles.borderColor,
      styles.hoverBorder,
      styles.hoverGlow,
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
