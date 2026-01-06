import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useKPIs, formatDuration } from '@/hooks/useKPIs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Percent,
  Factory,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { KPITooltip, KPI_DEFINITIONS } from '@/components/ui/kpi-tooltip';

export default function KPIDashboard() {
  const { data: kpis, isLoading } = useKPIs();

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
        </div>
      </MainLayout>
    );
  }

  if (!kpis) {
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
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold">
            <span className="gradient-text">Dashboard de KPIs</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Métricas de produtividade e performance
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <KPITooltip 
            title="Taxa de Conclusão" 
            description="Percentual de jobs finalizados em relação ao total."
            formula="Jobs Concluídos / Total de Jobs"
            target="≥ 95%"
          >
            <Card className="glass-card">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Taxa de Conclusão</p>
                    <p className="text-2xl sm:text-3xl font-bold">{completionRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {kpis.completedJobs} de {kpis.totalJobs} jobs
                    </p>
                  </div>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                  </div>
                </div>
                <Progress value={completionRate} className="mt-3 h-2 [&>div]:bg-green-500" />
              </CardContent>
            </Card>
          </KPITooltip>

          <KPITooltip 
            title="Ocupação Média" 
            description="Percentual médio de utilização das máquinas."
            formula="Tempo em Uso / Tempo Disponível"
            target="≥ 80%"
          >
            <Card className="glass-card">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Ocupação Média</p>
                    <p className="text-2xl sm:text-3xl font-bold">{kpis.averageOccupancy.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      das máquinas em uso
                    </p>
                  </div>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Factory className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                  </div>
                </div>
                <Progress value={kpis.averageOccupancy} className="mt-3 h-2 [&>div]:bg-cyan-500" />
              </CardContent>
            </Card>
          </KPITooltip>

          <KPITooltip {...KPI_DEFINITIONS.lossRate}>
            <Card className="glass-card">
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
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {kpis.lostPieces.toLocaleString()} peças perdidas
                    </p>
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

          <Card className="glass-card">
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
                  <p className="text-xs text-muted-foreground mt-1">
                    requerem atenção
                  </p>
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
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Status Distribution */}
          <Card className="glass-card">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                Distribuição de Status
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
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
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Productivity by Technique */}
          <Card className="glass-card">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Percent className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                Ocupação por Técnica
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={kpis.productivityByTechnique} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                  <YAxis 
                    dataKey="techniqueName" 
                    type="category" 
                    width={80} 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Ocupação']}
                  />
                  <Bar dataKey="occupancyRate" radius={[0, 4, 4, 0]}>
                    {kpis.productivityByTechnique.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Productivity Table */}
        <Card className="glass-card">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
              Produtividade por Técnica
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Técnica</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Jobs</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Concluídos</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Peças</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Perdas</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Tempo</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Ocupação</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.productivityByTechnique.map((tech) => (
                    <tr key={tech.techniqueId} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: tech.color }} 
                          />
                          <span className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{tech.techniqueName}</span>
                        </div>
                      </td>
                      <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{tech.jobCount}</td>
                      <td className="text-center py-2 sm:py-3 px-2 sm:px-4">
                        <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs">
                          {tech.completedJobs}
                        </Badge>
                      </td>
                      <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{tech.totalPieces.toLocaleString()}</td>
                      <td className="text-center py-2 sm:py-3 px-2 sm:px-4">
                        <span className={`text-xs sm:text-sm ${tech.lostPieces > 0 ? "text-primary" : "text-muted-foreground"}`}>
                          {tech.lostPieces}
                        </span>
                      </td>
                      <td className="text-center py-2 sm:py-3 px-2 sm:px-4">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs sm:text-sm">
                          <Clock className="h-3 w-3 hidden sm:block" />
                          {formatDuration(Math.round(tech.avgDuration))}
                        </div>
                      </td>
                      <td className="text-center py-2 sm:py-3 px-2 sm:px-4">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <Progress 
                            value={tech.occupancyRate} 
                            className="w-10 sm:w-16 h-2"
                          />
                          <span className="text-xs sm:text-sm">{tech.occupancyRate.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Today Stats */}
        <Card className="glass-card border-primary/20">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Resumo do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              <div className="text-center p-3 sm:p-4 rounded-lg bg-muted/20">
                <p className="text-xl sm:text-2xl font-bold text-primary">{kpis.todayStats.scheduled}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Agendados</p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-lg bg-cyan-500/10">
                <p className="text-xl sm:text-2xl font-bold text-cyan-400">{kpis.todayStats.inProgress}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Em Produção</p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-lg bg-green-500/10">
                <p className="text-xl sm:text-2xl font-bold text-green-400">{kpis.todayStats.completed}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Concluídos</p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-lg bg-primary/10">
                <p className="text-xl sm:text-2xl font-bold text-primary">{kpis.todayStats.delayed}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Atrasados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
