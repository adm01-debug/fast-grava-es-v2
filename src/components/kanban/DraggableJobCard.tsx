import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Calendar, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DbJob, DbTechnique, DbMachine } from '@/hooks/useJobs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DraggableJobCardProps {
  job: DbJob;
  technique: DbTechnique | undefined;
  machine: DbMachine | null;
  onClick: () => void;
}

export function DraggableJobCard({ job, technique, machine, onClick }: DraggableJobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: job.id,
    data: {
      type: 'job',
      job,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all duration-200",
        "bg-card/50 backdrop-blur-sm border-border/50",
        "hover:bg-card hover:border-border hover:shadow-lg",
        "group touch-none",
        isDragging && "opacity-50 shadow-2xl scale-105 z-50 ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div 
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
        </div>
        <Badge 
          variant="outline" 
          className="text-xs shrink-0"
          style={{ 
            borderColor: technique?.color,
            color: technique?.color,
            backgroundColor: `${technique?.color}15`
          }}
        >
          {technique?.name || 'N/A'}
        </Badge>
      </div>
      
      <p className="font-medium text-sm text-foreground truncate mb-1">
        {job.client}
      </p>
      <p className="text-xs text-muted-foreground truncate mb-2">
        {job.product}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono">OS {job.order_number}</span>
        <span>{job.quantity.toLocaleString()} pçs</span>
      </div>
      
      {job.scheduled_date && (
        <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{format(new Date(job.scheduled_date), "dd/MM", { locale: ptBR })}</span>
          {job.start_time && (
            <span className="ml-1">{job.start_time}</span>
          )}
        </div>
      )}
      
      {machine && (
        <div className="mt-1 text-xs text-muted-foreground truncate">
          📍 {machine.name}
        </div>
      )}
    </div>
  );
}
