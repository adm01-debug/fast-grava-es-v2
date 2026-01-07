import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowRight,
  MoreHorizontal,
  RefreshCw,
  Maximize2,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber, formatCompact, formatPercent } from '@/lib/number-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// KPI Widget
interface KPIWidgetProps {
  title: string;
  value: number | string;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percent' | 'compact';
  icon?: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  target?: number;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const KPIWidget: React.FC<KPIWidgetProps> = ({
  title,
  value,
  previousValue,
  format = 'number',
  icon: Icon,
  iconColor = 'text-primary',
  trend,
  trendValue,
  target,
  loading = false,
  onClick,
  className = '',
}) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    switch (format) {
      case 'currency': return `R$ ${formatNumber(val, 2)}`;
      case 'percent': return formatPercent(val);
      case 'compact': return formatCompact(val);
      default: return formatNumber(val);
    }
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';

  const progress = target && typeof value === 'number' ? (value / target) * 100 : null;

  return (
    <Card 
      className={cn(
        'transition-all hover:shadow-md',
        onClick && 'cursor-pointer hover:border-primary/50',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold mt-1">{formatValue(value)}</p>
              </div>
              {Icon && (
                <div className={cn('p-2 rounded-lg bg-muted', iconColor)}>
                  <Icon className="h-5 w-5" />
                </div>
              )}
            </div>
            
            {(trend || trendValue !== undefined) && (
              <div className={cn('flex items-center gap-1 mt-2 text-sm', trendColor)}>
                <TrendIcon className="h-4 w-4" />
                {trendValue !== undefined && (
                  <span>{trendValue > 0 ? '+' : ''}{formatNumber(trendValue, 1)}%</span>
                )}
              </div>
            )}

            {progress !== null && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Meta: {formatValue(target!)}</span>
                  <span>{formatNumber(progress, 0)}%</span>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-1.5" />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Chart Widget Container
interface ChartWidgetProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onRefresh?: () => void;
  onExpand?: () => void;
  loading?: boolean;
  className?: string;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  subtitle,
  children,
  actions,
  onRefresh,
  onExpand,
  loading = false,
  className = '',
}) => (
  <Card className={cn('overflow-hidden', className)}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-1">
        {actions}
        {onRefresh && (
          <Button size="icon" variant="ghost" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        )}
        {onExpand && (
          <Button size="icon" variant="ghost" onClick={onExpand}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Exportar PNG</DropdownMenuItem>
            <DropdownMenuItem>Exportar CSV</DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        children
      )}
    </CardContent>
  </Card>
);

// List Widget
interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  value?: string | number;
  badge?: { label: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' };
  icon?: LucideIcon;
  onClick?: () => void;
}

interface ListWidgetProps {
  title: string;
  items: ListItem[];
  emptyMessage?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
  loading?: boolean;
  className?: string;
}

export const ListWidget: React.FC<ListWidgetProps> = ({
  title,
  items,
  emptyMessage = 'Nenhum item',
  showViewAll = true,
  onViewAll,
  loading = false,
  className = '',
}) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-base font-medium">{title}</CardTitle>
      {showViewAll && onViewAll && (
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          Ver todos <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 bg-muted animate-pulse rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg',
                  item.onClick && 'cursor-pointer hover:bg-muted/50 transition-colors'
                )}
                onClick={item.onClick}
              >
                {ItemIcon && (
                  <div className="p-2 rounded-lg bg-muted">
                    <ItemIcon className="h-4 w-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                  )}
                </div>
                {item.value !== undefined && (
                  <span className="text-sm font-medium">{item.value}</span>
                )}
                {item.badge && (
                  <Badge variant={item.badge.variant || 'secondary'}>
                    {item.badge.label}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      )}
    </CardContent>
  </Card>
);

// Activity Widget
interface Activity {
  id: string;
  action: string;
  subject: string;
  timestamp: Date;
  user?: string;
  type?: 'create' | 'update' | 'delete' | 'info';
}

interface ActivityWidgetProps {
  title?: string;
  activities: Activity[];
  loading?: boolean;
  className?: string;
}

export const ActivityWidget: React.FC<ActivityWidgetProps> = ({
  title = 'Atividade Recente',
  activities,
  loading = false,
  className = '',
}) => {
  const typeColors = {
    create: 'bg-green-500',
    update: 'bg-blue-500',
    delete: 'bg-red-500',
    info: 'bg-gray-500',
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-2 w-2 mt-2 bg-muted animate-pulse rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-1 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 relative">
                  <div className={cn(
                    'h-2.5 w-2.5 rounded-full mt-1.5 ring-4 ring-background',
                    typeColors[activity.type || 'info']
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.action}</span>{' '}
                      <span className="text-muted-foreground">{activity.subject}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user && `${activity.user} · `}
                      {new Date(activity.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Quick Stats Row
interface QuickStat {
  label: string;
  value: string | number;
  change?: number;
}

interface QuickStatsProps {
  stats: QuickStat[];
  className?: string;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats, className = '' }) => (
  <div className={cn('grid gap-4', `grid-cols-${Math.min(stats.length, 4)}`, className)}>
    {stats.map((stat, i) => (
      <div key={i} className="p-4 rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground">{stat.label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{stat.value}</span>
          {stat.change !== undefined && (
            <span className={cn(
              'text-sm',
              stat.change > 0 ? 'text-green-500' : stat.change < 0 ? 'text-red-500' : 'text-muted-foreground'
            )}>
              {stat.change > 0 ? '+' : ''}{stat.change}%
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
);
