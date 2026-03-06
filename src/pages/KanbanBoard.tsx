import { useState, useMemo, useCallback } from 'react';
import { useFuseSearch } from '@/hooks/useFuseSearch';
import { useNavigate } from 'react-router-dom';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { JobDetailsModal } from '@/components/jobs/JobDetailsModal';
import { Skeleton } from '@/components/ui/skeleton';
import { DroppableColumn } from '@/components/kanban/DroppableColumn';
import { DragOverlayCard } from '@/components/kanban/DragOverlayCard';
import { useKanbanDragDrop } from '@/hooks/useKanbanDragDrop';
import { FavoriteButton, FavoritesDropdown } from '@/components/navigation/FavoritesManager';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { 
  Search,
  Filter,
  Clock,
  Package,
  Calendar,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Pause,
  Command
} from 'lucide-react';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { DbJob } from '@/hooks/useJobs';
import { JobStatus } from '@/types/scheduling';
import { useQueryClient } from '@tanstack/react-query';

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

// Type-safe status validation
const isValidJobStatus = (status: string): status is JobStatus => {
  return ['queue', 'ready', 'scheduled', 'production', 'finished', 'paused', 'cancelled', 'delayed', 'rework'].includes(status);
};

// Type-safe priority validation
const isValidPriority = (priority: string): priority is Job['priority'] => {
  return ['low', 'medium', 'high', 'urgent'].includes(priority);
};


export default function KanbanBoard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<DbJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch real data from Supabase
  const { 
    jobs, 
    techniques, 
    isLoading: isLoadingJobs,
    isLoadingTechniques,
    getTechniqueById,
    getMachineById
  } = useSchedulingData();

  // Invalidate queries to refresh data after drag-drop
  const handleJobsUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
  }, [queryClient]);

  // Drag and drop hook
  const {
    activeJob,
    isUpdating,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useKanbanDragDrop({ jobs, onJobsUpdate: handleJobsUpdate });

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Apply Fuse.js fuzzy search
  const fuseSearchedJobs = useFuseSearch(jobs, searchTerm, {
    keys: ['client', 'product', 'order_number'],
    threshold: 0.3,
  });

  const filteredJobs = useMemo(() => {
    return fuseSearchedJobs.filter(job => {
      const matchesTechnique = selectedTechnique === 'all' || job.technique_id === selectedTechnique;
      return matchesTechnique;
    });
  }, [fuseSearchedJobs, selectedTechnique]);

  const getJobsByStatus = useCallback((status: JobStatus) => {
    return filteredJobs.filter(job => job.status === status);
  }, [filteredJobs]);

  const handleJobClick = (dbJob: DbJob) => {
    setSelectedJob(dbJob);
    setIsModalOpen(true);
  };

  if (isLoadingJobs || isLoadingTechniques) {
    return (
      <MainLayout>
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-[400px] w-[280px]" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <JobDetailsModal 
        job={selectedJob} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-fade-in-up">
          <Breadcrumbs />
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold">
                  <span className="gradient-text">Kanban</span>
                </h1>
                <FavoriteButton path="/kanban" name="Kanban" />
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">
                Arraste cards para alterar status • {isUpdating && 'Atualizando...'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Favorites Dropdown */}
              <FavoritesDropdown onNavigate={(path) => navigate(path)} />
              
              {/* Command Palette Hint */}
              <Badge variant="outline" className="hidden md:flex gap-1.5 cursor-pointer hover:bg-muted transition-colors">
                <Command className="h-3 w-3" />
                <span className="text-xs">⌘K</span>
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-[200px] bg-card/50 border-border/50"
              />
            </div>
            
            <Select value={selectedTechnique} onValueChange={setSelectedTechnique}>
              <SelectTrigger className="w-full sm:w-[180px] bg-card/50 border-border/50">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Técnica" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todas as técnicas</SelectItem>
                {techniques.map(technique => (
                  <SelectItem key={technique.id} value={technique.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: technique.color }} 
                      />
                      {technique.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Main Kanban Board */}
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                Fluxo Principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                {statusColumns.map((column) => (
                  <DroppableColumn 
                    key={column.status} 
                    {...column}
                    jobs={getJobsByStatus(column.status)}
                    getTechniqueById={getTechniqueById}
                    getMachineById={getMachineById}
                    onJobClick={handleJobClick}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exception Statuses */}
          <Card className="glass-card border-orange-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
                Status de Exceção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                {exceptionStatuses.map((column) => (
                  <DroppableColumn 
                    key={column.status} 
                    {...column}
                    jobs={getJobsByStatus(column.status)}
                    getTechniqueById={getTechniqueById}
                    getMachineById={getMachineById}
                    onJobClick={handleJobClick}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeJob ? (
            <DragOverlayCard
              job={activeJob}
              technique={getTechniqueById(activeJob.technique_id)}
              machine={activeJob.machine_id ? getMachineById(activeJob.machine_id) : null}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </MainLayout>
  );
}
