import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JobDetailsModal } from '@/components/jobs/JobDetailsModal';
import { Skeleton } from '@/components/ui/skeleton';
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
  GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJobs, useTechniques, useMachines, DbJob, DbTechnique, DbMachine } from '@/hooks/useJobs';
import { Job, JobStatus } from '@/types/scheduling';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

// Helper to convert DbJob to Job format for modal
const dbJobToJob = (dbJob: DbJob): Job => ({
  id: dbJob.id,
  orderNumber: dbJob.order_number,
  client: dbJob.client,
  product: dbJob.product,
  quantity: dbJob.quantity,
  techniqueId: dbJob.technique_id as any,
  machineId: dbJob.machine_id || '',
  operatorId: '',
  scheduledDate: dbJob.scheduled_date ? new Date(dbJob.scheduled_date) : new Date(),
  startTime: dbJob.start_time || '',
  endTime: dbJob.end_time || '',
  estimatedDuration: dbJob.estimated_duration,
  status: dbJob.status as any,
  gravureColor: dbJob.gravure_color || undefined,
  notes: dbJob.notes || undefined,
  priority: dbJob.priority as any,
  createdAt: new Date(dbJob.created_at),
  updatedAt: new Date(dbJob.updated_at),
  createdBy: '',
  actualStartTime: dbJob.actual_start_time ? new Date(dbJob.actual_start_time) : undefined,
  actualEndTime: dbJob.actual_end_time ? new Date(dbJob.actual_end_time) : undefined,
});

export default function KanbanBoard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch real data from Supabase
  const { data: jobs = [], isLoading: isLoadingJobs } = useJobs();
  const { data: techniques = [], isLoading: isLoadingTechniques } = useTechniques();
  const { data: machines = [] } = useMachines();

  // Helper functions
  const getTechniqueById = (id: string): DbTechnique | undefined => {
    return techniques.find(t => t.id === id);
  };

  const getMachineById = (id: string): DbMachine | undefined => {
    return machines.find(m => m.id === id);
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = searchTerm === '' || 
        job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.order_number.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTechnique = selectedTechnique === 'all' || job.technique_id === selectedTechnique;
      
      return matchesSearch && matchesTechnique;
    });
  }, [jobs, searchTerm, selectedTechnique]);

  const getJobsByStatus = (status: JobStatus) => {
    return filteredJobs.filter(job => job.status === status);
  };

  const handleJobClick = (dbJob: DbJob) => {
    setSelectedJob(dbJobToJob(dbJob));
    setIsModalOpen(true);
  };

  const JobCard = ({ job }: { job: DbJob }) => {
    const technique = getTechniqueById(job.technique_id);
    const machine = job.machine_id ? getMachineById(job.machine_id) : null;
    
    return (
      <div
        onClick={() => handleJobClick(job)}
        className={cn(
          "p-3 rounded-lg border cursor-pointer transition-all duration-200",
          "bg-card/50 backdrop-blur-sm border-border/50",
          "hover:bg-card hover:border-border hover:shadow-lg hover:scale-[1.02]",
          "group"
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
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
  };

  const KanbanColumn = ({ 
    status, 
    label, 
    icon: Icon, 
    color 
  }: { 
    status: JobStatus; 
    label: string; 
    icon: React.ElementType;
    color: string;
  }) => {
    const columnJobs = getJobsByStatus(status);
    
    return (
      <div className="flex flex-col min-w-[240px] sm:min-w-[280px] max-w-[320px]">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Icon className={cn("h-4 w-4", color)} />
          <h3 className="font-semibold text-sm">{label}</h3>
          <Badge variant="secondary" className="ml-auto text-xs">
            {columnJobs.length}
          </Badge>
        </div>
        
        <div className={cn(
          "flex-1 p-2 rounded-xl border border-border/30",
          "bg-gradient-to-b from-muted/20 to-muted/5",
          "space-y-2 min-h-[400px] overflow-y-auto scrollbar-thin"
        )}>
          {columnJobs.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
              Nenhum job
            </div>
          ) : (
            columnJobs.map((job, index) => (
              <div 
                key={job.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <JobCard job={job} />
              </div>
            ))
          )}
        </div>
      </div>
    );
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
      
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold">
              <span className="gradient-text">Kanban</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Visualização por status dos jobs
            </p>
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
                <KanbanColumn key={column.status} {...column} />
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
                <KanbanColumn key={column.status} {...column} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
