import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function BIStatCard({ title, value, subtitle, icon: Icon, trend, trendValue, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'border-border/40 hover:shadow-glow-primary/10',
    success: 'border-emerald-500/30 bg-emerald-500/5 hover:shadow-glow-success',
    warning: 'border-amber-500/30 bg-amber-500/5 hover:shadow-glow-primary',
    danger: 'border-rose-500/30 bg-rose-500/5 hover:shadow-glow-primary',
  };

  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-primary' : 'text-muted-foreground';

    <Card className={cn(
      variantStyles[variant],
      "bg-card/40 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden group hover:shadow-glow-primary/10 transition-all duration-500 ring-1 ring-white/5",
      "hover:-translate-y-1"
    )}>
      <CardContent className="p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 min-w-0 flex-1">
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">{title}</p>
            <p className="text-4xl font-black font-display tracking-tight text-foreground leading-none">{value}</p>
            {subtitle && <p className="text-sm font-medium text-muted-foreground/60">{subtitle}</p>}
            {trend && trendValue && (
              <div className={cn("flex items-center gap-1 text-sm font-medium", trendColor)}>
                <TrendIcon className="h-4 w-4" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm group-hover:scale-110 transition-all duration-500">
            <Icon className="h-7 w-7 text-primary group-hover:rotate-6 transition-transform duration-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
