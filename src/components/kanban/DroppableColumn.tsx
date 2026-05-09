import { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DbJob } from '@/hooks/useJobs';
import { JobStatus } from '@/types/scheduling';
import { DraggableJobCard } from './DraggableJobCard';
import { useMemo } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Clock, Activity } from 'lucide-react';
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
  const [thresholds, setThresholds] = useState({ bottleneckRiskMinutes: 480 });

  useEffect(() => {
    const stored = localStorage.getItem('alert-thresholds');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.bottleneckRiskMinutes) {
          setThresholds({ bottleneckRiskMinutes: parsed.bottleneckRiskMinutes });
        }
      } catch (e) {
        console.error('Error loading thresholds', e);
      }
    }
  }, []);

  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status }
  });

  const effectiveWipLimit = wipLimit ?? WIP_LIMITS[status] ?? 20;
  const isOverWip = jobs.length > effectiveWipLimit;
  const wipPercentage = Math.min(100, (jobs.length / effectiveWipLimit) * 100);

  const totalEstimatedTime = useMemo(() => {
    return jobs.reduce((acc, job) => acc + (job.estimated_duration || 0), 0);
  }, [jobs]);

  const leadTimeLabel = useMemo(() => {
    if (totalEstimatedTime === 0) return null;
    const hours = Math.floor(totalEstimatedTime / 60);
    const mins = totalEstimatedTime % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }, [totalEstimatedTime]);

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
      "flex flex-col group/column transition-all duration-300",
      viewMode === 'compact' ? 'min-w-[300px] sm:min-w-[400px]' : 'min-w-[240px] sm:min-w-[280px] max-w-[320px]'
    )}>
      {/* Column header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0 hover:bg-primary/10"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </Button>
        <div className={cn("p-1 rounded-md bg-card border border-border/50 shadow-sm", color)}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-semibold text-sm tracking-tight">{label}</h3>
        <Badge 
          variant={isOverWip ? "destructive" : "secondary"} 
          className={cn(
            "ml-auto text-xs font-mono", 
            isOverWip && "animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"
          )}
        >
          {jobs.length}
          {effectiveWipLimit < 50 && <span className="text-[9px] opacity-70 ml-1">/{effectiveWipLimit}</span>}
        </Badge>
        {isOverWip && <AlertTriangle className="h-3.5 w-3.5 text-destructive animate-bounce" />}
        {leadTimeLabel && (
          <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border/50 ml-1" title="Tempo total estimado para processar esta coluna">
            <Clock className="h-3 w-3 text-primary/70" />
            {leadTimeLabel}
          </div>
        )}
      </div>
      
      {/* Bottleneck Risk Indicator */}
      {totalEstimatedTime > 0 && (
        <div className="flex flex-col gap-1.5 mb-2 px-1">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <Activity className={cn(
              "h-3 w-3",
              totalEstimatedTime > thresholds.bottleneckRiskMinutes ? "text-red-500 animate-pulse" : 
              totalEstimatedTime > thresholds.bottleneckRiskMinutes * 0.7 ? "text-orange-500" : "text-emerald-500"
            )} />
            <span className={cn(
              totalEstimatedTime > thresholds.bottleneckRiskMinutes ? "text-red-500" : 
              totalEstimatedTime > thresholds.bottleneckRiskMinutes * 0.7 ? "text-orange-500" : "text-emerald-500"
            )}>
              Risco de Gargalo: {totalEstimatedTime > thresholds.bottleneckRiskMinutes ? "Crítico" : totalEstimatedTime > thresholds.bottleneckRiskMinutes * 0.7 ? "Moderado" : "Baixo"}
            </span>
            <Badge 
              variant="outline" 
              className={cn(
                "ml-auto text-[8px] h-4 px-1.5 leading-none font-bold border-2",
                totalEstimatedTime > thresholds.bottleneckRiskMinutes ? "border-red-500 text-red-500 bg-red-500/10 animate-pulse" : 
                totalEstimatedTime > thresholds.bottleneckRiskMinutes * 0.7 ? "border-orange-500 text-orange-500 bg-orange-500/10" : 
                "border-emerald-500 text-emerald-500 bg-emerald-500/10"
              )}
            >
              {totalEstimatedTime > thresholds.bottleneckRiskMinutes ? "GARGALO" : totalEstimatedTime > thresholds.bottleneckRiskMinutes * 0.7 ? "ATENÇÃO" : "ESTÁVEL"}
            </Badge>
          </div>
          {totalEstimatedTime > thresholds.bottleneckRiskMinutes && (
            <div className="text-[9px] text-red-400 font-bold bg-red-500/10 border border-red-500/20 rounded-md px-2 py-1 mt-0.5 animate-in fade-in slide-in-from-top-1 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              CAPACIDADE EXCEDIDA: Recomenda-se balancear carga ou priorizar jobs críticos.
            </div>
          )}
        </div>
      )}

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
            "flex-1 p-2 rounded-xl border transition-all duration-300",
            "bg-gradient-to-b from-muted/30 to-card/10 backdrop-blur-md shadow-inner",
            "space-y-1.5 min-h-[400px] max-h-[70vh] overflow-y-auto scrollbar-thin",
            "group-hover/column:border-border/60",
            isOver 
              ? "border-primary/50 bg-primary/10 ring-4 ring-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.1)]" 
              : isOverWip 
                ? "border-destructive/40 bg-destructive/5" 
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
