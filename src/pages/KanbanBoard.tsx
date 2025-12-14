import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JobDetailsModal } from '@/components/jobs/JobDetailsModal';
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
import { mockJobs, getTechniqueById, getMachineById } from '@/data/mockData';
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

export default function KanbanBoard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredJobs = useMemo(() => {
    return mockJobs.filter(job => {
      const matchesSearch = searchTerm === '' || 
        job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTechnique = selectedTechnique === 'all' || job.techniqueId === selectedTechnique;
      
      return matchesSearch && matchesTechnique;
    });
  }, [searchTerm, selectedTechnique]);

  const getJobsByStatus = (status: JobStatus) => {
    return filteredJobs.filter(job => job.status === status);
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const JobCard = ({ job }: { job: Job }) => {
    const technique = getTechniqueById(job.techniqueId);
    const machine = job.machineId ? getMachineById(job.machineId) : null;
    
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
          <span className="font-mono">OS {job.orderNumber}</span>
          <span>{job.quantity.toLocaleString()} pçs</span>
        </div>
        
        {job.scheduledDate && (
          <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(job.scheduledDate), "dd/MM", { locale: ptBR })}</span>
            {job.startTime && (
              <span className="ml-1">{job.startTime}</span>
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
    const jobs = getJobsByStatus(status);
    
    return (
      <div className="flex flex-col min-w-[240px] sm:min-w-[280px] max-w-[320px]">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Icon className={cn("h-4 w-4", color)} />
          <h3 className="font-semibold text-sm">{label}</h3>
          <Badge variant="secondary" className="ml-auto text-xs">
            {jobs.length}
          </Badge>
        </div>
        
        <div className={cn(
          "flex-1 p-2 rounded-xl border border-border/30",
          "bg-gradient-to-b from-muted/20 to-muted/5",
          "space-y-2 min-h-[400px] overflow-y-auto scrollbar-thin"
        )}>
          {jobs.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
              Nenhum job
            </div>
          ) : (
            jobs.map((job, index) => (
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

  const techniques = useMemo(() => {
    const uniqueTechniques = new Map();
    mockJobs.forEach(job => {
      const technique = getTechniqueById(job.techniqueId);
      if (technique && !uniqueTechniques.has(technique.id)) {
        uniqueTechniques.set(technique.id, technique);
      }
    });
    return Array.from(uniqueTechniques.values());
  }, []);

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
            <h1 className="text-3xl font-display font-bold">
              <span className="gradient-text">Kanban</span>
            </h1>
            <p className="text-muted-foreground">
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
            <CardTitle className="text-lg flex items-center gap-2">
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
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
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
