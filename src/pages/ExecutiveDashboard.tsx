import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useExecutiveDashboard, getDateRangePresets, DateRange } from '@/hooks/useExecutiveDashboard';
import { exportExecutiveDashboardPDF } from '@/lib/pdfExport';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  FileDown, 
  TrendingUp, 
  TrendingDown,
  Factory,
  Package,
  Wrench,
  Users,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { VoiceButton } from '@/components/voice/VoiceCommands';

export default function ExecutiveDashboard() {
  const datePresets = getDateRangePresets();
  const [selectedRange, setSelectedRange] = useState<DateRange>(datePresets[1]); // Este Mês

  const { data: kpis, isLoading, error } = useExecutiveDashboard(selectedRange);

  const handleExportPDF = async () => {
    if (!kpis) return;
    
    try {
      await exportExecutiveDashboardPDF({
        title: 'Dashboard Executivo',
        dateRange: selectedRange,
        kpis,
      });
      toast.success('Relatório PDF exportado com sucesso!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !kpis) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg font-medium">Erro ao carregar dashboard</p>
            <p className="text-muted-foreground">Tente novamente mais tarde</p>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const kpiCards = [
    {
      title: 'Produção Total',
      value: kpis.totalPiecesProduced.toLocaleString('pt-BR'),
      subtitle: `${kpis.totalJobsCompleted} jobs concluídos`,
      icon: Package,
      trend: kpis.productionEfficiency > 80 ? 'up' : 'down',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Eficiência',
      value: `${kpis.productionEfficiency.toFixed(1)}%`,
      subtitle: `Meta: 85%`,
      icon: Target,
      trend: kpis.productionEfficiency >= 85 ? 'up' : 'down',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Taxa de Qualidade',
      value: `${kpis.qualityRate.toFixed(1)}%`,
      subtitle: `${kpis.totalPiecesLost.toLocaleString('pt-BR')} perdas`,
      icon: CheckCircle2,
      trend: kpis.qualityRate >= 98 ? 'up' : 'down',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Utilização Máquinas',
      value: `${kpis.machineUtilization.toFixed(1)}%`,
      subtitle: `${kpis.activeMachines} de ${kpis.totalMachines} ativas`,
      icon: Factory,
      trend: kpis.machineUtilization >= 70 ? 'up' : 'down',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in-up">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">
              <span className="gradient-text">Dashboard Executivo</span>
            </h1>
            <p className="text-muted-foreground">Visão consolidada de KPIs e performance</p>
          </div>
          
          <div className="flex items-center gap-3">
            <VoiceButton onCommand={(cmd) => {
              if (cmd.startsWith('search:')) {
                toast.info(`Busca: ${cmd.replace('search:', '')}`);
              }
            }} />
            
            <Select 
              value={selectedRange.label} 
              onValueChange={(value) => {
                const preset = datePresets.find(p => p.label === value);
                if (preset) setSelectedRange(preset);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {datePresets.map(preset => (
                  <SelectItem key={preset.label} value={preset.label}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleExportPDF} className="gap-2">
              <FileDown className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi, index) => (
            <Card key={index} className="glass-card overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className={cn('p-2 rounded-lg', kpi.bgColor)}>
                    <kpi.icon className={cn('h-5 w-5', kpi.color)} />
                  </div>
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Clock className="h-4 w-4 text-cyan-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{kpis.averageCycleTime.toFixed(0)} min</p>
                <p className="text-xs text-muted-foreground">Tempo Médio Ciclo</p>
              </div>
            </div>
          </Card>
          
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Wrench className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{kpis.maintenanceCompleted}</p>
                <p className="text-xs text-muted-foreground">Manutenções</p>
              </div>
            </div>
          </Card>
          
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{kpis.maintenancePending}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </Card>
          
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10">
                <Activity className="h-4 w-4 text-pink-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{kpis.totalJobsInProgress}</p>
                <p className="text-xs text-muted-foreground">Em Produção</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Production Trend */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Tendência de Produção
                  </CardTitle>
                  <CardDescription>Produzido vs Meta diária</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kpis.productionTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#94a3b8" 
                      fill="#94a3b8" 
                      fillOpacity={0.2}
                      name="Meta"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="produced" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.4}
                      name="Produzido"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Efficiency Trend */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Eficiência ao Longo do Tempo
                  </CardTitle>
                  <CardDescription>Percentual de eficiência diária</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={kpis.efficiencyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Eficiência']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Technique Distribution */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-purple-500" />
                Distribuição por Técnica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={kpis.techniqueDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="technique"
                      label={({ technique, percent }) => 
                        `${technique} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {kpis.techniqueDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Operators */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-pink-500" />
                Top Operadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {kpis.topOperators.map((op, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      index === 0 ? 'bg-amber-500 text-amber-950' :
                      index === 1 ? 'bg-gray-400 text-gray-950' :
                      index === 2 ? 'bg-orange-600 text-orange-950' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{op.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {op.produced.toLocaleString('pt-BR')} peças
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {op.efficiency.toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Machine Performance */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Factory className="h-5 w-5 text-amber-500" />
                Performance Máquinas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {kpis.machinePerformance.slice(0, 5).map((m, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{m.machine}</span>
                      <span className="text-muted-foreground">
                        OEE: {m.oee.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={m.utilization} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
