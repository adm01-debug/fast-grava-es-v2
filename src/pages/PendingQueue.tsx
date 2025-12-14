import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { JobDetailsModal } from "@/components/jobs/JobDetailsModal";
import { Skeleton } from "@/components/ui/skeleton";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  Calendar,
  Package,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  RotateCcw
} from "lucide-react";
import { useJobs, useTechniques, useMachines, DbJob, DbTechnique, DbMachine } from "@/hooks/useJobs";
import { Job, JobStatus } from "@/types/scheduling";

type SortField = 'orderNumber' | 'client' | 'scheduledDate' | 'priority' | 'quantity';
type SortDirection = 'asc' | 'desc';

const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
const priorityColors = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30'
};

const priorityLabels = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa'
};

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

export default function PendingQueue() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTechnique, setSelectedTechnique] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('scheduledDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
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

  // Filter pending jobs (queue, ready, scheduled, delayed, rework)
  const pendingStatuses: JobStatus[] = ['queue', 'ready', 'scheduled', 'delayed', 'rework'];

  const filteredJobs = useMemo(() => {
    return jobs
      .filter(job => pendingStatuses.includes(job.status as JobStatus))
      .filter(job => {
        const matchesSearch = 
          job.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.product.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesTechnique = selectedTechnique === "all" || job.technique_id === selectedTechnique;
        const matchesStatus = selectedStatus === "all" || job.status === selectedStatus;
        const matchesPriority = selectedPriority === "all" || job.priority === selectedPriority;

        return matchesSearch && matchesTechnique && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        let comparison = 0;
        
        switch (sortField) {
          case 'orderNumber':
            comparison = a.order_number.localeCompare(b.order_number);
            break;
          case 'client':
            comparison = a.client.localeCompare(b.client);
            break;
          case 'scheduledDate':
            const dateA = a.scheduled_date ? new Date(a.scheduled_date).getTime() : 0;
            const dateB = b.scheduled_date ? new Date(b.scheduled_date).getTime() : 0;
            comparison = dateA - dateB;
            break;
          case 'priority':
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
            break;
          case 'quantity':
            comparison = a.quantity - b.quantity;
            break;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [jobs, searchTerm, selectedTechnique, selectedStatus, selectedPriority, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedTechnique("all");
    setSelectedStatus("all");
    setSelectedPriority("all");
    setSortField('scheduledDate');
    setSortDirection('asc');
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4" /> 
      : <ChevronDown className="h-4 w-4" />;
  };

  // Stats
  const stats = useMemo(() => ({
    total: filteredJobs.length,
    urgent: filteredJobs.filter(j => j.priority === 'urgent').length,
    delayed: filteredJobs.filter(j => j.status === 'delayed').length,
    rework: filteredJobs.filter(j => j.status === 'rework').length,
  }), [filteredJobs]);

  const handleJobClick = (dbJob: DbJob) => {
    setSelectedJob(dbJobToJob(dbJob));
    setIsModalOpen(true);
  };

  if (isLoadingJobs || isLoadingTechniques) {
    return (
      <MainLayout>
        <div className="p-4 sm:p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background p-4 sm:p-6 space-y-4 sm:space-y-6">
        <JobDetailsModal 
          job={selectedJob} 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen} 
        />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Lista de Pendências</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Backlog e jobs aguardando produção</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-muted/50 text-foreground border-border">
              <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              {stats.total} pendentes
            </Badge>
            {stats.urgent > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                {stats.urgent} urgentes
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-xl bg-cyan-500/20">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-xl bg-red-500/20">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.urgent}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Urgentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-xl bg-orange-500/20">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.delayed}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Atrasados</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-xl bg-purple-500/20">
                <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.rework}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Retrabalho</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>

              <Select value={selectedTechnique} onValueChange={setSelectedTechnique}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="Técnica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {techniques.map(technique => (
                    <SelectItem key={technique.id} value={technique.id}>
                      {technique.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="queue">Na Fila</SelectItem>
                  <SelectItem value="ready">No Jeito</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="delayed">Atrasado</SelectItem>
                  <SelectItem value="rework">Retrabalho</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="border-border/50 hover:bg-muted/50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead 
                      className="cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('orderNumber')}
                    >
                      <div className="flex items-center gap-2">
                        OS <SortIcon field="orderNumber" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('client')}
                    >
                      <div className="flex items-center gap-2">
                        Cliente <SortIcon field="client" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Produto</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground transition-colors hidden sm:table-cell"
                      onClick={() => handleSort('quantity')}
                    >
                      <div className="flex items-center gap-2">
                        Qtd <SortIcon field="quantity" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">Técnica</TableHead>
                    <TableHead className="hidden xl:table-cell">Máquina</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground transition-colors hidden sm:table-cell"
                      onClick={() => handleSort('scheduledDate')}
                    >
                      <div className="flex items-center gap-2">
                        Data <SortIcon field="scheduledDate" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('priority')}
                    >
                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline">Prioridade</span>
                        <span className="sm:hidden">Prio</span>
                        <SortIcon field="priority" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Nenhum job pendente encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobs.map((job) => {
                      const technique = getTechniqueById(job.technique_id);
                      const machine = job.machine_id ? getMachineById(job.machine_id) : null;
                      
                      return (
                        <TableRow 
                          key={job.id} 
                          className="border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => handleJobClick(job)}
                        >
                          <TableCell className="font-medium text-foreground text-xs sm:text-sm">
                            {job.order_number}
                          </TableCell>
                          <TableCell className="text-foreground text-xs sm:text-sm max-w-[120px] truncate">{job.client}</TableCell>
                          <TableCell className="text-muted-foreground max-w-[150px] truncate hidden md:table-cell text-xs sm:text-sm">
                            {job.product}
                          </TableCell>
                          <TableCell className="text-foreground hidden sm:table-cell text-xs sm:text-sm">
                            {job.quantity.toLocaleString()}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                backgroundColor: `${technique?.color}20`,
                                borderColor: `${technique?.color}50`,
                                color: technique?.color 
                              }}
                            >
                              {technique?.short_name || technique?.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden xl:table-cell text-xs sm:text-sm">
                            {machine?.code || '-'}
                          </TableCell>
                          <TableCell className="text-foreground hidden sm:table-cell text-xs sm:text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString('pt-BR') : '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${priorityColors[job.priority]} border text-xs`}>
                              <span className="hidden sm:inline">{priorityLabels[job.priority]}</span>
                              <span className="sm:hidden">{job.priority.charAt(0).toUpperCase()}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={job.status} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
