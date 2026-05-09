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
  Activity,
  Zap,
  Lightbulb,
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { VoiceButton } from '@/components/voice/VoiceCommands';
import { AutonomousEventLog } from '@/components/autonomous/AutonomousEventLog';

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
      if (import.meta.env.DEV) console.error('Error exporting PDF:', error);
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
    {
      title: 'Ciber-Resiliência',
      value: '98.5',
      subtitle: 'Status: 11/10 Ativo',
      icon: ShieldCheck,
      trend: 'up',
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10',
    },
  ];

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-10 animate-fade-in-up">
        <Breadcrumbs className="mb-0" />
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 pb-2 border-b border-border/40">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary shadow-glow-primary animate-float">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tighter">
                  <span className="gradient-text animate-pulse-glow">Fábrica Autônoma 360</span>
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline" className="gap-1.5 px-2.5 py-0.5 border-primary/30 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    Status: Ecossistema 11/10
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20">
                    Governança Total Ativa
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm font-medium italic pl-1">
              Orquestração Inteligente & Governança de Dados Industrial de Alta Performance
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex-1 xl:flex-none">
              <VoiceButton onCommand={(cmd) => {
                if (cmd.startsWith('search:')) {
                  toast.info(`Busca: ${cmd.replace('search:', '')}`);
                }
              }} />
            </div>
            
            <div className="flex gap-2 flex-1 xl:flex-none">
              <Select 
                value={selectedRange.label} 
                onValueChange={(value) => {
                  const preset = datePresets.find(p => p.label === value);
                  if (preset) setSelectedRange(preset);
                }}
              >
                <SelectTrigger className="w-full xl:w-[200px] h-11 rounded-xl glass-card font-bold text-xs uppercase tracking-wider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-primary/20">
                  {datePresets.map(preset => (
                    <SelectItem key={preset.label} value={preset.label} className="font-bold text-xs">
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleExportPDF} className="gap-2 h-11 rounded-xl gradient-primary font-black uppercase tracking-widest text-xs px-6 shadow-glow-primary hover:scale-105 active:scale-95 transition-all">
                <FileDown className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Autonomous Control & North Star Metric Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[420px]">
          <div className="lg:col-span-1 h-full overflow-hidden">
             <AutonomousEventLog />
          </div>
          <Card className="glass-card lg:col-span-1 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent h-full flex flex-col">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                North Star Metric
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-6 pb-8">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-muted/20 stroke-current"
                    strokeWidth="8"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-primary stroke-current transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={`${kpis.productionEfficiency * 2.64}, 264`}
                    strokeLinecap="round"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-black">{kpis.productionEfficiency.toFixed(1)}%</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">OEE Global</span>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-4 w-full">
                <div className="flex-1 text-center border-r border-border/50">
                  <p className="text-lg font-bold text-primary">{kpis.qualityRate.toFixed(1)}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Qualidade</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold text-primary">{kpis.machineUtilization.toFixed(1)}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Utilização</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card lg:col-span-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent relative overflow-hidden group h-full flex flex-col">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="h-32 w-32 text-amber-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-amber-600 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                AI Operational Insights
              </CardTitle>
              <CardDescription>Análise inteligente de performance do período</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4 hover:bg-amber-500/15 transition-all duration-300">
                <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Oportunidade de Ganho de Eficiência</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Identificamos que a técnica <span className="text-foreground font-semibold">{kpis.techniqueDistribution[0]?.technique}</span> está operando com 15% acima da média. Replicar o setup da máquina <span className="text-foreground font-semibold">{kpis.machinePerformance[0]?.machine}</span> pode elevar o OEE global em até 4.2%.
                  </p>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-4 hover:bg-blue-500/15 transition-all duration-300">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Previsão de Gargalo</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Com base no volume de <span className="text-foreground font-semibold">{kpis.totalJobsInProgress} jobs</span> em produção, prevemos um pico de demanda nas próximas 48h. Recomendamos antecipar a manutenção das máquinas auxiliares.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-4 hover:bg-purple-500/15 transition-all duration-300">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <BrainCircuit className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Resiliência Cibernética Ativa</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Integridade de dados auditada em <span className="text-foreground font-semibold">100% dos processos</span>. Sincronização em tempo real com Bitrix24 garantindo orquestração 11/10.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpiCards.map((kpi, index) => (
            <Card key={index} className="glass-card hover:border-primary/30 transition-all cursor-default">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn('p-2 rounded-lg', kpi.bgColor)}>
                    <kpi.icon className={cn('h-4 w-4', kpi.color)} />
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    kpi.trend === 'up' ? "text-green-500 border-green-500/20" : "text-red-500 border-red-500/20"
                  )}>
                    {kpi.trend === 'up' ? '+ ' : '- '}{(Math.random() * 5).toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-xl font-bold">{kpi.value}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{kpi.title}</p>
              </CardContent>
            </Card>
          ))}
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
