import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DbJob } from '@/hooks/useJobs';
import { JobStatus } from '@/types/scheduling';
import { DraggableJobCard } from './DraggableJobCard';
import { useMemo } from 'react';

interface DroppableColumnProps {
  status: JobStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  jobs: DbJob[];
  getTechniqueById: (id: string) => { id: string; name: string; short_name: string; color: string; setup_time: number } | undefined;
  getMachineById: (id: string) => { id: string; code: string; name: string; technique_id: string; is_active: boolean } | undefined;
  onJobClick: (job: DbJob) => void;
}

// Priority order for sorting (higher = more priority)
const priorityOrder: Record<string, number> = {
  'urgent': 4,
  'high': 3,
  'medium': 2,
  'low': 1,
};

export function DroppableColumn({
  status,
  label,
  icon: Icon,
  color,
  jobs,
  getTechniqueById,
  getMachineById,
  onJobClick,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    }
  });

  // Sort jobs by priority (urgent first) then by date
  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      // First by priority
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      // Then by created date (older first)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [jobs]);

  const jobIds = sortedJobs.map(job => job.id);

  return (
    <div className="flex flex-col min-w-[240px] sm:min-w-[280px] max-w-[320px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Icon className={cn("h-4 w-4", color)} />
        <h3 className="font-semibold text-sm">{label}</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {jobs.length}
        </Badge>
      </div>
      
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-2 rounded-xl border transition-all duration-200",
          "bg-gradient-to-b from-muted/20 to-muted/5",
          "space-y-2 min-h-[400px] overflow-y-auto scrollbar-thin",
          isOver 
            ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20" 
            : "border-border/30"
        )}
      >
        <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
          {sortedJobs.length === 0 ? (
            <div className={cn(
              "flex items-center justify-center h-24 text-xs text-muted-foreground",
              "border-2 border-dashed rounded-lg transition-colors",
              isOver ? "border-primary/50 bg-primary/10" : "border-transparent"
            )}>
              {isOver ? "Soltar aqui" : "Nenhum job"}
            </div>
          ) : (
            sortedJobs.map((job, index) => (
              <div 
                key={job.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <DraggableJobCard 
                  job={job}
                  technique={getTechniqueById(job.technique_id)}
                  machine={job.machine_id ? getMachineById(job.machine_id) : null}
                  onClick={() => onJobClick(job)}
                />
              </div>
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
