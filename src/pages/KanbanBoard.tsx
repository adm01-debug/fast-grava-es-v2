import { useState, useMemo, useCallback } from 'react';
import { useFuseSearch } from '@/hooks/useFuseSearch';
import { useNavigate } from 'react-router-dom';
import { 
  DndContext, DragOverlay, closestCorners,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobDetailsModal } from '@/components/jobs/JobDetailsModal';
import { Skeleton } from '@/components/ui/skeleton';
import { DroppableColumn } from '@/components/kanban/DroppableColumn';
import { DragOverlayCard } from '@/components/kanban/DragOverlayCard';
import { KanbanMetricsBar } from '@/components/kanban/KanbanMetricsBar';
import { KanbanFiltersBar, ViewMode, SwimlanesMode } from '@/components/kanban/KanbanFiltersBar';
import { KanbanAIAdvisor } from '@/components/kanban/KanbanAIAdvisor';
import { SmartSequencingPanel } from '@/components/planning/SmartSequencingPanel';
import { LoadBalancingPanel } from '@/components/planning/LoadBalancingPanel';
import { PlanningEfficiencyDashboard } from '@/components/planning/PlanningEfficiencyDashboard';
import { useKanbanDragDrop } from '@/hooks/useKanbanDragDrop';
import { FavoriteButton, FavoritesDropdown } from '@/components/navigation/FavoritesManager';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { 
  Clock, Package, Calendar, Play, CheckCircle2,
  AlertTriangle, RotateCcw, Pause, Command, Trash2, ArrowRight,
  Sparkles
} from 'lucide-react';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { DbJob } from '@/hooks/useJobs';
import { JobStatus } from '@/types/scheduling';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const statusColumns: { status: JobStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'queue', label: 'Na Fila', icon: Clock, color: 'text-blue-400' },
  { status: 'ready', label: 'No Jeito', icon: Package, color: 'text-amber-400' },
  { status: 'scheduled', label: 'Agendado', icon: Calendar, color: 'text-purple-400' },
  { status: 'production', label: 'Em Produção', icon: Play, color: 'text-cyan-400' },
  { status: 'finished', label: 'Finalizado', icon: CheckCircle2, color: 'text-green-400' },
];

const exceptionStatuses: { status: JobStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'paused', label: 'Pausado', icon: Pause, color: 'text-orange-400' },
  { status: 'delayed', label: 'Atrasado', icon: AlertTriangle, color: 'text-red-400' },
  { status: 'rework', label: 'Retrabalho', icon: RotateCcw, color: 'text-pink-400' },
];

const quickActionMap: Record<string, { status: JobStatus; label: string }> = {
  'start': { status: 'production', label: 'Em Produção' },
  'pause': { status: 'paused', label: 'Pausado' },
  'finish': { status: 'finished', label: 'Finalizado' },
  'resume': { status: 'production', label: 'Em Produção' },
};

