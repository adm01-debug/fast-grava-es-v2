import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DbJob } from '@/hooks/useJobs';
import { JobStatus } from '@/types/scheduling';
import { DraggableJobCard } from './DraggableJobCard';
import { useMemo } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { ViewMode } from './KanbanFiltersBar';

interface DroppableColumnProps {
  status: JobStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  jobs: DbJob[];
  getTechniqueById: (id: string) => { id: string; name: string; short_name: string; color: string; setup_time: number } | undefined;
  getMachineById: (id: string) => { id: string; code: string; name: string; technique_id: string; is_active: boolean } | undefined;
  onJobClick: (job: DbJob) => void;
  wipLimit?: number;
  viewMode?: ViewMode;
  selectedJobs?: Set<string>;
  onSelectJob?: (id: string) => void;
  onQuickAction?: (jobId: string, action: string) => void;
}

const priorityOrder: Record<string, number> = {
  'urgent': 4,
  'high': 3,
  'medium': 2,
  'low': 1,
};

const WIP_LIMITS: Record<string, number> = {
  'queue': 20,
  'ready': 10,
  'scheduled': 15,
  'production': 8,
  'finished': 50,
  'paused': 5,
  'delayed': 5,
  'rework': 5,
};

export function DroppableColumn({
  status, label, icon: Icon, color, jobs,
  getTechniqueById, getMachineById, onJobClick,
  wipLimit, viewMode = 'expanded',
  selectedJobs, onSelectJob, onQuickAction,
}: DroppableColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status }
  });

  const effectiveWipLimit = wipLimit ?? WIP_LIMITS[status] ?? 20;
  const isOverWip = jobs.length > effectiveWipLimit;
  const wipPercentage = Math.min(100, (jobs.length / effectiveWipLimit) * 100);

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [jobs]);

  const jobIds = sortedJobs.map(job => job.id);

  return (
    <div className={cn(
      "flex flex-col",
      viewMode === 'compact' ? 'min-w-[300px] sm:min-w-[400px]' : 'min-w-[240px] sm:min-w-[280px] max-w-[320px]'
    )}>
      {/* Column header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </Button>
        <Icon className={cn("h-4 w-4", color)} />
        <h3 className="font-semibold text-sm">{label}</h3>
        <Badge 
          variant={isOverWip ? "destructive" : "secondary"} 
          className={cn("ml-auto text-xs", isOverWip && "animate-pulse")}
        >
          {jobs.length}
          {effectiveWipLimit < 50 && <span className="text-[9px] opacity-70">/{effectiveWipLimit}</span>}
        </Badge>
        {isOverWip && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
      </div>

      {/* WIP indicator bar */}
      {effectiveWipLimit < 50 && (
        <div className="h-1 mx-1 mb-2 rounded-full bg-muted/30 overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-300",
              wipPercentage > 100 ? "bg-destructive" : 
              wipPercentage > 80 ? "bg-orange-400" : "bg-primary/60"
            )}
            style={{ width: `${Math.min(100, wipPercentage)}%` }}
          />
        </div>
      )}

      {/* Collapsed state */}
      {isCollapsed ? (
        <div
          ref={setNodeRef}
          className={cn(
            "flex items-center justify-center h-12 rounded-xl border transition-all",
            "bg-muted/10 border-border/30 text-xs text-muted-foreground cursor-pointer",
            isOver && "border-primary/50 bg-primary/5"
          )}
          onClick={() => setIsCollapsed(false)}
        >
          {jobs.length} jobs • Clique para expandir
        </div>
      ) : (
        <div
          ref={setNodeRef}
          className={cn(
            "flex-1 p-2 rounded-xl border transition-all duration-200",
            "bg-gradient-to-b from-muted/20 to-muted/5",
            "space-y-1.5 min-h-[300px] max-h-[65vh] overflow-y-auto scrollbar-thin",
            isOver 
              ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20" 
              : isOverWip 
                ? "border-destructive/30" 
                : "border-border/30"
          )}
        >
          <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
            {sortedJobs.length === 0 ? (
              <div className={cn(
                "flex items-center justify-center h-20 text-xs text-muted-foreground",
                "border-2 border-dashed rounded-lg transition-colors",
                isOver ? "border-primary/50 bg-primary/10" : "border-transparent"
              )}>
                {isOver ? "Soltar aqui" : "Nenhum job"}
              </div>
            ) : (
              sortedJobs.map((job) => (
                <DraggableJobCard 
                  key={job.id}
                  job={job}
                  technique={getTechniqueById(job.technique_id)}
                  machine={job.machine_id ? getMachineById(job.machine_id) ?? null : null}
                  onClick={() => onJobClick(job)}
                  viewMode={viewMode}
                  isSelected={selectedJobs?.has(job.id)}
                  onSelect={onSelectJob}
                  onQuickAction={onQuickAction}
                />
              ))
            )}
          </SortableContext>
        </div>
      )}
    </div>
  );
}
