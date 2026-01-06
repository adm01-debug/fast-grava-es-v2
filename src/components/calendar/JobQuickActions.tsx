import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  MoreHorizontal, 
  Clock,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { JobStatus } from '@/types/scheduling';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface JobQuickActionsProps {
  jobId: string;
  currentStatus: JobStatus;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
  isExpanded?: boolean;
  className?: string;
}

interface ActionButton {
  status: JobStatus;
  icon: typeof Play;
  label: string;
  color: string;
  bgColor: string;
}

const getAvailableActions = (currentStatus: JobStatus): ActionButton[] => {
  switch (currentStatus) {
    case 'queue':
    case 'ready':
    case 'scheduled':
      return [
        { status: 'production', icon: Play, label: 'Iniciar', color: 'text-success', bgColor: 'bg-success/10 hover:bg-success/20' },
      ];
    case 'production':
      return [
        { status: 'paused', icon: Pause, label: 'Pausar', color: 'text-warning', bgColor: 'bg-warning/10 hover:bg-warning/20' },
        { status: 'finished', icon: CheckCircle, label: 'Finalizar', color: 'text-success', bgColor: 'bg-success/10 hover:bg-success/20' },
      ];
    case 'paused':
      return [
        { status: 'production', icon: Play, label: 'Retomar', color: 'text-success', bgColor: 'bg-success/10 hover:bg-success/20' },
        { status: 'finished', icon: CheckCircle, label: 'Finalizar', color: 'text-success', bgColor: 'bg-success/10 hover:bg-success/20' },
      ];
    case 'delayed':
      return [
        { status: 'production', icon: Play, label: 'Iniciar', color: 'text-success', bgColor: 'bg-success/10 hover:bg-success/20' },
      ];
    default:
      return [];
  }
};

const moreActions: Array<{ status: JobStatus; icon: typeof Clock; label: string; color: string }> = [
  { status: 'delayed', icon: AlertTriangle, label: 'Marcar como Atrasado', color: 'text-destructive' },
  { status: 'rework', icon: Clock, label: 'Enviar para Retrabalho', color: 'text-warning' },
  { status: 'cancelled', icon: XCircle, label: 'Cancelar Job', color: 'text-destructive' },
];

export const JobQuickActions = memo(function JobQuickActions({
  jobId,
  currentStatus,
  onStatusChange,
  isExpanded = false,
  className,
}: JobQuickActionsProps) {
  const [isLoading, setIsLoading] = useState<JobStatus | null>(null);
  const availableActions = getAvailableActions(currentStatus);

  const handleAction = useCallback(async (newStatus: JobStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(newStatus);
    try {
      await onStatusChange(jobId, newStatus);
    } finally {
      setIsLoading(null);
    }
  }, [jobId, onStatusChange]);

  // Don't show actions for finished or cancelled jobs
  if (currentStatus === 'finished' || currentStatus === 'cancelled') {
    return null;
  }

  return (
    <motion.div
      initial={false}
      animate={{ opacity: isExpanded ? 1 : 0.7 }}
      className={cn('flex items-center gap-1', className)}
      onClick={(e) => e.stopPropagation()}
    >
      <AnimatePresence mode="popLayout">
        {availableActions.map((action, index) => {
          const Icon = action.icon;
          const isActionLoading = isLoading === action.status;
          
          return (
            <motion.div
              key={action.status}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={(e) => handleAction(action.status, e)}
                disabled={isLoading !== null}
                className={cn(
                  'relative transition-all duration-200',
                  action.bgColor,
                  action.color,
                  isActionLoading && 'animate-pulse'
                )}
                title={action.label}
                aria-label={action.label}
              >
                <Icon className={cn('w-4 h-4', isActionLoading && 'animate-spin')} />
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {availableActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {moreActions
              .filter(action => action.status !== currentStatus)
              .map((action, index) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem
                    key={action.status}
                    onClick={(e) => handleAction(action.status, e as unknown as React.MouseEvent)}
                    className={cn('gap-2', action.color)}
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground"
            >
              Ver detalhes completos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </motion.div>
  );
});

// ============= Swipe Action for Mobile =============
interface SwipeActionProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: { label: string; color: string; icon: typeof Play };
  rightAction?: { label: string; color: string; icon: typeof CheckCircle };
}

export const SwipeAction = memo(function SwipeAction({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction = { label: 'Iniciar', color: 'bg-success', icon: Play },
  rightAction = { label: 'Finalizar', color: 'bg-primary', icon: CheckCircle },
}: SwipeActionProps) {
  const [dragX, setDragX] = useState(0);
  const threshold = 80;

  const handleDragEnd = useCallback(() => {
    if (dragX > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (dragX < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }
    setDragX(0);
  }, [dragX, onSwipeLeft, onSwipeRight, threshold]);

  const LeftIcon = leftAction.icon;
  const RightIcon = rightAction.icon;

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Left action background */}
      <div 
        className={cn(
          'absolute inset-y-0 left-0 flex items-center justify-start px-4',
          rightAction.color,
          'transition-opacity',
          dragX > 20 ? 'opacity-100' : 'opacity-0'
        )}
        style={{ width: Math.max(0, dragX) }}
      >
        <RightIcon className="w-5 h-5 text-white" />
      </div>

      {/* Right action background */}
      <div 
        className={cn(
          'absolute inset-y-0 right-0 flex items-center justify-end px-4',
          leftAction.color,
          'transition-opacity',
          dragX < -20 ? 'opacity-100' : 'opacity-0'
        )}
        style={{ width: Math.max(0, -dragX) }}
      >
        <LeftIcon className="w-5 h-5 text-white" />
      </div>

      {/* Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.2}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        animate={{ x: 0 }}
        className="relative bg-card"
      >
        {children}
      </motion.div>
    </div>
  );
});
