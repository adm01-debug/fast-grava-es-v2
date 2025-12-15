import { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  Users,
  Printer,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus
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
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const { data: kpis, isLoading: kpisLoading } = useKPIs();
  const { data: oeeData, isLoading: oeeLoading } = useOEE(30);
  const { jobs, machines, techniques, isLoading: schedulingLoading } = useSchedulingData();

  const isLoading = kpisLoading || oeeLoading || schedulingLoading;

  // Calculate additional BI metrics
  const biMetrics = useMemo(() => {
    if (!jobs || !machines || !techniques || !kpis || !oeeData) return null;

    const now = new Date();
    const last7Days = subDays(now, 7);
    const last30Days = subDays(now, 30);

    // Jobs by period
    const recentJobs = jobs.filter(j => {
      if (!j.created_at) return false;
      try {
        return parseISO(j.created_at) >= last30Days;
      } catch {
        return false;
      }
    });

    const last7DaysJobs = jobs.filter(j => {
      if (!j.created_at) return false;
      try {
        return parseISO(j.created_at) >= last7Days;
      } catch {
        return false;
      }
    });

    // Status distribution
    const statusDistribution = [
      { name: 'Finalizados', value: jobs.filter(j => j.status === 'finished').length, color: PIE_COLORS[0] },
      { name: 'Em Produção', value: jobs.filter(j => j.status === 'production').length, color: PIE_COLORS[1] },
      { name: 'Agendados', value: jobs.filter(j => j.status === 'scheduled').length, color: PIE_COLORS[2] },
      { name: 'Na Fila', value: jobs.filter(j => j.status === 'queue').length, color: PIE_COLORS[3] },
      { name: 'Atrasados', value: jobs.filter(j => j.status === 'delayed').length, color: PIE_COLORS[4] },
    ].filter(s => s.value > 0);

    // Daily production trend (last 14 days)
    const dailyTrend = [];
    for (let i = 13; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayJobs = jobs.filter(j => {
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

    // Technique performance
    const techniquePerformance = techniques.map(tech => {
      const techJobs = jobs.filter(j => j.technique_id === tech.id && j.status === 'finished');
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

    // Machine utilization
    const machineUtilization = machines.map(machine => {
      const machineJobs = jobs.filter(j => j.machine_id === machine.id);
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

    // Calculate trends (compare last 7 days vs previous 7 days)
    const prev7Days = subDays(last7Days, 7);
    const prev7DaysJobs = jobs.filter(j => {
      if (!j.created_at) return false;
      try {
        const created = parseISO(j.created_at);
        return created >= prev7Days && created < last7Days;
      } catch {
        return false;
      }
    });

    const productionTrend = last7DaysJobs.length > prev7DaysJobs.length ? 'up' : 
                            last7DaysJobs.length < prev7DaysJobs.length ? 'down' : 'neutral';
    
    const trendPercentage = prev7DaysJobs.length > 0 
      ? Math.abs(((last7DaysJobs.length - prev7DaysJobs.length) / prev7DaysJobs.length) * 100).toFixed(0)
      : '0';

    return {
      statusDistribution,
      dailyTrend,
      techniquePerformance,
      machineUtilization: machineUtilization.slice(0, 10), // Top 10
      productionTrend,
      trendPercentage,
      last7DaysJobs: last7DaysJobs.length,
      activeMachines: machines.filter(m => m.is_active).length,
      activeTechniques: techniques.length,
    };
  }, [jobs, machines, techniques, kpis, oeeData]);

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
            subtitle={`${kpis.lostPieces.toLocaleString()} peças perdidas`}
            icon={Target}
            variant={oeeData.overallQuality >= 95 ? 'success' : oeeData.overallQuality >= 85 ? 'warning' : 'danger'}
          />
          <StatCard
            title="Jobs Concluídos"
            value={kpis.completedJobs}
            subtitle={`de ${kpis.totalJobs} total`}
            icon={CheckCircle}
            trend={biMetrics.productionTrend as 'up' | 'down' | 'neutral'}
            trendValue={`${biMetrics.trendPercentage}% vs semana anterior`}
          />
          <StatCard
            title="Peças Produzidas"
            value={kpis.completedPieces.toLocaleString()}
            subtitle={`Taxa de perda: ${kpis.lossRate.toFixed(2)}%`}
            icon={Package}
            variant={kpis.lossRate > 5 ? 'warning' : 'success'}
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
              <CardDescription>Últimos 14 dias</CardDescription>
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
