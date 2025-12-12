import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { JobDetailsModal } from "@/components/jobs/JobDetailsModal";
import { 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  Calendar,
  Package,
  User,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  RotateCcw
} from "lucide-react";
import { mockJobs, techniques, getMachineById, getTechniqueById } from "@/data/mockData";
import { Job, JobStatus, TechniqueId } from "@/types/scheduling";

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

export default function PendingQueue() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTechnique, setSelectedTechnique] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('scheduledDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter pending jobs (queue, ready, scheduled, delayed, rework)
  const pendingStatuses: JobStatus[] = ['queue', 'ready', 'scheduled', 'delayed', 'rework'];

  const filteredJobs = useMemo(() => {
    return mockJobs
      .filter(job => pendingStatuses.includes(job.status))
      .filter(job => {
        const matchesSearch = 
          job.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.product.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesTechnique = selectedTechnique === "all" || job.techniqueId === selectedTechnique;
        const matchesStatus = selectedStatus === "all" || job.status === selectedStatus;
        const matchesPriority = selectedPriority === "all" || job.priority === selectedPriority;

        return matchesSearch && matchesTechnique && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        let comparison = 0;
        
        switch (sortField) {
          case 'orderNumber':
            comparison = a.orderNumber.localeCompare(b.orderNumber);
            break;
          case 'client':
            comparison = a.client.localeCompare(b.client);
            break;
          case 'scheduledDate':
            comparison = new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
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
  }, [mockJobs, searchTerm, selectedTechnique, selectedStatus, selectedPriority, sortField, sortDirection]);

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

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <JobDetailsModal 
        job={selectedJob} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lista de Pendências</h1>
          <p className="text-muted-foreground mt-1">Backlog e jobs aguardando produção</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-muted/50 text-foreground border-border">
            <Package className="h-4 w-4 mr-1" />
            {stats.total} pendentes
          </Badge>
          {stats.urgent > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {stats.urgent} urgentes
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <Package className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500/20">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.urgent}</p>
              <p className="text-sm text-muted-foreground">Urgentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-500/20">
              <Clock className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.delayed}</p>
              <p className="text-sm text-muted-foreground">Atrasados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <RotateCcw className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.rework}</p>
              <p className="text-sm text-muted-foreground">Retrabalho</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtros Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar OS, cliente, produto..."
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
                <SelectItem value="all">Todas as Técnicas</SelectItem>
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
                <SelectItem value="all">Todos os Status</SelectItem>
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
                <SelectItem value="all">Todas as Prioridades</SelectItem>
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
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-0">
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
                <TableHead>Produto</TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center gap-2">
                    Qtd <SortIcon field="quantity" />
                  </div>
                </TableHead>
                <TableHead>Técnica</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-foreground transition-colors"
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
                    Prioridade <SortIcon field="priority" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhum job pendente encontrado com os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => {
                  const technique = getTechniqueById(job.techniqueId);
                  const machine = getMachineById(job.machineId);
                  
                  return (
                    <TableRow 
                      key={job.id} 
                      className="border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleJobClick(job)}
                    >
                      <TableCell className="font-medium text-foreground">
                        {job.orderNumber}
                      </TableCell>
                      <TableCell className="text-foreground">{job.client}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {job.product}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {job.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            backgroundColor: `${technique?.color}20`,
                            borderColor: `${technique?.color}50`,
                            color: technique?.color 
                          }}
                        >
                          {technique?.shortName || technique?.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {machine?.code || '-'}
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(job.scheduledDate).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${priorityColors[job.priority]} border`}>
                          {priorityLabels[job.priority]}
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
        </CardContent>
      </Card>
    </div>
  );
}
