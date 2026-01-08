import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Check, X } from 'lucide-react';
import { JobStatus } from '@/types/scheduling';
import { cn } from '@/lib/utils';

export interface SwipeAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  action: () => void;
}

interface JobQuickActionsProps {
  jobId: string;
  currentStatus: JobStatus;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
  isExpanded?: boolean;
}

const statusTransitions: Record<JobStatus, JobStatus[]> = {
  queue: ['ready', 'scheduled'],
  ready: ['production', 'scheduled'],
  scheduled: ['production', 'cancelled'],
  production: ['paused', 'finished'],
  paused: ['production', 'cancelled'],
  finished: [],
  cancelled: ['queue'],
  delayed: ['production', 'cancelled'],
  rework: ['production', 'finished'],
};

const statusIcons: Partial<Record<JobStatus, React.ReactNode>> = {
  production: <Play className="w-3.5 h-3.5" />,
  paused: <Pause className="w-3.5 h-3.5" />,
  finished: <Check className="w-3.5 h-3.5" />,
  cancelled: <X className="w-3.5 h-3.5" />,
};

export const JobQuickActions = memo(function JobQuickActions({
  jobId,
  currentStatus,
  onStatusChange,
  isExpanded = false,
}: JobQuickActionsProps) {
  const availableTransitions = statusTransitions[currentStatus] || [];

  if (availableTransitions.length === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent, newStatus: JobStatus) => {
    e.stopPropagation();
    onStatusChange(jobId, newStatus);
  };

  // Show only first action if not expanded
  const actionsToShow = isExpanded ? availableTransitions : availableTransitions.slice(0, 1);

  return (
    <div className="flex items-center gap-1">
      {actionsToShow.map((status) => (
        <Button
          key={status}
          size="icon"
          variant="ghost"
          className={cn(
            "h-7 w-7 rounded-full",
            status === 'production' && "text-status-production hover:bg-status-production/10",
            status === 'paused' && "text-status-paused hover:bg-status-paused/10",
            status === 'finished' && "text-status-finished hover:bg-status-finished/10",
            status === 'cancelled' && "text-status-cancelled hover:bg-status-cancelled/10"
          )}
          onClick={(e) => handleClick(e, status)}
          title={`Mudar para ${status}`}
        >
          {statusIcons[status] || <Check className="w-3.5 h-3.5" />}
        </Button>
      ))}
    </div>
  );
});
