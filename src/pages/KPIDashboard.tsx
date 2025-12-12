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
    { name: 'Atrasados', value: kpis.delayedJobs, color: '#EF4444' },
    { name: 'Outros', value: kpis.totalJobs - kpis.completedJobs - kpis.inProgressJobs - kpis.delayedJobs, color: '#6B7280' },
  ].filter(d => d.value > 0);

  return (
    <MainLayout>
      <div className="p-8 space-y-6 animate-fade-in-up">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">
            <span className="gradient-text">Dashboard de KPIs</span>
          </h1>
          <p className="text-muted-foreground">
            Métricas de produtividade e performance
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                  <p className="text-3xl font-bold">{completionRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpis.completedJobs} de {kpis.totalJobs} jobs
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <Progress value={completionRate} className="mt-3 h-2 [&>div]:bg-green-500" />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ocupação Média</p>
                  <p className="text-3xl font-bold">{kpis.averageOccupancy.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    das máquinas em uso
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Factory className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
              <Progress value={kpis.averageOccupancy} className="mt-3 h-2 [&>div]:bg-cyan-500" />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Índice de Perdas</p>
                  <p className={cn(
                    "text-3xl font-bold",
                    kpis.lossRate > 5 ? "text-red-400" : kpis.lossRate > 2 ? "text-amber-400" : "text-green-400"
                  )}>
                    {kpis.lossRate.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpis.lostPieces.toLocaleString()} peças perdidas
                  </p>
                </div>
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center",
                  kpis.lossRate > 5 ? "bg-red-500/20" : kpis.lossRate > 2 ? "bg-amber-500/20" : "bg-green-500/20"
                )}>
                  {kpis.lossRate > 2 ? (
                    <TrendingDown className={cn("h-6 w-6", kpis.lossRate > 5 ? "text-red-400" : "text-amber-400")} />
                  ) : (
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Jobs Atrasados</p>
                  <p className={cn(
                    "text-3xl font-bold",
                    kpis.delayedJobs > 0 ? "text-red-400" : "text-green-400"
                  )}>
                    {kpis.delayedJobs}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    requerem atenção
                  </p>
                </div>
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center",
                  kpis.delayedJobs > 0 ? "bg-red-500/20" : "bg-green-500/20"
                )}>
                  <AlertTriangle className={cn("h-6 w-6", kpis.delayedJobs > 0 ? "text-red-400" : "text-green-400")} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <Card className="glass-card">
            <CardHeader>
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
                    outerRadius={100}
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
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Productivity by Technique */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Percent className="h-5 w-5 text-cyan-400" />
                Ocupação por Técnica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={kpis.productivityByTechnique} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    dataKey="techniqueName" 
                    type="category" 
                    width={120} 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
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
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-400" />
              Produtividade por Técnica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Técnica</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Jobs</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Concluídos</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Peças</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Perdas</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Tempo Médio</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Ocupação</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.productivityByTechnique.map((tech) => (
                    <tr key={tech.techniqueId} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: tech.color }} 
                          />
                          <span className="font-medium">{tech.techniqueName}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">{tech.jobCount}</td>
                      <td className="text-center py-3 px-4">
                        <Badge variant="outline" className="border-green-500/50 text-green-400">
                          {tech.completedJobs}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">{tech.totalPieces.toLocaleString()}</td>
                      <td className="text-center py-3 px-4">
                        <span className={tech.lostPieces > 0 ? "text-red-400" : "text-muted-foreground"}>
                          {tech.lostPieces}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDuration(Math.round(tech.avgDuration))}
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Progress 
                            value={tech.occupancyRate} 
                            className="w-16 h-2"
                          />
                          <span className="text-sm">{tech.occupancyRate.toFixed(0)}%</span>
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
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Resumo do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/20">
                <p className="text-2xl font-bold text-primary">{kpis.todayStats.scheduled}</p>
                <p className="text-sm text-muted-foreground">Agendados</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-cyan-500/10">
                <p className="text-2xl font-bold text-cyan-400">{kpis.todayStats.inProgress}</p>
                <p className="text-sm text-muted-foreground">Em Produção</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-500/10">
                <p className="text-2xl font-bold text-green-400">{kpis.todayStats.completed}</p>
                <p className="text-sm text-muted-foreground">Concluídos</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-500/10">
                <p className="text-2xl font-bold text-red-400">{kpis.todayStats.delayed}</p>
                <p className="text-sm text-muted-foreground">Atrasados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
