import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useKPIs } from '@/hooks/useKPIs';
import { useOEE } from '@/hooks/useOEE';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { BIStatCard } from '@/components/bi/BIStatCard';
import { BILoadingSkeleton } from '@/components/bi/BILoadingSkeleton';
import { BIPeriodFilters } from '@/components/bi/BIPeriodFilters';
import { BIHeader } from '@/components/bi/BIHeader';
import { FuturisticBI } from '@/components/bi/FuturisticBI';
import {
  TrendingUp, AlertTriangle, Printer, CheckCircle, Clock, Target,
  BarChart3, PieChart, LineChart, ArrowUp, ArrowDown, Minus,
  Download, Gauge, Activity, ArrowRight, Package, Layout
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type PeriodFilter = '7d' | '30d' | '90d' | 'custom';
interface DateRange { from: Date; to: Date; }

const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  primaryGlow: 'hsl(var(--primary-glow))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  danger: 'hsl(var(--primary))',
  info: 'hsl(var(--chart-1))',
  muted: 'hsl(var(--muted-foreground))',
  xp: 'hsl(var(--xp))',
  coins: 'hsl(var(--coins))',
  streak: 'hsl(var(--streak))',
};

const PIE_COLORS = [
  'hsl(var(--success))', 'hsl(var(--primary))', 'hsl(var(--coins))',
  'hsl(var(--primary-glow))', 'hsl(var(--xp))', 'hsl(var(--streak))'
];

