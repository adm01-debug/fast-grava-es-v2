import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Loader2, 
  Pause, 
  Play, 
  Ban,
  AlertTriangle,
  Info,
  Zap,
  Calendar,
  Timer
} from 'lucide-react';

// Status type definitions
export type StatusType = 
  | 'success' | 'warning' | 'error' | 'info' 
  | 'pending' | 'processing' | 'completed' | 'cancelled' | 'paused'
  | 'active' | 'inactive' | 'draft' | 'scheduled'
  | 'high' | 'medium' | 'low' | 'critical' | 'urgent';

interface StatusConfig {
  label: string;
  icon: React.ElementType;
  className: string;
  animate?: boolean;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  // State statuses
  success: { label: 'Sucesso', icon: CheckCircle, className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  warning: { label: 'Atenção', icon: AlertTriangle, className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  error: { label: 'Erro', icon: XCircle, className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  info: { label: 'Info', icon: Info, className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  
  // Process statuses
  pending: { label: 'Pendente', icon: Clock, className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  processing: { label: 'Processando', icon: Loader2, className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', animate: true },
  completed: { label: 'Concluído', icon: CheckCircle, className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelado', icon: Ban, className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },
  paused: { label: 'Pausado', icon: Pause, className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  
  // Activity statuses
  active: { label: 'Ativo', icon: Play, className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  inactive: { label: 'Inativo', icon: Pause, className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },
  draft: { label: 'Rascunho', icon: Clock, className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  scheduled: { label: 'Agendado', icon: Calendar, className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  
  // Priority statuses
  high: { label: 'Alta', icon: AlertCircle, className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  medium: { label: 'Média', icon: Timer, className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  low: { label: 'Baixa', icon: Info, className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  critical: { label: 'Crítico', icon: AlertCircle, className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  urgent: { label: 'Urgente', icon: Zap, className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  showIcon = true,
  size = 'md',
  className = '',
  pulse = false,
}) => {
  const config = statusConfigs[status];
  if (!config) return null;

  const Icon = config.icon;
  const displayLabel = label || config.label;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        'inline-flex items-center font-medium border-0',
        config.className,
        sizeClasses[size],
        pulse && 'animate-pulse',
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(
          iconSizes[size],
          config.animate && 'animate-spin'
        )} />
      )}
      {displayLabel}
    </Badge>
  );
};

// Job-specific status badge
export type JobStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'paused' | 'cancelled';

const jobStatusMap: Record<JobStatus, StatusType> = {
  pending: 'pending',
  scheduled: 'scheduled',
  in_progress: 'processing',
  completed: 'completed',
  paused: 'paused',
  cancelled: 'cancelled',
};

const jobStatusLabels: Record<JobStatus, string> = {
  pending: 'Pendente',
  scheduled: 'Agendado',
  in_progress: 'Em Produção',
  completed: 'Concluído',
  paused: 'Pausado',
  cancelled: 'Cancelado',
};

interface JobStatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  return (
    <StatusBadge
      status={jobStatusMap[status]}
      label={jobStatusLabels[status]}
      size={size}
      showIcon={showIcon}
      className={className}
    />
  );
};

// Priority badge
export type Priority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

const priorityLabels: Record<Priority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
  critical: 'Crítica',
};

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  return (
    <StatusBadge
      status={priority}
      label={priorityLabels[priority]}
      size={size}
      showIcon={showIcon}
      className={className}
    />
  );
};

// Online/Offline indicator
interface OnlineIndicatorProps {
  isOnline: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  isOnline,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  const dotSizes = { sm: 'h-2 w-2', md: 'h-2.5 w-2.5', lg: 'h-3 w-3' };
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'rounded-full',
          dotSizes[size],
          isOnline ? 'bg-green-500' : 'bg-gray-400',
          isOnline && 'animate-pulse'
        )}
      />
      {showLabel && (
        <span className={cn(
          textSizes[size],
          isOnline ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
        )}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </span>
  );
};

// Severity indicator
interface SeverityIndicatorProps {
  severity: 'info' | 'warning' | 'error' | 'critical';
  label?: string;
  className?: string;
}

export const SeverityIndicator: React.FC<SeverityIndicatorProps> = ({
  severity,
  label,
  className = '',
}) => {
  const severityConfig = {
    info: { color: 'bg-blue-500', label: 'Informação' },
    warning: { color: 'bg-yellow-500', label: 'Atenção' },
    error: { color: 'bg-orange-500', label: 'Erro' },
    critical: { color: 'bg-red-500', label: 'Crítico' },
  };

  const config = severityConfig[severity];

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn('h-2.5 w-2.5 rounded-full', config.color)} />
      <span className="text-sm">{label || config.label}</span>
    </span>
  );
};
