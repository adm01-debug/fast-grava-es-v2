import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info, 
  HelpCircle, 
  ExternalLink,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber, formatPercent } from '@/lib/number-utils';

// Alert Card
interface AlertCardProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  type,
  title,
  message,
  action,
  onDismiss,
  className = '',
}) => {
  const config = {
    info: { icon: Info, bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-400' },
    success: { icon: CheckCircle2, bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-400' },
    warning: { icon: AlertTriangle, bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-400' },
    error: { icon: XCircle, bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-400' },
  };

  const { icon: Icon, bg, border, text } = config[type];

  return (
    <Card className={cn(bg, border, 'border', className)}>
      <CardContent className="flex items-start gap-4 pt-4">
        <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', text)} />
        <div className="flex-1 min-w-0">
          <h4 className={cn('font-medium', text)}>{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
          {action && (
            <Button variant="link" size="sm" onClick={action.onClick} className={cn('p-0 h-auto mt-2', text)}>
              {action.label} →
            </Button>
          )}
        </div>
        {onDismiss && (
          <Button variant="ghost" size="icon" onClick={onDismiss} className="shrink-0">
            <XCircle className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Stat Card with trend
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  footer?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel = 'vs período anterior',
  icon: Icon,
  iconColor = 'text-primary',
  footer,
  loading = false,
  className = '',
}) => {
  const TrendIcon = change === undefined ? null : change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const trendColor = change === undefined ? '' : change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold">{typeof value === 'number' ? formatNumber(value) : value}</p>
            )}
          </div>
          {Icon && (
            <div className={cn('p-2 rounded-lg bg-muted', iconColor)}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        {change !== undefined && (
          <div className={cn('flex items-center gap-1 mt-2 text-sm', trendColor)}>
            {TrendIcon && <TrendIcon className="h-4 w-4" />}
            <span>{change > 0 ? '+' : ''}{formatNumber(change, 1)}%</span>
            <span className="text-muted-foreground">{changeLabel}</span>
          </div>
        )}
        {footer && (
          <>
            <Separator className="my-3" />
            {footer}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Progress Card
interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  unit?: string;
  status?: 'on-track' | 'at-risk' | 'behind';
  showPercentage?: boolean;
  className?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  current,
  total,
  unit = '',
  status = 'on-track',
  showPercentage = true,
  className = '',
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  const statusConfig = {
    'on-track': { color: 'bg-green-500', label: 'No prazo', icon: CheckCircle2 },
    'at-risk': { color: 'bg-yellow-500', label: 'Em risco', icon: AlertTriangle },
    'behind': { color: 'bg-red-500', label: 'Atrasado', icon: XCircle },
  };

  const config = statusConfig[status];

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">{title}</h4>
          <Badge variant="secondary" className={cn('text-xs', status === 'on-track' && 'bg-green-100 text-green-700', status === 'at-risk' && 'bg-yellow-100 text-yellow-700', status === 'behind' && 'bg-red-100 text-red-700')}>
            <config.icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="flex items-center justify-between mt-2 text-sm">
          <span className="text-muted-foreground">
            {formatNumber(current)}{unit} de {formatNumber(total)}{unit}
          </span>
          {showPercentage && (
            <span className="font-medium">{formatNumber(percentage, 1)}%</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Feature Card
interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  badge,
  action,
  className = '',
}) => (
  <Card className={cn('hover:shadow-md transition-shadow', className)}>
    <CardContent className="pt-6">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{title}</h4>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          {action && (
            <Button variant="link" size="sm" onClick={action.onClick} className="p-0 h-auto mt-2">
              {action.label} <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Quick Action Card
interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'warning';
  className?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
  variant = 'default',
  className = '',
}) => {
  const variantClasses = {
    default: 'hover:bg-muted',
    primary: 'bg-primary/5 hover:bg-primary/10 border-primary/20',
    warning: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 dark:bg-yellow-950/30 dark:hover:bg-yellow-950/50 dark:border-yellow-800',
  };

  return (
    <Card 
      className={cn('cursor-pointer transition-colors', variantClasses[variant], className)}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn('p-2 rounded-lg', variant === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium">{title}</h4>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Zap className="h-4 w-4 text-muted-foreground" />
      </CardContent>
    </Card>
  );
};

// Info Card with expandable help
interface InfoCardProps {
  title: string;
  value: React.ReactNode;
  help?: string;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  value,
  help,
  className = '',
}) => (
  <Card className={className}>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm text-muted-foreground">{title}</span>
        {help && (
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
        )}
      </div>
      <div className="text-lg font-medium">{value}</div>
    </CardContent>
  </Card>
);
