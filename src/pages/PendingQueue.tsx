import { useState, useMemo, useRef } from "react";
import { useFuseSearch } from "@/hooks/useFuseSearch";
import { useVirtualizer } from "@tanstack/react-virtual";
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
  RotateCcw,
  Sparkles,
  Download,
  Play,
  Trash2,
  BrainCircuit,
  Zap
} from "lucide-react";
import { useSchedulingData } from "@/hooks/useSchedulingData";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DbJob, DbTechnique, DbMachine } from "@/hooks/useJobs";
import { JobStatus } from "@/types/scheduling";
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { SmartSequencingWidget } from "@/components/dashboard/SmartSequencingWidget";
import { LoadBalancingWidget } from "@/components/dashboard/LoadBalancingWidget";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useDataExport } from "@/hooks/useDataExport";

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
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<DbJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSmartSectionOpen, setIsSmartSectionOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { exportData, isExporting } = useDataExport('jobs');

  // Fetch real data from Supabase
  const { 
    jobs, 
    techniques, 
    isLoading: isLoadingJobs,
    isLoadingTechniques,
    getTechniqueById,
    getMachineById
  } = useSchedulingData();

  // Filter pending jobs (queue, ready, scheduled, delayed, rework)
  const pendingStatuses: JobStatus[] = ['queue', 'ready', 'scheduled', 'delayed', 'rework'];

  // Pre-filter by status first
  const pendingJobs = useMemo(() => {
    return jobs.filter(job => pendingStatuses.includes(job.status as JobStatus));
  }, [jobs]);

  // Apply Fuse.js fuzzy search
  const fuseSearchedJobs = useFuseSearch(pendingJobs, searchTerm, {
    keys: ['order_number', 'client', 'product'],
    threshold: 0.3,
  });

  const filteredJobs = useMemo(() => {
    return fuseSearchedJobs
      .filter(job => {
        const matchesTechnique = selectedTechnique === "all" || job.technique_id === selectedTechnique;
        const matchesStatus = selectedStatus === "all" || job.status === selectedStatus;
        const matchesPriority = selectedPriority === "all" || job.priority === selectedPriority;

        return matchesTechnique && matchesStatus && matchesPriority;
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

  // Virtualization
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredJobs.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  const handleJobClick = (dbJob: DbJob) => {
    setSelectedJob(dbJob);
    setIsModalOpen(true);
  };

  const handleSelectJob = (id: string) => {
    setSelectedJobs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(filteredJobs.map(j => j.id)));
    }
  };

  const handleBulkAction = async (action: 'production' | 'ready' | 'delete') => {
    if (selectedJobs.size === 0) return;

    try {
      if (action === 'delete') {
        const { error } = await supabase.from('jobs').delete().in('id', Array.from(selectedJobs));
        if (error) throw error;
        toast.success(`${selectedJobs.size} jobs excluídos`);
      } else {
        const updateData: Record<string, any> = { 
          status: action,
          updated_at: new Date().toISOString()
        };
        if (action === 'production') {
          updateData.actual_start_time = new Date().toISOString();
        }
        
        const { error } = await supabase.from('jobs').update(updateData).in('id', Array.from(selectedJobs));
        if (error) throw error;
        toast.success(`${selectedJobs.size} jobs movidos para "${action === 'production' ? 'Em Produção' : 'No Jeito'}"`);
      }
      
      setSelectedJobs(new Set());
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (error) {
      console.error('Error in bulk action:', error);
      toast.error('Erro ao processar ação em massa');
    }
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
        <Breadcrumbs />
        
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
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 border-primary/20 hover:bg-primary/5"
              onClick={() => exportData({ 
                fileName: `pendencias_${new Date().toISOString().split('T')[0]}`,
                filters: {
                  status: pendingStatuses,
                  ...(selectedTechnique !== 'all' && { technique_id: selectedTechnique }),
                  ...(selectedPriority !== 'all' && { priority: selectedPriority })
                }
              })}
              disabled={isExporting || filteredJobs.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              {isExporting ? 'Exportando...' : 'Exportar CSV'}
            </Button>
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

        {/* Smart Recommendations Section */}
        <Collapsible
          open={isSmartSectionOpen}
          onOpenChange={setIsSmartSectionOpen}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              Otimização de Planejamento
            </h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-2">
                {isSmartSectionOpen ? (
                  <>Ocultar <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>Ver Sugestões <ChevronDown className="h-4 w-4" /></>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="animate-accordion-down">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <SmartSequencingWidget />
              <LoadBalancingWidget />
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Dicas de Planejamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>• Agrupe jobs pela mesma cor de gravura para reduzir o tempo de setup.</p>
                  <p>• Priorize jobs urgentes, mas tente encaixá-los em grupos de cores existentes.</p>
                  <p>• Utilize o balanceamento de carga para não sobrecarregar uma única máquina.</p>
                  <p>• O sequenciamento inteligente agrupa por cor e prioridade automaticamente.</p>
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Bulk Actions Bar */}
        {selectedJobs.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 sticky top-2 z-30 backdrop-blur-md shadow-lg animate-in slide-in-from-top-4 duration-300">
            <Badge variant="secondary" className="font-bold">{selectedJobs.size} selecionados</Badge>
            <div className="h-4 w-px bg-border/50 mx-1 hidden sm:block" />
            <Button size="sm" variant="outline" className="h-7 text-[10px] uppercase font-bold tracking-wider gap-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10" onClick={() => handleBulkAction('production')}>
              <Play className="h-3 w-3" /> Iniciar Produção
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[10px] uppercase font-bold tracking-wider gap-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10" onClick={() => handleBulkAction('ready')}>
              <Package className="h-3 w-3" /> Marcar No Jeito
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[10px] uppercase font-bold tracking-wider gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => {
              if (window.confirm('Excluir permanentemente estes jobs?')) handleBulkAction('delete');
            }}>
              <Trash2 className="h-3 w-3" /> Excluir
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-[10px] uppercase font-bold tracking-wider ml-auto text-muted-foreground" onClick={() => setSelectedJobs(new Set())}>
              Limpar seleção
            </Button>
          </div>
        )}

        {/* Virtualized Table */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {/* Fixed Header */}
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="w-[40px]">
                      <input 
                        type="checkbox" 
                        checked={selectedJobs.size === filteredJobs.length && filteredJobs.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-border accent-primary"
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground transition-colors w-[100px]"
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
              </Table>

              {/* Virtualized Body */}
              {filteredJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum job pendente encontrado.
                </div>
              ) : (
                <div
                  ref={tableContainerRef}
                  className="max-h-[600px] overflow-auto"
                >
                  <div
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      width: "100%",
                      position: "relative",
                    }}
                  >
                    <Table>
                      <TableBody>
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                          const job = filteredJobs[virtualRow.index];
                          const technique = getTechniqueById(job.technique_id);
                          const machine = job.machine_id ? getMachineById(job.machine_id) : null;

                          return (
                            <TableRow
                              key={job.id}
                              data-index={virtualRow.index}
                              ref={rowVirtualizer.measureElement}
                              className="border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                              onClick={() => handleJobClick(job)}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                              }}
                            >
                              <TableCell className="w-[40px]" onClick={(e) => e.stopPropagation()}>
                                <input 
                                  type="checkbox" 
                                  checked={selectedJobs.has(job.id)}
                                  onChange={() => handleSelectJob(job.id)}
                                  className="rounded border-border accent-primary"
                                />
                              </TableCell>
                              <TableCell className="font-medium text-foreground text-xs sm:text-sm w-[100px]">
                                {job.order_number}
                              </TableCell>
                              <TableCell className="text-foreground text-xs sm:text-sm max-w-[120px] truncate">
                                {job.client}
                              </TableCell>
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
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
            
            {/* Info */}
            {filteredJobs.length > 0 && (
              <div className="px-4 py-3 border-t border-border/30 text-xs text-muted-foreground">
                {filteredJobs.length} jobs pendentes
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
