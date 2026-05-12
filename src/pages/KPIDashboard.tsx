import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useKPIs, formatDuration, KPIPeriod, KPITargets } from '@/hooks/useKPIs';
import { useOperatorProductivity } from '@/hooks/useOperatorProductivity';
import { useGoalAlerts } from '@/hooks/useGoalAlerts';
import { useBIExport } from '@/hooks/useBIExport';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  History as HistoryIcon,
  Percent,
  Factory,
  Target,
  Users,
  Cpu,
  Settings2,
  Calendar,
  Search,
  ArrowUpRight,
  Download,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { KPITooltip, KPI_DEFINITIONS } from '@/components/ui/kpi-tooltip';
import { VoiceButton } from '@/components/voice/VoiceCommands';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BrainCircuit, Sparkles, Zap } from 'lucide-react';
import { DrillDownDialog } from '@/components/bi/drilldown/DrillDownDialog';
import { useSchedulingData } from '@/hooks/useSchedulingData';


export default function KPIDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState<KPIPeriod>('all');
  const [customTargets, setCustomTargets] = useState<Partial<KPITargets>>({});
  
  const { data: kpis, isLoading: isLoadingKPIs } = useKPIs(period, customTargets);
  const { operators, isLoading: isLoadingOperators } = useOperatorProductivity('all');
  const { jobs, isLoading: isLoadingJobs } = useSchedulingData();

  const { goalAlerts } = useGoalAlerts({ enableNotifications: false });
  const { handleExport } = useBIExport({ periodJobsList: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState('');
  const [drillDownJobs, setDrillDownJobs] = useState<any[]>([]);
  
  const [visibleKPIs, setVisibleKPIs] = useState({
    completion: true,
    occupancy: true,
    loss: true,
    delayed: true
  });
  
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);


  const isLoading = isLoadingKPIs || isLoadingOperators || isLoadingJobs;

  const handleDrillDown = (title: string, segment: 'lost' | 'finished' | 'delayed' | 'production' | 'queue') => {
    setDrillDownTitle(title);
    if (jobs) {
      const filtered = jobs.filter((j: any) => {
        if (segment === 'lost') return (j.lost_pieces || 0) > 0;
        if (segment === 'finished') return j.status === 'finished';
        if (segment === 'delayed') return j.status === 'delayed';
        if (segment === 'production') return j.status === 'production';
        if (segment === 'queue') return j.status === 'scheduled' || j.status === 'queue';
        return true;
      }).map((j: any) => {
        const total = (j.produced_quantity || j.quantity || 1) + (j.lost_pieces || 0);
        return {
          id: j.id,
          order_number: j.order_number || `OS-${j.id.slice(0, 5)}`,
          product: j.product_name || 'Produto',
          status: j.status,
          quantity: j.quantity,
          lost_pieces: j.lost_pieces || 0,
          efficiency: total > 0 ? (((total - (j.lost_pieces || 0)) / total) * 100).toFixed(1) + '%' : '--'
        };
      });
      setDrillDownJobs(filtered);
      setDrillDownOpen(true);
    }
  };


  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </MainLayout>
    );
  }

  if (!kpis || !operators) {
    return (
      <MainLayout>
        <div className="p-8 flex items-center justify-center h-[50vh]">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      </MainLayout>
    );
  }

  const completionRate = kpis.totalJobs > 0 
    ? (kpis.completedJobs / kpis.totalJobs) * 100 
    : 0;

  const statusData = [
    { name: 'Finalizados', value: kpis.completedJobs, color: '#10B981' },
    { name: 'Em Produção', value: kpis.inProgressJobs, color: '#06B6D4' },
    { name: 'Atrasados', value: kpis.delayedJobs, color: 'hsl(25, 95%, 53%)' }, // Orange instead of red
    { name: 'Outros', value: kpis.totalJobs - kpis.completedJobs - kpis.inProgressJobs - kpis.delayedJobs, color: '#6B7280' },
  ].filter(d => d.value > 0);

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-fade-in-up">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold">
              <span className="gradient-text">Dashboard de KPIs</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Monitoramento estratégico de produtividade e eficiência global
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 glass-button">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Formato do Relatório</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('csv', 'Indicadores_KPI', kpis)}>
                  CSV (.csv)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf', 'Relatorio_Geral_KPI', kpis)}>
                  PDF (.pdf)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 glass-button">
                  <Calendar className="h-4 w-4" />
                  {period === 'all' ? 'Todo o período' : 
                   period === 'day' ? 'Hoje' : 
                   period === 'week' ? 'Últimos 7 dias' : 
                   period === 'month' ? 'Últimos 30 dias' : 'Último ano'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setPeriod('day')}>Hoje</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod('week')}>Últimos 7 dias</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod('month')}>Últimos 30 dias</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod('year')}>Último ano</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPeriod('all')}>Todo o período</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="glass-button h-9 w-9">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Personalizar Dashboard</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-3 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Visibilidade</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Taxa de Conclusão</span>
                      <Switch 
                        checked={visibleKPIs.completion} 
                        onCheckedChange={(val) => setVisibleKPIs(prev => ({ ...prev, completion: val }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Ocupação Média</span>
                      <Switch 
                        checked={visibleKPIs.occupancy} 
                        onCheckedChange={(val) => setVisibleKPIs(prev => ({ ...prev, occupancy: val }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Índice de Perdas</span>
                      <Switch 
                        checked={visibleKPIs.loss} 
                        onCheckedChange={(val) => setVisibleKPIs(prev => ({ ...prev, loss: val }))}
                      />
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Metas (Targets)</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-[10px]"
                        onClick={() => setIsEditingTargets(!isEditingTargets)}
                      >
                        {isEditingTargets ? 'Fechar' : 'Editar'}
                      </Button>
                    </div>
                    
                    {isEditingTargets ? (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <label className="text-[10px]">Meta de Conclusão (%)</label>
                          <Input 
                            type="number" 
                            className="h-7 text-xs" 
                            defaultValue={kpis.targets.completionRate}
                            onBlur={(e) => setCustomTargets(prev => ({ ...prev, completionRate: Number(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px]">Meta de Ocupação (%)</label>
                          <Input 
                            type="number" 
                            className="h-7 text-xs" 
                            defaultValue={kpis.targets.occupancyRate}
                            onBlur={(e) => setCustomTargets(prev => ({ ...prev, occupancyRate: Number(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px]">Meta de Perda Máx (%)</label>
                          <Input 
                            type="number" 
                            className="h-7 text-xs" 
                            defaultValue={kpis.targets.lossRate}
                            onBlur={(e) => setCustomTargets(prev => ({ ...prev, lossRate: Number(e.target.value) }))}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-muted/30 p-2 rounded text-center">
                          <p className="text-[10px] text-muted-foreground">Conclusão</p>
                          <p className="text-xs font-bold">{kpis.targets.completionRate}%</p>
                        </div>
                        <div className="bg-muted/30 p-2 rounded text-center">
                          <p className="text-[10px] text-muted-foreground">Ocupação</p>
                          <p className="text-xs font-bold">{kpis.targets.occupancyRate}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <VoiceButton />
          </div>
        </div>

        <div id="kpi-dashboard-content" className="space-y-6">

        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="machines">Máquinas</TabsTrigger>
            <TabsTrigger value="operators">Operadores</TabsTrigger>
            <TabsTrigger value="alerts">Alertas & Desvios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {visibleKPIs.completion && (
                <KPITooltip 
                  title="Taxa de Conclusão" 
                  description="Percentual de jobs finalizados em relação ao total."
                  formula="Jobs Concluídos / Total de Jobs"
                  target={`≥ ${kpis.targets.completionRate}%`}
                >
                  <Card className="glass-card hover-scale relative overflow-hidden group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Settings2 className="h-3 w-3" /></Button>
                    </div>
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-muted-foreground">Taxa de Conclusão</p>
                          <p className="text-2xl sm:text-3xl font-bold">{completionRate.toFixed(1)}%</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant="outline" className={cn(
                              "h-5 px-1 text-[10px] gap-0.5 border-none bg-transparent",
                              kpis.comparison.completionRateDiff >= 0 ? "text-green-400" : "text-primary"
                            )}>
                              {kpis.comparison.completionRateDiff >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {Math.abs(kpis.comparison.completionRateDiff).toFixed(1)}%
                            </Badge>
                            <span className="text-[10px] text-muted-foreground truncate">vs anterior</span>
                          </div>
                        </div>
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                        </div>
                      </div>
                      <div className="relative mt-3">
                        <Progress value={completionRate} className="h-2 [&>div]:bg-green-500" />
                        <div className="absolute top-[-4px] w-[2px] h-4 bg-foreground/20" style={{ left: `${kpis.targets.completionRate}%` }} title={`Meta: ${kpis.targets.completionRate}%`} />
                      </div>
                    </CardContent>
                  </Card>
                </KPITooltip>
              )}

              {visibleKPIs.occupancy && (
                <KPITooltip 
                  title="Ocupação Média" 
                  description="Percentual médio de utilização das máquinas."
                  formula="Tempo em Uso / Tempo Disponível"
                  target={`≥ ${kpis.targets.occupancyRate}%`}
                >
                  <Card className="glass-card hover-scale group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Settings2 className="h-3 w-3" /></Button>
                    </div>
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-muted-foreground">Ocupação Média</p>
                          <p className="text-2xl sm:text-3xl font-bold">{kpis.averageOccupancy.toFixed(1)}%</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant="outline" className={cn(
                              "h-5 px-1 text-[10px] gap-0.5 border-none bg-transparent",
                              kpis.comparison.occupancyDiff >= 0 ? "text-green-400" : "text-primary"
                            )}>
                              {kpis.comparison.occupancyDiff >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {Math.abs(kpis.comparison.occupancyDiff).toFixed(1)}%
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">vs anterior</span>
                          </div>
                        </div>
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          <Factory className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                        </div>
                      </div>
                      <div className="relative mt-3">
                        <Progress value={kpis.averageOccupancy} className="h-2 [&>div]:bg-cyan-500" />
                        <div className="absolute top-[-4px] w-[2px] h-4 bg-foreground/20" style={{ left: `${kpis.targets.occupancyRate}%` }} title={`Meta: ${kpis.targets.occupancyRate}%`} />
                      </div>
                    </CardContent>
                  </Card>
                </KPITooltip>
              )}

              {visibleKPIs.loss && (
                <KPITooltip {...KPI_DEFINITIONS.lossRate}>
                  <Card className="glass-card hover-scale group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Settings2 className="h-3 w-3" /></Button>
                    </div>
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-muted-foreground">Índice de Perdas</p>
                          <p className={cn(
                            "text-2xl sm:text-3xl font-bold",
                            kpis.lossRate > 5 ? "text-primary" : kpis.lossRate > 2 ? "text-amber-400" : "text-green-400"
                          )}>
                            {kpis.lossRate.toFixed(2)}%
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant="outline" className={cn(
                              "h-5 px-1 text-[10px] gap-0.5 border-none bg-transparent",
                              kpis.comparison.lossRateDiff <= 0 ? "text-green-400" : "text-primary"
                            )}>
                              {kpis.comparison.lossRateDiff <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                              {Math.abs(kpis.comparison.lossRateDiff).toFixed(2)}%
                            </Badge>
                            <span className="text-[10px] text-muted-foreground truncate">vs anterior</span>
                          </div>
                        </div>
                        <div className={cn(
                          "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                          kpis.lossRate > 5 ? "bg-primary/20" : kpis.lossRate > 2 ? "bg-amber-500/20" : "bg-green-500/20"
                        )}>
                          {kpis.lossRate > 2 ? (
                            <TrendingDown className={cn("h-5 w-5 sm:h-6 sm:w-6", kpis.lossRate > 5 ? "text-primary" : "text-amber-400")} />
                          ) : (
                            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </KPITooltip>
              )}

              {visibleKPIs.delayed && (
                <Card className="glass-card hover-scale">
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-muted-foreground">Jobs Atrasados</p>
                        <p className={cn(
                          "text-2xl sm:text-3xl font-bold",
                          kpis.delayedJobs > 0 ? "text-primary" : "text-green-400"
                        )}>
                          {kpis.delayedJobs}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">requerem atenção</p>
                      </div>
                      <div className={cn(
                        "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                        kpis.delayedJobs > 0 ? "bg-primary/20" : "bg-green-500/20"
                      )}>
                        <AlertTriangle className={cn("h-5 w-5 sm:h-6 sm:w-6", kpis.delayedJobs > 0 ? "text-primary" : "text-green-400")} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Performance Evolution (Historical) */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      Histórico de Performance
                    </CardTitle>
                    <CardDescription>Evolução semanal de eficiência e produtividade</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">LIVE TRACKING</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={kpis.performanceHistory}>
                      <defs>
                        <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Area type="monotone" dataKey="efficiency" stroke="#10B981" fillOpacity={1} fill="url(#colorEff)" name="Eficiência (%)" />
                      <Area type="monotone" dataKey="productivity" stroke="#06B6D4" fillOpacity={1} fill="url(#colorProd)" name="Produtividade (peças)" />
                      {/* Target line for efficiency */}
                      <Bar dataKey="none" /> {/* Spacer */}
                      <Area 
                        type="step" 
                        dataKey={() => 85} 
                        stroke="#94a3b8" 
                        strokeDasharray="5 5" 
                        fill="none" 
                        name="Meta Eficiência (85%)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-400" />
                    Distribuição de Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Today Summary */}
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Volume de Produção (Hoje)
                  </CardTitle>
                  <CardDescription>Resumo de jobs processados nas últimas 24h</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/20 flex flex-col items-center justify-center text-center">
                      <p className="text-3xl font-bold text-primary">{kpis.todayStats.scheduled}</p>
                      <p className="text-sm text-muted-foreground font-medium">Agendados</p>
                    </div>
                    <div className="p-4 rounded-xl bg-cyan-500/10 flex flex-col items-center justify-center text-center">
                      <p className="text-3xl font-bold text-cyan-400">{kpis.todayStats.inProgress}</p>
                      <p className="text-sm text-muted-foreground font-medium">Em Produção</p>
                    </div>
                    <div className="p-4 rounded-xl bg-green-500/10 flex flex-col items-center justify-center text-center">
                      <p className="text-3xl font-bold text-green-400">{kpis.todayStats.completed}</p>
                      <p className="text-sm text-muted-foreground font-medium">Concluídos</p>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-center">
                      <p className="text-3xl font-bold text-primary">{kpis.todayStats.delayed}</p>
                      <p className="text-sm text-muted-foreground font-medium">Atrasados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Predictive Insights */}
            <Card className="glass-card border-primary/30 bg-primary/5 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary animate-pulse" />
                    Projeção de Performance (AI Insights)
                  </CardTitle>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1">
                    <Sparkles className="h-3 w-3" />
                    PREDICTIVE
                  </Badge>
                </div>
                <CardDescription>Tendências baseadas no histórico recente e volume atual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={kpis.predictions}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} 
                        />
                        <Bar dataKey="estimatedVolume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Volume Estimado" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">Insight da Semana</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Projeção indica um aumento de {Math.abs(kpis.comparison.volumeDiff).toFixed(1)}% na demanda. 
                        Recomendado revisar manutenção preventiva para evitar gargalos em {kpis.predictions[2].date}.
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-2">
                      <span className="text-xs text-muted-foreground">Confiança do Modelo</span>
                      <span className="text-xs font-bold">{(kpis.predictions[0].confidence * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={kpis.predictions[0].confidence * 100} className="h-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="machines" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass-card lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    Anomalias por Máquina
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {kpis.anomalies.filter(a => a.id.startsWith('loss-m-') || a.id.startsWith('occ-m-')).length > 0 ? (
                      kpis.anomalies
                        .filter(a => a.id.startsWith('loss-m-') || a.id.startsWith('occ-m-'))
                        .map(anomaly => (
                          <div key={anomaly.id} className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                            <p className="text-xs font-bold">{anomaly.entityName}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{anomaly.message}</p>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2 opacity-20" />
                        <p className="text-xs text-muted-foreground">Máquinas operando normalmente</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-cyan-400" />
                        Produtividade por Máquina
                      </CardTitle>
                      <CardDescription>Comparativo de performance e ocupação entre equipamentos</CardDescription>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Filtrar máquinas..." 
                        className="pl-8 h-9" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Máquina</th>
                          <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">Jobs</th>
                          <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">Peças</th>
                          <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">Perdas</th>
                          <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">OEE Estimado</th>
                          <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kpis.productivityByMachine
                          .filter(m => m.machineName.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((machine) => (
                          <tr 
                            key={machine.machineId} 
                            className="border-b border-border/30 hover:bg-muted/10 transition-colors cursor-pointer group"
                            onClick={() => setSelectedMachine(machine)}
                          >
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">{machine.machineName}</span>
                                <span className="text-xs text-muted-foreground uppercase">{machine.machineId.split('-')[0]}</span>
                              </div>
                            </td>
                            <td className="text-center py-4 px-4">
                              <Badge variant="secondary" className="bg-muted/30">{machine.jobCount}</Badge>
                            </td>
                            <td className="text-center py-4 px-4 text-sm">{machine.totalPieces.toLocaleString()}</td>
                            <td className="text-center py-4 px-4">
                              <span className={cn(
                                "text-sm font-medium",
                                machine.lossRate > 5 ? "text-primary" : machine.lossRate > 0 ? "text-amber-400" : "text-green-400"
                              )}>
                                {machine.lossRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <Progress value={85 - (machine.lossRate * 2)} className="w-20 h-2" />
                                <span className="text-xs font-medium">{(85 - (machine.lossRate * 2)).toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="text-right py-4 px-4">
                              <div className="flex items-center justify-end gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-medium text-green-400">Ativa</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operators" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-amber-400" />
                      Ranking de Produtividade (Operadores)
                    </CardTitle>
                    <CardDescription>Top performers por score de eficiência e qualidade</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {operators.slice(0, 5).map((op, idx) => (
                        <div key={op.operatorId} className="flex items-center justify-between p-3 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="font-display font-bold text-muted-foreground w-4 text-center">
                              {idx + 1}
                            </div>
                            <Avatar className="h-10 w-10 border-2 border-primary/20">
                              <AvatarImage src={op.avatarUrl || undefined} />
                              <AvatarFallback>{op.operatorName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">{op.operatorName}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{op.totalJobsCompleted} jobs finalizados</span>
                                <span className="text-[10px] py-0.5 px-1.5 rounded-full bg-primary/10 text-primary uppercase font-bold tracking-wider">
                                  {op.efficiencyScore > 90 ? 'Master' : 'Pro'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg font-bold gradient-text">{op.efficiencyScore.toFixed(0)}%</span>
                              <TrendingUp className="h-3 w-3 text-green-400" />
                            </div>
                            <Progress value={op.efficiencyScore} className="h-1.5 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base">Tempo Médio de Produção</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {kpis.productivityByTechnique.slice(0, 4).map(tech => (
                      <div key={tech.techniqueId} className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{tech.techniqueName}</span>
                          <span className="text-xs text-muted-foreground">{tech.jobCount} execuções</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{formatDuration(Math.round(tech.avgDuration))}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                 <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-400" />
                      Performance por Produto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {kpis.productivityByProduct.slice(0, 3).map(prod => (
                      <div key={prod.productName} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate max-w-[120px]">{prod.productName}</span>
                          <span className="text-xs font-mono">{prod.totalPieces.toLocaleString()} pcs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.max(5, 100 - prod.lossRate)} className="h-1 flex-1" />
                          <span className="text-[10px] text-muted-foreground">{prod.lossRate.toFixed(1)}% perdas</span>
                        </div>
                      </div>
                    ))}
                    {kpis.productivityByProduct.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">Sem dados de produtos</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-card bg-primary/5 border-primary/20 overflow-hidden relative">
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <Target className="h-32 w-32" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-base">Meta Global de Qualidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                      <div className="relative h-24 w-24">
                        <svg className="h-24 w-24 transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                          <circle 
                            cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                            strokeDasharray={251.2} 
                            strokeDashoffset={251.2 * (1 - (100 - kpis.lossRate) / 100)} 
                            className="text-green-500" 
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <span className="text-xl font-bold">{(100 - kpis.lossRate).toFixed(1)}%</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium mt-2">Índice de Peças Boas</p>
                      <Badge variant="outline" className="border-green-500/50 text-green-400">DENTRO DA META</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            {goalAlerts.length > 0 && (
              <Card className="glass-card border-amber-500/20 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-500">
                    <Target className="h-5 w-5" />
                    Alertas de Metas de Operadores
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goalAlerts.map(alert => (
                    <div key={alert.goalId} className={cn(
                      "p-4 rounded-xl border flex items-center justify-between",
                      alert.riskLevel === 'critical' ? "bg-red-500/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20"
                    )}>
                      <div>
                        <p className="font-bold text-sm">{alert.operatorName}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-lg font-bold",
                          alert.riskLevel === 'critical' ? "text-red-500" : "text-amber-500"
                        )}>
                          {alert.progressPercentage.toFixed(0)}%
                        </span>
                        <Progress value={alert.progressPercentage} className="h-1 w-16 mt-1" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Alertas de Desvio & Anomalias
                </CardTitle>
                <CardDescription>Detecção automática de gargalos e quedas de performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {kpis.anomalies.map(anomaly => (
                    <div key={anomaly.id} className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border animate-in fade-in slide-in-from-left-4 duration-300",
                      anomaly.severity === 'high' ? "border-primary/40 bg-primary/10" : "border-amber-500/20 bg-amber-500/5"
                    )}>
                      <div className={cn(
                        "p-2 rounded-lg",
                        anomaly.severity === 'high' ? "bg-primary/20" : "bg-amber-500/20"
                      )}>
                        {anomaly.type === 'loss' ? <Percent className={cn("h-5 w-5", anomaly.severity === 'high' ? "text-primary" : "text-amber-500")} /> : 
                         anomaly.type === 'delay' ? <Clock className={cn("h-5 w-5", anomaly.severity === 'high' ? "text-primary" : "text-amber-500")} /> : 
                         <AlertTriangle className={cn("h-5 w-5", anomaly.severity === 'high' ? "text-primary" : "text-amber-500")} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm">
                            {anomaly.type === 'loss' ? 'Perda Excessiva' : 
                             anomaly.type === 'delay' ? 'Risco de Atraso' : 'Anomalia'}
                          </h4>
                          <span className="text-[10px] text-muted-foreground uppercase">Tempo real</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {anomaly.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] h-5">{anomaly.entityName}</Badge>
                          <Button variant="link" size="sm" className="h-auto p-0 text-primary text-xs">
                            Analisar causa raiz <ArrowUpRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {kpis.anomalies.length === 0 && (
                    <div className="text-center py-12 space-y-3">
                      <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="text-sm font-medium">Nenhum desvio crítico detectado</p>
                      <p className="text-xs text-muted-foreground">O sistema está operando dentro dos parâmetros de normalidade.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>

    {/* Drill-down Dialog */}
    <Dialog open={!!selectedMachine} onOpenChange={() => setSelectedMachine(null)}>
      <DialogContent className="max-w-2xl glass-card border-border/50">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{selectedMachine?.machineName}</DialogTitle>
              <DialogDescription>ID: {selectedMachine?.machineId}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
            <p className="text-xs text-muted-foreground uppercase mb-1">Total de Peças</p>
            <p className="text-2xl font-bold">{selectedMachine?.totalPieces.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
            <p className="text-xs text-muted-foreground uppercase mb-1">Índice de Perdas</p>
            <p className={cn(
              "text-2xl font-bold",
              selectedMachine?.lossRate > 5 ? "text-primary" : "text-green-400"
            )}>
              {selectedMachine?.lossRate.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <HistoryIcon className="h-4 w-4" />
            Performance Recente
          </h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpis.performanceHistory.slice(-5)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="efficiency" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setSelectedMachine(null)}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    </MainLayout>
  );
}
