import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useKPIs } from '@/hooks/useKPIs';
import { useOEE } from '@/hooks/useOEE';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Gauge, 
  Package, 
  AlertTriangle,
  Printer,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus,
  CalendarIcon,
  Filter
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  LineChart as RechartsLineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type PeriodFilter = '7d' | '30d' | '90d' | 'custom';

interface DateRange {
  from: Date;
  to: Date;
}

// Color palette for charts
const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(142 76% 46%)',
  warning: 'hsl(48 96% 53%)',
  danger: 'hsl(var(--destructive))',
  info: 'hsl(217 91% 60%)',
  muted: 'hsl(var(--muted-foreground))',
};

const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'border-border/50',
    success: 'border-green-500/30 bg-green-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    danger: 'border-red-500/30 bg-red-500/5',
  };

  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card className={`${variantStyles[variant]} transition-all hover:shadow-lg`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold font-display">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && trendValue && (
              <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
                <TrendIcon className="h-4 w-4" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function BIDashboard() {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d');
  const [customRange, setCustomRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Get period days for OEE hook
  const periodDays = useMemo(() => {
    if (periodFilter === 'custom') {
      return differenceInDays(customRange.to, customRange.from) || 30;
    }
    return periodFilter === '7d' ? 7 : periodFilter === '90d' ? 90 : 30;
  }, [periodFilter, customRange]);

  const { data: kpis, isLoading: kpisLoading } = useKPIs();
  const { data: oeeData, isLoading: oeeLoading } = useOEE(periodDays);
  const { jobs, machines, techniques, isLoading: schedulingLoading } = useSchedulingData();

  const isLoading = kpisLoading || oeeLoading || schedulingLoading;

  // Get date range based on filter
  const dateRange = useMemo((): DateRange => {
    const now = new Date();
    if (periodFilter === 'custom') {
      return customRange;
    }
    const days = periodFilter === '7d' ? 7 : periodFilter === '90d' ? 90 : 30;
    return { from: subDays(now, days), to: now };
  }, [periodFilter, customRange]);

  // Filter jobs by selected period
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter(j => {
      if (!j.created_at) return false;
      try {
        const created = parseISO(j.created_at);
        return isWithinInterval(created, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) });
      } catch {
        return false;
      }
    });
  }, [jobs, dateRange]);

  // Calculate additional BI metrics
  const biMetrics = useMemo(() => {
    if (!jobs || !machines || !techniques || !kpis || !oeeData) return null;

    const now = new Date();
    const periodStart = dateRange.from;
    const halfPeriod = subDays(periodStart, differenceInDays(dateRange.to, dateRange.from));

    // Jobs in selected period
    const periodJobs = filteredJobs;

    // Jobs in previous period (for trend calculation)
    const prevPeriodJobs = jobs.filter(j => {
      if (!j.created_at) return false;
      try {
        const created = parseISO(j.created_at);
        return isWithinInterval(created, { start: startOfDay(halfPeriod), end: endOfDay(subDays(periodStart, 1)) });
      } catch {
        return false;
      }
    });

    // Status distribution (filtered by period)
    const statusDistribution = [
      { name: 'Finalizados', value: periodJobs.filter(j => j.status === 'finished').length, color: PIE_COLORS[0] },
      { name: 'Em Produção', value: periodJobs.filter(j => j.status === 'production').length, color: PIE_COLORS[1] },
      { name: 'Agendados', value: periodJobs.filter(j => j.status === 'scheduled').length, color: PIE_COLORS[2] },
      { name: 'Na Fila', value: periodJobs.filter(j => j.status === 'queue').length, color: PIE_COLORS[3] },
      { name: 'Atrasados', value: periodJobs.filter(j => j.status === 'delayed').length, color: PIE_COLORS[4] },
    ].filter(s => s.value > 0);

    // Daily production trend (based on period)
    const trendDays = Math.min(differenceInDays(dateRange.to, dateRange.from), 30); // Max 30 data points
    const dailyTrend = [];
    for (let i = trendDays - 1; i >= 0; i--) {
      const date = subDays(dateRange.to, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayJobs = periodJobs.filter(j => {
        if (!j.actual_end_time) return false;
        try {
          const endTime = parseISO(j.actual_end_time);
          return isWithinInterval(endTime, { start: dayStart, end: dayEnd });
        } catch {
          return false;
        }
      });

      const produced = dayJobs.reduce((sum, j) => sum + (j.produced_quantity ?? j.quantity ?? 0), 0);
      const lost = dayJobs.reduce((sum, j) => sum + (j.lost_pieces ?? 0), 0);

      dailyTrend.push({
        date: format(date, 'dd/MM', { locale: ptBR }),
        fullDate: format(date, 'dd MMM', { locale: ptBR }),
        jobs: dayJobs.length,
        produced,
        lost,
        efficiency: produced > 0 ? ((produced - lost) / produced * 100) : 0,
      });
    }

    // Technique performance (filtered by period)
    const techniquePerformance = techniques.map(tech => {
      const techJobs = periodJobs.filter(j => j.technique_id === tech.id && j.status === 'finished');
      const totalProduced = techJobs.reduce((sum, j) => sum + (j.produced_quantity ?? j.quantity ?? 0), 0);
      const totalLost = techJobs.reduce((sum, j) => sum + (j.lost_pieces ?? 0), 0);
      const techMachines = machines.filter(m => m.technique_id === tech.id);
      
      return {
        id: tech.id,
        name: tech.short_name || tech.name,
        jobs: techJobs.length,
        produced: totalProduced,
        lost: totalLost,
        machines: techMachines.length,
        quality: totalProduced > 0 ? ((totalProduced - totalLost) / totalProduced * 100) : 100,
        color: tech.color,
      };
    }).filter(t => t.jobs > 0).sort((a, b) => b.produced - a.produced);

    // Machine utilization (filtered by period)
    const machineUtilization = machines.map(machine => {
      const machineJobs = periodJobs.filter(j => j.machine_id === machine.id);
      const completedJobs = machineJobs.filter(j => j.status === 'finished');
      const technique = techniques.find(t => t.id === machine.technique_id);
      
      return {
        id: machine.id,
        name: machine.code || machine.name,
        technique: technique?.short_name || technique?.name || '',
        totalJobs: machineJobs.length,
        completedJobs: completedJobs.length,
        utilization: machineJobs.length > 0 ? (completedJobs.length / machineJobs.length * 100) : 0,
      };
    }).filter(m => m.totalJobs > 0).sort((a, b) => b.utilization - a.utilization);

    // Calculate trends (current period vs previous period)
    const productionTrend = periodJobs.length > prevPeriodJobs.length ? 'up' : 
                            periodJobs.length < prevPeriodJobs.length ? 'down' : 'neutral';
    
    const trendPercentage = prevPeriodJobs.length > 0 
      ? Math.abs(((periodJobs.length - prevPeriodJobs.length) / prevPeriodJobs.length) * 100).toFixed(0)
      : '0';

    // Period-specific KPIs
    const periodCompletedJobs = periodJobs.filter(j => j.status === 'finished').length;
    const periodCompletedPieces = periodJobs
      .filter(j => j.status === 'finished')
      .reduce((sum, j) => sum + (j.produced_quantity ?? j.quantity ?? 0), 0);
    const periodLostPieces = periodJobs.reduce((sum, j) => sum + (j.lost_pieces ?? 0), 0);
    const periodLossRate = (periodCompletedPieces + periodLostPieces) > 0 
      ? (periodLostPieces / (periodCompletedPieces + periodLostPieces)) * 100 
      : 0;

    return {
      statusDistribution,
      dailyTrend,
      techniquePerformance,
      machineUtilization: machineUtilization.slice(0, 10), // Top 10
      productionTrend,
      trendPercentage,
      periodJobs: periodJobs.length,
      periodCompletedJobs,
      periodCompletedPieces,
      periodLostPieces,
      periodLossRate,
      activeMachines: machines.filter(m => m.is_active).length,
      activeTechniques: techniques.length,
    };
  }, [jobs, machines, techniques, kpis, oeeData, dateRange, filteredJobs]);

  if (isLoading || !biMetrics || !kpis || !oeeData) {
    return (
      <MainLayout>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-display">Business Intelligence</h1>
            <p className="text-muted-foreground">Visão executiva consolidada</p>
          </div>
          <LoadingSkeleton />
        </div>
      </MainLayout>
    );
  }

  // Period label helper
  const getPeriodLabel = () => {
    if (periodFilter === 'custom') {
      return `${format(customRange.from, 'dd/MM/yyyy')} - ${format(customRange.to, 'dd/MM/yyyy')}`;
    }
    return periodFilter === '7d' ? 'Últimos 7 dias' : periodFilter === '90d' ? 'Últimos 90 dias' : 'Últimos 30 dias';
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Business Intelligence
            </h1>
            <p className="text-muted-foreground">
              Visão executiva consolidada • Atualizado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              <Activity className="h-3 w-3 mr-1" />
              Dados em tempo real
            </Badge>
          </div>
        </div>

        {/* Period Filters */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Período:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  variant={periodFilter === '7d' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setPeriodFilter('7d')}
                >
                  7 dias
                </Button>
                <Button 
                  variant={periodFilter === '30d' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setPeriodFilter('30d')}
                >
                  30 dias
                </Button>
                <Button 
                  variant={periodFilter === '90d' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setPeriodFilter('90d')}
                >
                  90 dias
                </Button>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant={periodFilter === 'custom' ? 'default' : 'outline'} 
                      size="sm"
                      className="gap-2"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      Personalizado
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-4 space-y-4">
                      <p className="text-sm font-medium">Selecione o período</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">De:</p>
                          <Calendar
                            mode="single"
                            selected={customRange.from}
                            onSelect={(date) => date && setCustomRange(prev => ({ ...prev, from: date }))}
                            disabled={(date) => date > new Date() || date > customRange.to}
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Até:</p>
                          <Calendar
                            mode="single"
                            selected={customRange.to}
                            onSelect={(date) => date && setCustomRange(prev => ({ ...prev, to: date }))}
                            disabled={(date) => date > new Date() || date < customRange.from}
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          setPeriodFilter('custom');
                          setIsCalendarOpen(false);
                        }}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {getPeriodLabel()} • {biMetrics.periodJobs} jobs
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="OEE Geral"
            value={`${oeeData.overallOEE.toFixed(1)}%`}
            subtitle="Eficiência Global dos Equipamentos"
            icon={Gauge}
            variant={oeeData.overallOEE >= 85 ? 'success' : oeeData.overallOEE >= 65 ? 'warning' : 'danger'}
          />
          <StatCard
            title="Taxa de Qualidade"
            value={`${oeeData.overallQuality.toFixed(1)}%`}
            subtitle={`${biMetrics.periodLostPieces.toLocaleString()} peças perdidas`}
            icon={Target}
            variant={oeeData.overallQuality >= 95 ? 'success' : oeeData.overallQuality >= 85 ? 'warning' : 'danger'}
          />
          <StatCard
            title="Jobs Concluídos"
            value={biMetrics.periodCompletedJobs}
            subtitle={`de ${biMetrics.periodJobs} no período`}
            icon={CheckCircle}
            trend={biMetrics.productionTrend as 'up' | 'down' | 'neutral'}
            trendValue={`${biMetrics.trendPercentage}% vs período anterior`}
          />
          <StatCard
            title="Peças Produzidas"
            value={biMetrics.periodCompletedPieces.toLocaleString()}
            subtitle={`Taxa de perda: ${biMetrics.periodLossRate.toFixed(2)}%`}
            icon={Package}
            variant={biMetrics.periodLossRate > 5 ? 'warning' : 'success'}
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Printer className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{biMetrics.activeMachines}</p>
                  <p className="text-xs text-muted-foreground">Máquinas Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/5 to-transparent">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{biMetrics.activeTechniques}</p>
                  <p className="text-xs text-muted-foreground">Técnicas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/5 to-transparent">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpis.inProgressJobs}</p>
                  <p className="text-xs text-muted-foreground">Em Produção</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/5 to-transparent">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpis.delayedJobs}</p>
                  <p className="text-xs text-muted-foreground">Atrasados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Production Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" />
                Tendência de Produção
              </CardTitle>
              <CardDescription>{getPeriodLabel()}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={biMetrics.dailyTrend}>
                  <defs>
                    <linearGradient id="colorProduced" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="produced" 
                    stroke={CHART_COLORS.success} 
                    fillOpacity={1} 
                    fill="url(#colorProduced)"
                    name="Produzidas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="jobs" 
                    stroke={CHART_COLORS.info} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Jobs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Distribuição por Status
              </CardTitle>
              <CardDescription>Visão geral dos jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RechartsPieChart>
                  <Pie
                    data={biMetrics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {biMetrics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Technique Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Performance por Técnica
              </CardTitle>
              <CardDescription>Peças produzidas por técnica</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={biMetrics.techniquePerformance.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={80} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => [value.toLocaleString(), name === 'produced' ? 'Produzidas' : 'Perdidas']}
                  />
                  <Bar dataKey="produced" fill={CHART_COLORS.success} name="Produzidas" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="lost" fill={CHART_COLORS.danger} name="Perdidas" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* OEE Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                Evolução OEE
              </CardTitle>
              <CardDescription>Últimos 14 dias • Meta: 85%</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RechartsLineChart data={oeeData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(parseISO(value), 'dd/MM')} 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(label) => format(parseISO(label as string), 'dd/MM/yyyy')}
                    formatter={(value: number) => [`${value.toFixed(1)}%`]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="oee" 
                    stroke={CHART_COLORS.primary} 
                    strokeWidth={3}
                    dot={{ r: 4, fill: CHART_COLORS.primary }}
                    name="OEE"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="quality" 
                    stroke={CHART_COLORS.success} 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Qualidade"
                  />
                  {/* Benchmark line */}
                  <Line
                    type="monotone"
                    dataKey={() => 85}
                    stroke={CHART_COLORS.warning}
                    strokeWidth={1}
                    strokeDasharray="10 5"
                    dot={false}
                    name="Meta"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Machine Utilization Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5 text-primary" />
              Top 10 Máquinas por Utilização
            </CardTitle>
            <CardDescription>Taxa de conclusão de jobs por máquina</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Máquina</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Técnica</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Jobs</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Concluídos</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Utilização</th>
                  </tr>
                </thead>
                <tbody>
                  {biMetrics.machineUtilization.map((machine, index) => (
                    <tr 
                      key={machine.id} 
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-5">{index + 1}.</span>
                          <span className="font-medium">{machine.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {machine.technique}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">{machine.totalJobs}</td>
                      <td className="py-3 px-4 text-center">{machine.completedJobs}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${machine.utilization}%`,
                                backgroundColor: machine.utilization >= 80 ? CHART_COLORS.success : 
                                                  machine.utilization >= 50 ? CHART_COLORS.warning : 
                                                  CHART_COLORS.danger
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {machine.utilization.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* OEE Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-sm text-muted-foreground">Disponibilidade</p>
                <p className="text-4xl font-bold font-display text-blue-500">
                  {oeeData.overallAvailability.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Perda: {oeeData.availabilityLosses.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <p className="text-sm text-muted-foreground">Performance</p>
                <p className="text-4xl font-bold font-display text-purple-500">
                  {oeeData.overallPerformance.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Perda: {oeeData.performanceLosses.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">Qualidade</p>
                <p className="text-4xl font-bold font-display text-green-500">
                  {oeeData.overallQuality.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Perda: {oeeData.qualityLosses.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