export default function BIDashboard() {
  const navigate = useNavigate();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d');
  const [customRange, setCustomRange] = useState<DateRange>({ from: subDays(new Date(), 30), to: new Date() });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [techniqueFilter, setTechniqueFilter] = useState<string>('all');
  const [machineFilter, setMachineFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [periodFilter2, setPeriodFilter2] = useState<PeriodFilter>('30d');
  const [customRange2, setCustomRange2] = useState<DateRange>({ from: subDays(new Date(), 60), to: subDays(new Date(), 31) });
  const [isCalendarOpen2, setIsCalendarOpen2] = useState(false);

  const [viewMode, setViewMode] = useState<'futuristic' | 'classic'>('futuristic');
  const periodDays = useMemo(() => {
    if (periodFilter === 'custom') return differenceInDays(customRange.to, customRange.from) || 30;
    return periodFilter === '7d' ? 7 : periodFilter === '90d' ? 90 : 30;
  }, [periodFilter, customRange]);

  const { data: kpis, isLoading: kpisLoading } = useKPIs();
  const { data: oeeData, isLoading: oeeLoading } = useOEE(periodDays);
  const { jobs, machines, techniques, isLoading: schedulingLoading } = useSchedulingData();
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
    const periodJobs = jobs.filter(j => {
      if (!j.created_at) return false;
      try { return isWithinInterval(parseISO(j.created_at), { start: startOfDay(range.from), end: endOfDay(range.to) }); }
      catch { return false; }
    });

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
    const periodLossRate = (periodCompletedPieces + periodLostPieces) > 0 ? (periodLostPieces / (periodCompletedPieces + periodLostPieces)) * 100 : 0;

    return {
      statusDistribution, dailyTrend, techniquePerformance,
      machineUtilization: machineUtilization.slice(0, 10),
      periodJobs: periodJobs.length, periodCompletedJobs, periodCompletedPieces,
      periodLostPieces, periodLossRate,
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

  return (
    <MainLayout>
      <div className="p-6 space-y-8 animate-fade-in">
        <Breadcrumbs />
        <div className="flex items-center justify-between">
          <BIHeader comparisonMode={comparisonMode} setComparisonMode={setComparisonMode} onNavigate={(path) => navigate(path)} />
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'classic' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('classic')}
              className="gap-2"
            >
              <Layout className="h-4 w-4" /> Clássico
            </Button>
            <Button 
              variant={viewMode === 'futuristic' ? 'default' : 'outline'} 
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
        />

        {/* Comparison View */}
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
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {biMetrics.statusDistribution.map(e => <div key={e.name} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} /><span className="text-xs">{e.name}</span></div>)}
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

            <Card className="card-elevated overflow-hidden">
              <CardHeader><CardTitle className="flex items-center gap-2"><Printer className="h-5 w-5 text-primary" />Comparativo de Utilização por Máquina</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-border"><th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Máquina</th><th className="text-left py-3 px-4 text-sm">Técnica</th><th className="text-center py-3 px-4 text-sm text-primary">P1 Jobs</th><th className="text-center py-3 px-4 text-sm text-primary">P1 Util.</th><th className="text-center py-3 px-4 text-sm">P2 Jobs</th><th className="text-center py-3 px-4 text-sm">P2 Util.</th><th className="text-right py-3 px-4 text-sm">Variação</th></tr></thead>
                    <tbody>{biMetrics.machineUtilization.map(m1 => {
                      const m2 = biMetrics2?.machineUtilization.find(m => m.id === m1.id);
                      const { delta, trend } = getComparisonDelta(m1.utilization, m2?.utilization ?? 0);
                      return (<tr key={m1.id} className="border-b border-border/50 hover:bg-muted/30"><td className="py-3 px-4 font-medium">{m1.name}</td><td className="py-3 px-4"><Badge variant="outline" className="text-xs">{m1.technique}</Badge></td><td className="py-3 px-4 text-center text-primary">{m1.totalJobs}</td><td className="py-3 px-4 text-center text-primary font-medium">{m1.utilization.toFixed(0)}%</td><td className="py-3 px-4 text-center text-muted-foreground">{m2?.totalJobs ?? 0}</td><td className="py-3 px-4 text-center text-muted-foreground">{(m2?.utilization ?? 0).toFixed(0)}%</td><td className="py-3 px-4 text-right"><span className={cn("flex items-center justify-end gap-1 text-sm", trend === 'up' ? "text-green-500" : trend === 'down' ? "text-red-500" : "text-muted-foreground")}>{trend === 'up' ? <ArrowUp className="h-3 w-3" /> : trend === 'down' ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}{delta.toFixed(1)}%</span></td></tr>);
                    })}</tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {viewMode === 'futuristic' ? (
              <FuturisticBI biMetrics={biMetrics} kpis={kpis} oeeData={oeeData} />
            ) : (
              <>
                {/* Normal View - KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <BIStatCard title="OEE Geral" value={`${oeeData.overallOEE.toFixed(1)}%`} subtitle="Eficiência Global dos Equipamentos" icon={Gauge} variant={oeeData.overallOEE >= 85 ? 'success' : oeeData.overallOEE >= 65 ? 'warning' : 'danger'} />
                  <BIStatCard title="Taxa de Qualidade" value={`${oeeData.overallQuality.toFixed(1)}%`} subtitle={`${biMetrics.periodLostPieces.toLocaleString()} peças perdidas`} icon={Target} variant={oeeData.overallQuality >= 95 ? 'success' : oeeData.overallQuality >= 85 ? 'warning' : 'danger'} />
                  <BIStatCard title="Jobs Concluídos" value={biMetrics.periodCompletedJobs} subtitle={`de ${biMetrics.periodJobs} no período`} icon={CheckCircle} trend={biMetrics.productionTrend as 'up' | 'down' | 'neutral'} trendValue={`${biMetrics.trendPercentage}% vs período anterior`} />
                  <BIStatCard title="Peças Produzidas" value={biMetrics.periodCompletedPieces.toLocaleString()} subtitle={`Taxa de perda: ${biMetrics.periodLossRate.toFixed(2)}%`} icon={Package} variant={biMetrics.periodLossRate > 5 ? 'warning' : 'success'} />
                </div>

                {/* Secondary KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: biMetrics.activeMachines, label: 'Máquinas Ativas', icon: Printer, gradient: 'from-primary/10 via-primary/5', borderColor: 'border-primary/20', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
                    { value: biMetrics.activeTechniques, label: 'Técnicas', icon: Activity, gradient: 'from-xp/10 via-xp/5', borderColor: 'border-xp/20', iconBg: 'bg-xp/10', iconColor: 'text-xp' },
                    { value: kpis.inProgressJobs, label: 'Em Produção', icon: TrendingUp, gradient: 'from-success/10 via-success/5', borderColor: 'border-success/20', iconBg: 'bg-success/10', iconColor: 'text-success' },
                    { value: kpis.delayedJobs, label: 'Atrasados', icon: AlertTriangle, gradient: 'from-warning/10 via-warning/5', borderColor: 'border-warning/20', iconBg: 'bg-warning/10', iconColor: 'text-warning' },
                  ].map(({ value, label, icon: IIcon, gradient, borderColor, iconBg, iconColor }) => (
                    <Card key={label} className={`card-interactive bg-gradient-to-br ${gradient} to-transparent ${borderColor} group`}>
                      <CardContent className="pt-4 pb-4"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${iconBg} group-hover:scale-110 transition-transform`}><IIcon className={`h-5 w-5 ${iconColor}`} /></div><div><p className="text-2xl font-bold font-display">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div></CardContent>
                    </Card>
                  ))}
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="card-elevated hover:shadow-glow-primary transition-all duration-300 group">
                    <CardHeader><CardTitle className="flex items-center gap-2"><div className="p-1.5 rounded-lg bg-primary/10"><LineChart className="h-5 w-5 text-primary" /></div>Tendência de Produção</CardTitle><CardDescription>{getPeriodLabel()}</CardDescription></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={biMetrics.dailyTrend}>
                          <defs><linearGradient id="colorProduced" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.4}/><stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/></linearGradient></defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" /><XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} /><YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                          <Area type="monotone" dataKey="produced" stroke={CHART_COLORS.success} strokeWidth={2} fillOpacity={1} fill="url(#colorProduced)" name="Produzidas" />
                          <Line type="monotone" dataKey="jobs" stroke={CHART_COLORS.primary} strokeWidth={3} dot={{ r: 4, fill: CHART_COLORS.primary, strokeWidth: 2 }} name="Jobs" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated hover:shadow-glow-primary transition-all duration-300">
                    <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5 text-primary" />Distribuição por Status</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <RechartsPieChart><Pie data={biMetrics.statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>{biMetrics.statusDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} /></RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="card-elevated hover:shadow-glow-primary transition-all duration-300">
                    <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Performance por Técnica</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={biMetrics.techniquePerformance.slice(0, 8)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" /><XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} /><YAxis dataKey="name" type="category" width={80} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} formatter={(v: number, name: string) => [v.toLocaleString(), name === 'produced' ? 'Produzidas' : 'Perdidas']} />
                          <Bar dataKey="produced" fill={CHART_COLORS.success} name="Produzidas" radius={[0, 6, 6, 0]} /><Bar dataKey="lost" fill={CHART_COLORS.danger} name="Perdidas" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated hover:shadow-glow-primary transition-all duration-300">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5 text-primary" />Evolução OEE</CardTitle><CardDescription>Últimos 14 dias • Meta: 85%</CardDescription></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <RechartsLineChart data={oeeData.trendData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="date" tickFormatter={(v) => format(parseISO(v), 'dd/MM')} tick={{ fill: 'hsl(var(--muted-foreground))' }} /><YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} labelFormatter={(l) => format(parseISO(l as string), 'dd/MM/yyyy')} formatter={(v: number) => [`${v.toFixed(1)}%`]} />
                          <Line type="monotone" dataKey="oee" stroke={CHART_COLORS.primary} strokeWidth={3} dot={{ r: 4, fill: CHART_COLORS.primary }} name="OEE" />
                          <Line type="monotone" dataKey="quality" stroke={CHART_COLORS.success} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Qualidade" />
                          <Line type="monotone" dataKey={() => 85} stroke={CHART_COLORS.warning} strokeWidth={1} strokeDasharray="10 5" dot={false} name="Meta" />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Machine Utilization Table */}
                <Card className="card-elevated overflow-hidden">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Printer className="h-5 w-5 text-primary" />Top 10 Máquinas por Utilização</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-primary/20 bg-primary/5"><th className="text-left py-3 px-4 text-sm font-semibold">Máquina</th><th className="text-left py-3 px-4 text-sm font-semibold">Técnica</th><th className="text-center py-3 px-4 text-sm font-semibold">Jobs</th><th className="text-center py-3 px-4 text-sm font-semibold">Concluídos</th><th className="text-right py-3 px-4 text-sm font-semibold">Utilização</th></tr></thead>
                        <tbody>{biMetrics.machineUtilization.map((machine, index) => (
                          <tr key={machine.id} className="border-b border-border/50 hover:bg-primary/5 transition-all group">
                            <td className="py-3 px-4"><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground w-5">{index + 1}.</span><span className="font-medium group-hover:text-primary transition-colors">{machine.name}</span></div></td>
                            <td className="py-3 px-4"><Badge variant="outline" className="text-xs border-primary/30">{machine.technique}</Badge></td>
                            <td className="py-3 px-4 text-center font-medium">{machine.totalJobs}</td>
                            <td className="py-3 px-4 text-center font-medium">{machine.completedJobs}</td>
                            <td className="py-3 px-4 text-right"><div className="flex items-center justify-end gap-2"><div className="w-24 h-2.5 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${machine.utilization}%`, background: machine.utilization >= 80 ? 'linear-gradient(90deg, hsl(var(--success)), hsl(var(--success) / 0.8))' : machine.utilization >= 50 ? 'linear-gradient(90deg, hsl(var(--warning)), hsl(var(--warning) / 0.8))' : 'linear-gradient(90deg, hsl(var(--destructive)), hsl(var(--destructive) / 0.8))' }} /></div><span className="text-sm font-bold w-12 text-right">{machine.utilization.toFixed(0)}%</span></div></td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* OEE Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Disponibilidade', value: oeeData.overallAvailability, loss: oeeData.availabilityLosses, icon: Clock, color: 'primary' },
                    { label: 'Performance', value: oeeData.overallPerformance, loss: oeeData.performanceLosses, icon: TrendingUp, color: 'xp' },
                    { label: 'Qualidade', value: oeeData.overallQuality, loss: oeeData.qualityLosses, icon: Target, color: 'success' },
                  ].map(({ label, value, loss, icon: OIcon, color }) => (
                    <Card key={label} className={`card-interactive bg-gradient-to-br from-${color}/10 via-${color}/5 to-transparent border-${color}/20 group`}>
                      <CardContent className="pt-6"><div className="text-center"><div className={`p-3 rounded-xl bg-${color}/10 w-fit mx-auto mb-3 group-hover:scale-110 transition-all`}><OIcon className={`h-8 w-8 text-${color}`} /></div><p className="text-sm text-muted-foreground font-medium">{label}</p><p className={`text-4xl font-bold font-display text-${color} mt-1`}>{value.toFixed(1)}%</p><p className="text-xs text-muted-foreground mt-2">Perda: {loss.toFixed(1)}%</p></div></CardContent>
                    </Card>
                  ))}
                </div>

                {/* Export */}
                <div className="flex justify-end">
                  <Button onClick={() => {
                    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), period: getPeriodLabel(), metrics: biMetrics, oee: oeeData }, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `bi-report-${format(new Date(), 'yyyy-MM-dd')}.json`; a.click(); URL.revokeObjectURL(url);
                    toast.success('Relatório exportado com sucesso!');
                  }} className="gap-2"><Download className="h-4 w-4" />Exportar Relatório</Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
