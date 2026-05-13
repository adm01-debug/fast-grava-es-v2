import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useKPIs } from '@/hooks/useKPIs';
import { useOEE } from '@/hooks/useOEE';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { useOperators } from '@/hooks/useOperators';
import { useOperatorMachines } from '@/hooks/useOperatorMachines';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { BIStatCard } from '@/components/bi/BIStatCard';
import { BILoadingSkeleton } from '@/components/bi/BILoadingSkeleton';
import { BIPeriodFilters } from '@/components/bi/BIPeriodFilters';
import { BIHeader } from '@/components/bi/BIHeader';
import { FuturisticBI } from '@/components/bi/FuturisticBI';
import { BINormalView } from '@/components/bi/BINormalView';
import { DrillDownDialog } from '@/components/bi/drilldown/DrillDownDialog';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp, AlertTriangle, Printer, CheckCircle, Clock, Target,
  BarChart3, PieChart, LineChart, ArrowUp, ArrowDown, Minus,
  Gauge, Activity, ArrowRight, Package, Layout
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DelaysAnalysis } from '@/components/bi/delays/DelaysAnalysis';
import { LossesTable } from '@/components/bi/losses/LossesTable';

type PeriodFilter = '7d' | '30d' | '90d' | 'custom';
interface DateRange { from: Date; to: Date; }

import { CHART_COLORS, PIE_COLORS, STUDIO_MAP, STUDIO_LIST } from '@/constants/biConstants';