export default function KanbanBoard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedMachine, setSelectedMachine] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('expanded');
  const [swimlanesMode, setSwimlanesMode] = useState<SwimlanesMode>('none');
  
  // Selection
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  
  // Modal
  const [selectedJob, setSelectedJob] = useState<DbJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { 
    jobs, techniques, machines,
    isLoading: isLoadingJobs, isLoadingTechniques,
    getTechniqueById, getMachineById
  } = useSchedulingData();

  const handleJobsUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
  }, [queryClient]);

  const { activeJob, isUpdating, handleDragStart, handleDragOver, handleDragEnd, handleDragCancel } = 
    useKanbanDragDrop({ jobs, onJobsUpdate: handleJobsUpdate });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fuzzy search
  const fuseSearchedJobs = useFuseSearch(jobs, searchTerm, {
    keys: ['client', 'product', 'order_number'],
    threshold: 0.3,
  });

  // Apply all filters
  const filteredJobs = useMemo(() => {
    return fuseSearchedJobs.filter(job => {
      if (selectedTechnique !== 'all' && job.technique_id !== selectedTechnique) return false;
      if (selectedPriority !== 'all' && job.priority !== selectedPriority) return false;
      if (selectedMachine !== 'all' && job.machine_id !== selectedMachine) return false;
      return true;
    });
  }, [fuseSearchedJobs, selectedTechnique, selectedPriority, selectedMachine]);

  const activeFiltersCount = [selectedTechnique, selectedPriority, selectedMachine]
    .filter(v => v !== 'all').length;

  const getJobsByStatus = useCallback((status: JobStatus) => {
    return filteredJobs.filter(job => job.status === status);
  }, [filteredJobs]);

  const handleJobClick = (dbJob: DbJob) => {
    setSelectedJob(dbJob);
    setIsModalOpen(true);
  };

  const handleSelectJob = useCallback((id: string) => {
    setSelectedJobs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleClearFilters = () => {
    setSelectedTechnique('all');
    setSelectedPriority('all');
    setSelectedMachine('all');
    setSearchTerm('');
  };

  // Quick actions
  const handleQuickAction = useCallback(async (jobId: string, action: string) => {
    const mapping = quickActionMap[action];
    if (!mapping) return;

    const updateData: Record<string, string> = {
      status: mapping.status,
      updated_at: new Date().toISOString(),
    };

    const job = jobs.find(j => j.id === jobId);
    if (mapping.status === 'production' && job && !job.actual_start_time) {
      updateData.actual_start_time = new Date().toISOString();
    }
    if (mapping.status === 'finished' && job && !job.actual_end_time) {
      updateData.actual_end_time = new Date().toISOString();
    }

    const { error } = await supabase.from('jobs').update(updateData).eq('id', jobId);
    if (error) {
      toast.error('Erro ao atualizar status');
    } else {
      toast.success(`Job movido para "${mapping.label}"`, {
        action: {
          label: 'Desfazer',
          onClick: async () => {
            if (job) {
              await supabase.from('jobs').update({ 
                status: job.status, 
                updated_at: new Date().toISOString() 
              }).eq('id', jobId);
              handleJobsUpdate();
            }
          }
        }
      });
      handleJobsUpdate();
    }
  }, [jobs, handleJobsUpdate]);

  // Bulk actions
  const handleBulkAction = useCallback(async (action: 'delete' | 'move', targetStatus?: JobStatus) => {
    if (selectedJobs.size === 0) return;
    
    if (action === 'move' && targetStatus) {
      const updates = Array.from(selectedJobs).map(id =>
        supabase.from('jobs').update({ status: targetStatus, updated_at: new Date().toISOString() }).eq('id', id)
      );
      await Promise.all(updates);
      toast.success(`${selectedJobs.size} jobs movidos para "${targetStatus}"`);
      setSelectedJobs(new Set());
      handleJobsUpdate();
    }
  }, [selectedJobs, handleJobsUpdate]);

  // Swimlane grouping
  const swimlaneGroups = useMemo(() => {
    if (swimlanesMode === 'none') return null;
    
    if (swimlanesMode === 'technique') {
      const groups = new Map<string, { label: string; color: string; jobs: DbJob[] }>();
      techniques.forEach(t => groups.set(t.id, { label: t.name, color: t.color, jobs: [] }));
      groups.set('unknown', { label: 'Sem técnica', color: '#888', jobs: [] });
      
      filteredJobs.forEach(job => {
        const group = groups.get(job.technique_id) || groups.get('unknown')!;
        group.jobs.push(job);
      });
      
      return Array.from(groups.entries())
        .filter(([_, g]) => g.jobs.length > 0)
        .map(([id, g]) => ({ id, ...g }));
    }
    
    if (swimlanesMode === 'machine') {
      const groups = new Map<string, { label: string; color: string; jobs: DbJob[] }>();
      (machines || []).forEach(m => groups.set(m.id, { label: m.name, color: '#888', jobs: [] }));
      groups.set('unassigned', { label: 'Sem máquina', color: '#888', jobs: [] });
      
      filteredJobs.forEach(job => {
        const key = job.machine_id || 'unassigned';
        const group = groups.get(key) || groups.get('unassigned')!;
        group.jobs.push(job);
      });
      
      return Array.from(groups.entries())
        .filter(([_, g]) => g.jobs.length > 0)
        .map(([id, g]) => ({ id, ...g }));
    }
    
    return null;
  }, [swimlanesMode, filteredJobs, techniques, machines]);

  if (isLoadingJobs || isLoadingTechniques) {
    return (
      <MainLayout>
        <div className="p-4 sm:p-6 lg:p-8 space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-6 gap-2">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-16" />)}
          </div>
          <div className="flex gap-4">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-[400px] w-[280px]" />)}
          </div>
        </div>
      </MainLayout>
    );
  }

  const renderColumns = (jobsForColumns: DbJob[], getJobsByStatusFn: (s: JobStatus) => DbJob[]) => (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
      {statusColumns.map((column) => (
        <DroppableColumn 
          key={column.status} 
          {...column}
          jobs={getJobsByStatusFn(column.status)}
          getTechniqueById={getTechniqueById}
          getMachineById={getMachineById}
          onJobClick={handleJobClick}
          viewMode={viewMode}
          selectedJobs={selectedJobs}
          onSelectJob={handleSelectJob}
          onQuickAction={handleQuickAction}
        />
      ))}
    </div>
  );

  return (
    <MainLayout>
      <JobDetailsModal job={selectedJob} open={isModalOpen} onOpenChange={setIsModalOpen} />
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 animate-fade-in-up">
          <Breadcrumbs />
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold">
                  <span className="gradient-text">Kanban</span>
                </h1>
                <FavoriteButton path="/kanban" name="Kanban" />
              </div>
              <p className="text-muted-foreground text-sm">
                Arraste cards para alterar status {isUpdating && '• Atualizando...'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FavoritesDropdown onNavigate={(path) => navigate(path)} />
              <Badge variant="outline" className="hidden md:flex gap-1.5 cursor-pointer hover:bg-muted transition-colors">
                <Command className="h-3 w-3" /><span className="text-xs">⌘K</span>
              </Badge>
            </div>
          </div>
          
          {/* Planning Efficiency Dashboard */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlanningEfficiencyDashboard />
          </motion.div>

          {/* Smart Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SmartSequencingPanel />
            <LoadBalancingPanel />
          </div>

          {/* AI Advisor */}
          <KanbanAIAdvisor />

          {/* Metrics Bar */}
          <KanbanMetricsBar jobs={jobs} />

          {/* Filters Bar */}
          <KanbanFiltersBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTechnique={selectedTechnique}
            onTechniqueChange={setSelectedTechnique}
            selectedPriority={selectedPriority}
            onPriorityChange={setSelectedPriority}
            selectedMachine={selectedMachine}
            onMachineChange={setSelectedMachine}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            swimlanesMode={swimlanesMode}
            onSwimlanesChange={setSwimlanesMode}
            techniques={techniques}
            machines={machines || []}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={handleClearFilters}
          />

          {/* Bulk actions bar */}
          {selectedJobs.size > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Badge variant="secondary">{selectedJobs.size} selecionados</Badge>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleBulkAction('move', 'production')}>
                <ArrowRight className="h-3 w-3" /> Mover p/ Produção
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleBulkAction('move', 'finished')}>
                <CheckCircle2 className="h-3 w-3" /> Finalizar
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={() => setSelectedJobs(new Set())}>
                Limpar seleção
              </Button>
            </div>
          )}

          {/* Main Kanban Board */}
          {swimlanesMode !== 'none' && swimlaneGroups ? (
            // Swimlanes view
            <div className="space-y-4">
              {swimlaneGroups.map(group => (
                <Card key={group.id} className="glass-card">
                  <CardHeader className="pb-3 pt-4 px-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                      {group.label}
                      <Badge variant="secondary" className="text-xs ml-1">{group.jobs.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                      {statusColumns.map((column) => {
                        const columnJobs = group.jobs.filter(j => j.status === column.status);
                        return (
                          <DroppableColumn 
                            key={`${group.id}-${column.status}`}
                            {...column}
                            jobs={columnJobs}
                            getTechniqueById={getTechniqueById}
                            getMachineById={getMachineById}
                            onJobClick={handleJobClick}
                            viewMode={viewMode}
                            selectedJobs={selectedJobs}
                            onSelectJob={handleSelectJob}
                            onQuickAction={handleQuickAction}
                          />
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Standard view
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Fluxo Principal
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderColumns(filteredJobs, getJobsByStatus)}
              </CardContent>
            </Card>
          )}

          {/* Exception Statuses */}
          <Card className="glass-card border-orange-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                Status de Exceção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
                {exceptionStatuses.map((column) => (
                  <DroppableColumn 
                    key={column.status} 
                    {...column}
                    jobs={getJobsByStatus(column.status)}
                    getTechniqueById={getTechniqueById}
                    getMachineById={getMachineById}
                    onJobClick={handleJobClick}
                    viewMode={viewMode}
                    selectedJobs={selectedJobs}
                    onSelectJob={handleSelectJob}
                    onQuickAction={handleQuickAction}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DragOverlay>
          {activeJob ? (
            <DragOverlayCard
              job={activeJob}
              technique={getTechniqueById(activeJob.technique_id)}
              machine={activeJob.machine_id ? getMachineById(activeJob.machine_id) ?? null : null}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </MainLayout>
  );
}
