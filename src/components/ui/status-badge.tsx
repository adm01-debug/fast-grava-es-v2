import { JobStatus } from '@/types/scheduling';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  Target, 
  Calendar, 
  Play, 
  CheckCircle2, 
  Pause, 
  XCircle, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<JobStatus, { 
  label: string; 
  icon: React.ElementType;
  bgClass: string;
  textClass: string;
}> = {
  queue: { 
    label: 'Na Fila', 
    icon: Clock,
    bgClass: 'bg-muted',
    textClass: 'text-muted-foreground',
  },
  ready: { 
    label: 'No Jeito', 
    icon: Target,
    bgClass: 'bg-status-ready',
    textClass: 'text-status-ready-foreground',
  },
  scheduled: { 
    label: 'Agendado', 
    icon: Calendar,
    bgClass: 'bg-status-scheduled',
    textClass: 'text-status-scheduled-foreground',
  },
  production: { 
    label: 'Em Produção', 
    icon: Play,
    bgClass: 'bg-status-production',
    textClass: 'text-status-production-foreground',
  },
  finished: { 
    label: 'Finalizado', 
    icon: CheckCircle2,
    bgClass: 'bg-status-finished',
    textClass: 'text-status-finished-foreground',
  },
  paused: { 
    label: 'Pausado', 
    icon: Pause,
    bgClass: 'bg-status-paused',
    textClass: 'text-status-paused-foreground',
  },
  cancelled: { 
    label: 'Cancelado', 
    icon: XCircle,
    bgClass: 'bg-status-cancelled',
    textClass: 'text-status-cancelled-foreground',
  },
  delayed: { 
    label: 'Atrasado', 
    icon: AlertTriangle,
    bgClass: 'bg-status-delayed',
    textClass: 'text-status-delayed-foreground',
  },
  rework: { 
    label: 'Retrabalho', 
    icon: RotateCcw,
    bgClass: 'bg-status-rework',
    textClass: 'text-status-rework-foreground',
  },
};

export function StatusBadge({ status, size = 'md', showIcon = true, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        config.bgClass,
        config.textClass,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}