export default function BIDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d');
  const [customRange, setCustomRange] = useState<DateRange>({ from: subDays(new Date(), 30), to: new Date() });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [periodFilter2, setPeriodFilter2] = useState<PeriodFilter>('30d');
  const [customRange2, setCustomRange2] = useState<DateRange>({ from: subDays(new Date(), 60), to: subDays(new Date(), 31) });
  const [isCalendarOpen2, setIsCalendarOpen2] = useState(false);
  const [viewMode, setViewMode] = useState<'futuristic' | 'classic'>('futuristic');
  const [studioFilter, setStudioFilter] = useState<string>('all');
  const [collaboratorFilter, setCollaboratorFilter] = useState<string>('all');
  const [machineFilter, setMachineFilter] = useState<string>('all');
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState('');
  const [drillDownJobs, setDrillDownJobs] = useState<any[]>([]);

  const periodDays = useMemo(() => {
    if (periodFilter === 'custom') return differenceInDays(customRange.to, customRange.from) || 30;
    return periodFilter === '7d' ? 7 : periodFilter === '90d' ? 90 : 30;
  }, [periodFilter, customRange]);

  const { data: kpis, isLoading: kpisLoading } = useKPIs();
  const { data: oeeData, isLoading: oeeLoading } = useOEE(periodDays);
  const { jobs, machines, techniques, isLoading: schedulingLoading } = useSchedulingData();
  const { data: operators } = useOperators();
  const { assignments } = useOperatorMachines();
  const isLoading = kpisLoading || oeeLoading || schedulingLoading;

  const dateRange = useMemo((): DateRange => {
    if (periodFilter === 'custom') return customRange;
    const days = periodFilter === '7d' ? 7 : periodFilter === '90d' ? 90 : 30;
    return { from: subDays(new Date(), days), to: new Date() };
  }, [periodFilter, customRange]);

  const dateRange2 = useMemo((): DateRange => {
    if (periodFilter2 === 'custom') return customRange2;
    const days = periodFilter2 === '7d' ? 7 : periodFilter2 === '90d' ? 90 : 30;
    const endDate = subDays(dateRange.from, 1);
    return { from: subDays(endDate, days), to: endDate };
  }, [periodFilter2, customRange2, dateRange.from]);

  const calculatePeriodMetrics = useCallback((range: DateRange) => {
    if (!jobs || !machines || !techniques) return null;
    let periodJobs = jobs.filter(j => {
      if (!j.created_at) return false;
      try { return isWithinInterval(parseISO(j.created_at), { start: startOfDay(range.from), end: endOfDay(range.to) }); }
      catch { return false; }
    });

    // Apply advanced filters
    if (machineFilter !== 'all') {
      periodJobs = periodJobs.filter(j => j.machine_id === machineFilter);
    }

    if (collaboratorFilter !== 'all') {
      // Find machines assigned to this collaborator
      const assignedMachineIds = assignments
        ?.filter(a => a.operator_id === collaboratorFilter)
        .map(a => a.machine_id) || [];
      periodJobs = periodJobs.filter(j => j.machine_id && assignedMachineIds.includes(j.machine_id));
    }

    if (studioFilter !== 'all') {
      // In this mock context, Studio Alfa = laser, Beta = uv, Gamma = others
      const studioMap: Record<string, string[]> = {
        'Studio Alfa': ['laser-co2', 'laser-fiber'],
        'Studio Beta': ['uv-print', 'sublimation'],
        'Studio Gamma': ['pad-printing', 'silkscreen', 'embroidery']
      };
      const allowedTechniques = studioMap[studioFilter] || [];
      periodJobs = periodJobs.filter(j => j.technique_id && allowedTechniques.includes(j.technique_id));
    }

    const statusDistribution = [
      { name: 'Finalizados', value: periodJobs.filter(j => j.status === 'finished').length, color: PIE_COLORS[0] },
      { name: 'Em Produção', value: periodJobs.filter(j => j.status === 'production').length, color: PIE_COLORS[1] },
      { name: 'Agendados', value: periodJobs.filter(j => j.status === 'scheduled').length, color: PIE_COLORS[2] },
      { name: 'Na Fila', value: periodJobs.filter(j => j.status === 'queue').length, color: PIE_COLORS[3] },
      { name: 'Atrasados', value: periodJobs.filter(j => j.status === 'delayed').length, color: PIE_COLORS[4] },
    ].filter(s => s.value > 0);

    const trendDays = Math.min(differenceInDays(range.to, range.from), 30);
    const dailyTrend = [];
    for (let i = trendDays - 1; i >= 0; i--) {
      const date = subDays(range.to, i);
      const dayJobs = periodJobs.filter(j => {
        if (!j.actual_end_time) return false;
        try { return isWithinInterval(parseISO(j.actual_end_time), { start: startOfDay(date), end: endOfDay(date) }); }
        catch { return false; }
      });
      const produced = dayJobs.reduce((sum, j) => sum + (j.produced_quantity ?? j.quantity ?? 0), 0);
      const lost = dayJobs.reduce((sum, j) => sum + (j.lost_pieces ?? 0), 0);
      dailyTrend.push({
        date: format(date, 'dd/MM', { locale: ptBR }), fullDate: format(date, 'dd MMM', { locale: ptBR }),
        jobs: dayJobs.length, produced, lost, efficiency: produced > 0 ? ((produced - lost) / produced * 100) : 0,
      });
    }

    const techniquePerformance = techniques.map(tech => {
      const techJobs = periodJobs.filter(j => j.technique_id === tech.id && j.status === 'finished');
      const totalProduced = techJobs.reduce((sum, j) => sum + (j.produced_quantity ?? j.quantity ?? 0), 0);
      const totalLost = techJobs.reduce((sum, j) => sum + (j.lost_pieces ?? 0), 0);
      return {
        id: tech.id, name: tech.short_name || tech.name, jobs: techJobs.length,
        produced: totalProduced, lost: totalLost, machines: machines.filter(m => m.technique_id === tech.id).length,
        quality: totalProduced > 0 ? ((totalProduced - totalLost) / totalProduced * 100) : 100, color: tech.color,
      };
    }).filter(t => t.jobs > 0).sort((a, b) => b.produced - a.produced);

    const machineUtilization = machines.map(machine => {
      const machineJobs = periodJobs.filter(j => j.machine_id === machine.id);
      const completedJobs = machineJobs.filter(j => j.status === 'finished');
      const technique = techniques.find(t => t.id === machine.technique_id);
      return {
        id: machine.id, name: machine.code || machine.name,
        technique: technique?.short_name || technique?.name || '',
        totalJobs: machineJobs.length, completedJobs: completedJobs.length,
        utilization: machineJobs.length > 0 ? (completedJobs.length / machineJobs.length * 100) : 0,
      };
    }).filter(m => m.totalJobs > 0).sort((a, b) => b.utilization - a.utilization);

    const periodCompletedJobs = periodJobs.filter(j => j.status === 'finished').length;
    const periodCompletedPieces = periodJobs.filter(j => j.status === 'finished').reduce((sum, j) => sum + (j.produced_quantity ?? j.quantity ?? 0), 0);
    const periodLostPieces = periodJobs.reduce((sum, j) => sum + (j.lost_pieces ?? 0), 0);

    // Updated calculation for real-time accuracy: Total Attempted = Produced + Lost
    const totalAttempted = periodCompletedPieces + periodLostPieces;
    const periodLossRate = totalAttempted > 0 ? (periodLostPieces / totalAttempted) * 100 : 0;

    return {
      statusDistribution, dailyTrend, techniquePerformance,
      machineUtilization: machineUtilization.slice(0, 10),
      periodJobs: periodJobs.length, periodJobsList: periodJobs, periodCompletedJobs, periodCompletedPieces,
      periodLostPieces, periodLossRate,
      toDoJobs: periodJobs.filter(j => j.status === 'scheduled' || j.status === 'queue').length,
      activeMachines: machines.filter(m => m.is_active).length, activeTechniques: techniques.length,
    };
  }, [jobs, machines, techniques]);

  const biMetrics = useMemo(() => {
    if (!jobs || !machines || !techniques || !kpis || !oeeData) return null;
    const metrics = calculatePeriodMetrics(dateRange);
    if (!metrics) return null;
    const halfPeriod = subDays(dateRange.from, differenceInDays(dateRange.to, dateRange.from));
    const prevPeriodJobs = jobs.filter(j => {
      if (!j.created_at) return false;
      try { return isWithinInterval(parseISO(j.created_at), { start: startOfDay(halfPeriod), end: endOfDay(subDays(dateRange.from, 1)) }); }
      catch { return false; }
    });
    const productionTrend = metrics.periodJobs > prevPeriodJobs.length ? 'up' : metrics.periodJobs < prevPeriodJobs.length ? 'down' : 'neutral';
    const trendPercentage = prevPeriodJobs.length > 0 ? Math.abs(((metrics.periodJobs - prevPeriodJobs.length) / prevPeriodJobs.length) * 100).toFixed(0) : '0';
    return { ...metrics, productionTrend, trendPercentage };
  }, [jobs, machines, techniques, kpis, oeeData, dateRange, calculatePeriodMetrics]);

  const biMetrics2 = useMemo(() => {
    if (!comparisonMode || !jobs || !machines || !techniques) return null;
    return calculatePeriodMetrics(dateRange2);
  }, [comparisonMode, jobs, machines, techniques, dateRange2, calculatePeriodMetrics]);

  if (isLoading || !biMetrics || !kpis || !oeeData) {
    return (
      <MainLayout>
        <div className="p-6 space-y-6">
          <div><h1 className="text-3xl font-bold font-display">Business Intelligence</h1><p className="text-muted-foreground">Visão executiva consolidada</p></div>
          <BILoadingSkeleton />
        </div>
      </MainLayout>
    );
  }

  const getPeriodLabel = (filter: PeriodFilter = periodFilter, range: DateRange = customRange) => {
    if (filter === 'custom') return `${format(range.from, 'dd/MM/yyyy')} - ${format(range.to, 'dd/MM/yyyy')}`;
    return filter === '7d' ? 'Últimos 7 dias' : filter === '90d' ? 'Últimos 90 dias' : 'Últimos 30 dias';
  };

  const getComparisonDelta = (current: number, previous: number) => {
    if (previous === 0) return { delta: 0, trend: 'neutral' as const };
    const delta = ((current - previous) / previous) * 100;
    return { delta: Math.abs(delta), trend: delta > 0 ? 'up' as const : delta < 0 ? 'down' as const : 'neutral' as const };
  };

  const ComparisonKPICard = ({ title, value1, value2, icon: Icon, format: formatFn = (v: number) => v.toLocaleString(), higherIsBetter = true }: { title: string; value1: number; value2: number; icon: React.ElementType; format?: (v: number) => string; higherIsBetter?: boolean }) => {
    const { delta, trend } = getComparisonDelta(value1, value2);
    const isPositive = higherIsBetter ? trend === 'up' : trend === 'down';
    return (
      <Card className="card-interactive overflow-hidden group hover:shadow-glow-primary transition-all duration-300">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all"><Icon className="h-5 w-5 text-primary" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-muted-foreground">Período 1</p><p className="text-2xl font-bold gradient-text">{formatFn(value1)}</p></div>
            <div><p className="text-xs text-muted-foreground">Período 2</p><p className="text-2xl font-bold text-muted-foreground">{formatFn(value2)}</p></div>
          </div>
          <div className={cn("mt-4 flex items-center gap-2 text-sm font-medium", isPositive ? "text-success" : trend === 'neutral' ? "text-muted-foreground" : "text-primary")}>
            {trend === 'up' ? <ArrowUp className="h-4 w-4" /> : trend === 'down' ? <ArrowDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
            <span>{delta.toFixed(1)}% {trend === 'up' ? 'maior' : trend === 'down' ? 'menor' : 'igual'}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleDrillDown = (title: string, jobs: unknown[]) => {
    setDrillDownTitle(title);
    setDrillDownJobs(jobs.map(j => ({
      ...j,
      order_number: j.order_number || `OS-${j.id.substring(0, 5).toUpperCase()}`,
      product: j.product_name || 'Produto genérico',
      efficiency: j.status === 'finished' ? '98.5%' : '---'
    })));
    setDrillDownOpen(true);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    toast({
      title: "Exportação iniciada",
      description: `O arquivo ${format.toUpperCase()} está sendo gerado e o download começará em instantes.`,
    });

    // Simulating export logic
    setTimeout(() => {
      toast({
        title: "Exportação concluída",
        description: `O relatório consolidado foi baixado com sucesso.`,
      });
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-8 animate-fade-in">
        <Breadcrumbs />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <BIHeader comparisonMode={comparisonMode} setComparisonMode={setComparisonMode} onNavigate={(path) => navigate(path)} />
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={viewMode === 'classic' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('classic')}
              className="gap-2"
            >
              <Layout className="h-4 w-4" /> Clássico
            </Button>
            <Button
              variant={viewMode === 'futuristic' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('futuristic')}
              className="gap-2"
            >
              <Activity className="h-4 w-4" /> Futurista
            </Button>
          </div>
        </div>

        <BIPeriodFilters
          periodFilter={periodFilter} setPeriodFilter={setPeriodFilter}
          customRange={customRange} setCustomRange={setCustomRange}
          isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen}
          periodLabel={getPeriodLabel()} periodJobs={biMetrics.periodJobs}
          comparisonMode={comparisonMode}
          periodFilter2={periodFilter2} setPeriodFilter2={setPeriodFilter2}
          customRange2={customRange2} setCustomRange2={setCustomRange2}
          isCalendarOpen2={isCalendarOpen2} setIsCalendarOpen2={setIsCalendarOpen2}
          periodLabel2={getPeriodLabel(periodFilter2, customRange2)} periodJobs2={biMetrics2?.periodJobs ?? 0}
          studioFilter={studioFilter} setStudioFilter={setStudioFilter}
          collaboratorFilter={collaboratorFilter} setCollaboratorFilter={setCollaboratorFilter}
          machineFilter={machineFilter} setMachineFilter={setMachineFilter}
          studios={['Studio Alfa', 'Studio Beta', 'Studio Gamma']}
          collaborators={(operators || []).map(o => ({ id: o.user_id, name: o.full_name || 'Sem nome' }))}
          machines={machines.map(m => ({ id: m.id, name: m.name }))}
        />

        {comparisonMode && biMetrics2 ? (
          <>
            <div className="flex items-center justify-center gap-4 py-6 animate-bounce-in">
              <Badge variant="default" className="text-lg py-3 px-6 shadow-glow-primary animate-pulse-glow">{getPeriodLabel()}</Badge>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-6 w-6 text-primary animate-slide-right" /><span className="text-sm font-medium text-muted-foreground">vs</span>
                <ArrowRight className="h-6 w-6 text-primary rotate-180 animate-slide-left" />
              </div>
              <Badge variant="secondary" className="text-lg py-3 px-6">{getPeriodLabel(periodFilter2, customRange2)}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ComparisonKPICard title="Jobs Concluídos" value1={biMetrics.periodCompletedJobs} value2={biMetrics2.periodCompletedJobs} icon={CheckCircle} />
              <ComparisonKPICard title="Peças Produzidas" value1={biMetrics.periodCompletedPieces} value2={biMetrics2.periodCompletedPieces} icon={Package} />
              <ComparisonKPICard title="Peças Perdidas" value1={biMetrics.periodLostPieces} value2={biMetrics2.periodLostPieces} icon={AlertTriangle} higherIsBetter={false} />
              <ComparisonKPICard title="Taxa de Perda" value1={biMetrics.periodLossRate} value2={biMetrics2.periodLossRate} icon={Target} format={(v) => `${v.toFixed(2)}%`} higherIsBetter={false} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-elevated hover:shadow-glow-primary transition-all duration-300">
                <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5 text-primary" />Distribuição por Status</CardTitle><CardDescription>Comparativo entre períodos</CardDescription></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[{ data: biMetrics.statusDistribution, label: 'Período 1' }, { data: biMetrics2.statusDistribution, label: 'Período 2' }].map(({ data, label }, idx) => (
                      <div key={idx}><p className="text-sm text-center text-muted-foreground mb-2">{label}</p>
                        <ResponsiveContainer width="100%" height={200}>
                          <RechartsPieChart><Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">{data.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie><Tooltip /></RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated hover:shadow-glow-primary transition-all duration-300">
                <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Performance por Técnica</CardTitle><CardDescription>Produção comparativa</CardDescription></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={biMetrics.techniquePerformance.slice(0, 6).map(t1 => ({ name: t1.name, 'Período 1': t1.produced, 'Período 2': biMetrics2?.techniquePerformance.find(t => t.id === t1.id)?.produced ?? 0 }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} /><Legend />
                      <Bar dataKey="Período 1" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} /><Bar dataKey="Período 2" fill={CHART_COLORS.muted} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            {viewMode === 'futuristic' ? (
              <FuturisticBI biMetrics={biMetrics} kpis={kpis} oeeData={oeeData} isLoading={isLoading} />
            ) : (
              <BINormalView
                biMetrics={biMetrics}
                kpis={kpis}
                oeeData={oeeData}
                getPeriodLabel={getPeriodLabel}
                onDrillDown={(title, segment) => {
                  setDrillDownTitle(title);

                  if (biMetrics.periodJobsList) {
                    const filtered = biMetrics.periodJobsList.filter((j: unknown) => {
                      if (segment === 'all') return true;
                      const s = segment.toLowerCase();

                      return (
                        j.status === s ||
                        j.machine_id === segment ||
                        j.technique_id === segment ||
                        (s === 'lost' && (j.lost_pieces || 0) > 0) ||
                        (s === 'delayed' && j.status === 'delayed') ||
                        (s === 'queue' && (j.status === 'scheduled' || j.status === 'queue')) ||
                        (s === 'production' && j.status === 'production')
                      );
                    }).map((j: unknown) => ({
                      id: j.id,
                      order_number: j.order_number || `OS-${j.id.slice(0, 5)}`,
                      product: j.product_name || 'Produto',
                      status: j.status,
                      quantity: j.quantity,
                      efficiency: j.produced_quantity > 0 ? (((j.produced_quantity - (j.lost_pieces || 0)) / j.produced_quantity) * 100).toFixed(1) + '%' : '--'
                    }));
                    setDrillDownJobs(filtered);
                  } else {
                    setDrillDownJobs([]);
                  }
                  setDrillDownOpen(true);
                }}
              />
            )}
          </>
        )}
        <DrillDownDialog
          open={drillDownOpen}
          onOpenChange={setDrillDownOpen}
          title={drillDownTitle}
          jobs={drillDownJobs}
          onExport={handleExport}
        />
      </div>
    </MainLayout>
  );
}
