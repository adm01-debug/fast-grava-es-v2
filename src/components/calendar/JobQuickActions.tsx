import { memo } from 'react';
import { Play, Pause, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JobStatus } from '@/types/scheduling';

export interface JobQuickActionsProps {
  jobId: string;
  currentStatus: JobStatus;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
  isExpanded?: boolean;
}

export const JobQuickActions = memo(function JobQuickActions({ 
  jobId, 
  currentStatus, 
  onStatusChange 
}: JobQuickActionsProps) {
  const actions: Array<{ status: JobStatus; icon: typeof Play; label: string }> = [
    { status: 'production', icon: Play, label: 'Iniciar' },
    { status: 'paused', icon: Pause, label: 'Pausar' },
    { status: 'finished', icon: Check, label: 'Finalizar' },
  ];

  const availableActions = actions.filter(a => a.status !== currentStatus);

  return (
    <div className="flex gap-1">
      {availableActions.slice(0, 2).map(action => (
        <Button
          key={action.status}
          size="icon"
          variant="ghost"
          className="h-7 w-7 bg-background/50 backdrop-blur-sm hover:bg-background/80"
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(jobId, action.status);
          }}
          title={action.label}
        >
          <action.icon className="h-3.5 w-3.5" />
        </Button>
      ))}
    </div>
  );
});
