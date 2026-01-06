import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { FavoritesDropdown } from '@/components/favorites/FavoritesDropdown';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { KPITooltip, KPI_DEFINITIONS } from '@/components/ui/kpi-tooltip';
import { 
  Layers, 
  Scale, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Palette,
  Package,
  Timer,
  BarChart3,
  History,
  Command
} from 'lucide-react';
import { useSmartSequencing } from '@/hooks/useSmartSequencing';
import { useLoadBalancing } from '@/hooks/useLoadBalancing';
import { useBottleneckPrediction } from '@/hooks/useBottleneckPrediction';
import { useEfficiencyAlertHistory } from '@/hooks/useEfficiencyAlertHistory';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EfficiencyDashboard() {
  const navigate = useNavigate();
  const { suggestions: sequencingSuggestions, totalSavings } = useSmartSequencing();
  const { byTechnique, suggestions: balancingSuggestions, isLoading: loadBalancingLoading } = useLoadBalancing();
  const { alerts, capacityByDate, isLoading: bottleneckLoading, criticalCount } = useBottleneckPrediction();
  const { resolvedAlerts, isLoading: historyLoading } = useEfficiencyAlertHistory();

  const isLoading = loadBalancingLoading || bottleneckLoading;

  // Calculate overall efficiency metrics
  const totalSetupSaved = totalSavings;
  
  // Calculate machine loads from byTechnique data
  const allMachineLoads = byTechnique.flatMap(t => t.machines);
  const balancedMachines = allMachineLoads.filter(m => m.occupancyRate >= 30 && m.occupancyRate <= 80).length;
  const totalMachines = allMachineLoads.length;
  const criticalBottlenecks = criticalCount || 0;
  const avgOccupancy = totalMachines > 0 
    ? Math.round(allMachineLoads.reduce((acc, m) => acc + m.occupancyRate, 0) / totalMachines)
    : 0;

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                Eficiência Operacional
              </h1>
              <FavoriteButton 
                pageId="efficiency" 
                pageName="Eficiência Operacional" 
                pageUrl="/efficiency" 
              />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Análises e otimizações para maximizar produtividade
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <FavoritesDropdown onNavigate={(url) => navigate(url)} />
            <Badge variant="outline" className="gap-1 text-xs hidden sm:flex">
              <Command className="h-3 w-3" />K para buscar
            </Badge>
            <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Histórico
            </Button>
            <Button size="sm" className="gap-1.5 sm:gap-2 gradient-primary text-xs sm:text-sm">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Otimizar
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPITooltip
            title="Setup Economizado"
            description="Tempo total economizado através de sequenciamento inteligente de jobs por cor."
            formula="Soma de (tempo setup normal - tempo setup otimizado)"
            target="Maximizar"
            trend={totalSetupSaved > 0 ? 'up' : 'stable'}
            trendValue={`${totalSetupSaved}min`}
          >
            <Card className="glass-card border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10">
                    <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{totalSetupSaved}min</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Setup Economizado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </KPITooltip>

          <KPITooltip
            title="Máquinas Balanceadas"
            description="Máquinas com ocupação entre 30% e 80%, considerado o range ideal."
            formula="Máquinas (30% ≤ ocupação ≤ 80%) / Total"
            target="100%"
            benchmark="Ideal: 80%+"
          >
            <Card className="glass-card border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-success/10">
                    <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold text-foreground">{balancedMachines}/{totalMachines}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Balanceadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </KPITooltip>

          <KPITooltip
            title="Gargalos Críticos"
            description="Técnicas ou máquinas operando acima de 90% da capacidade."
            formula="Count(ocupação > 90%)"
            target="0"
            trend={criticalBottlenecks > 0 ? 'down' : 'stable'}
            trendValue={criticalBottlenecks > 0 ? 'Atenção necessária' : 'OK'}
          >
            <Card className="glass-card border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-warning/10">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold text-foreground">{criticalBottlenecks}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Gargalos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </KPITooltip>

          <KPITooltip
            {...KPI_DEFINITIONS.efficiency}
            trend={avgOccupancy >= 60 ? 'up' : avgOccupancy >= 40 ? 'stable' : 'down'}
            trendValue={`${avgOccupancy}%`}
          >
            <Card className="glass-card border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-accent/10">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold text-foreground">{avgOccupancy}%</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Ocupação</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </KPITooltip>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="sequencing" className="space-y-4">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="glass-card p-1 inline-flex w-auto min-w-full sm:min-w-0">
              <TabsTrigger value="sequencing" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Sequenc.</span>
              </TabsTrigger>
              <TabsTrigger value="balancing" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Scale className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Balanc.</span>
              </TabsTrigger>
              <TabsTrigger value="bottlenecks" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Gargalos</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Histórico</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Sequencing Tab */}
          <TabsContent value="sequencing" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sequencingSuggestions.map((suggestion, index) => (
                <Card key={index} className="glass-card border-border/50 hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10"
                        >
                          <Palette className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{suggestion.machineName}</CardTitle>
                          <CardDescription>{suggestion.techniqueName}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        -{suggestion.estimatedSavings}min setup
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{suggestion.colorGroups.length} grupos de cor</span>
                    </div>
                    <div className="space-y-2">
                      {suggestion.colorGroups.slice(0, 3).map((group, gIdx) => (
                        <div 
                          key={gIdx} 
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm"
                        >
                          <span className="font-medium capitalize">{group.color}</span>
                          <span className="text-muted-foreground">{group.jobCount} jobs</span>
                        </div>
                      ))}
                      {suggestion.colorGroups.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{suggestion.colorGroups.length - 3} grupos adicionais
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      Aplicar Sequenciamento
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {sequencingSuggestions.length === 0 && (
                <Card className="glass-card border-border/50 col-span-2">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-success mb-4" />
                    <h3 className="font-semibold text-foreground">Sequenciamento Otimizado</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Não há oportunidades de agrupamento no momento
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Load Balancing Tab */}
          <TabsContent value="balancing" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Machine Loads */}
              <Card className="glass-card border-border/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Ocupação por Máquina</CardTitle>
                  <CardDescription>Distribuição atual de carga de trabalho</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {allMachineLoads.slice(0, 10).map((machine) => (
                    <div key={machine.machine.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{machine.machine.name}</span>
                        <span className={
                          machine.occupancyRate > 80 ? 'text-destructive' :
                          machine.occupancyRate < 30 ? 'text-warning' : 'text-success'
                        }>
                          {Math.round(machine.occupancyRate)}%
                        </span>
                      </div>
                      <Progress 
                        value={machine.occupancyRate} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{machine.jobCount} jobs</span>
                        <span>{machine.scheduledMinutes}min agendados</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Suggestions */}
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Sugestões</CardTitle>
                  <CardDescription>Ações recomendadas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {balancingSuggestions.slice(0, 5).map((suggestion, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2"
                    >
                      <div className="flex items-start gap-2">
                        <Scale className="h-4 w-4 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{suggestion.currentMachineName}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ArrowRight className="h-3 w-3" />
                            <span>{suggestion.suggestedMachineName}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.orderNumber}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Aplicar
                      </Button>
                    </div>
                  ))}

                  {balancingSuggestions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle2 className="h-8 w-8 text-success mb-2" />
                      <p className="text-sm text-muted-foreground">Carga balanceada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bottlenecks Tab */}
          <TabsContent value="bottlenecks" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map((alert) => (
                <Card 
                  key={alert.id}
                  className={`glass-card border-border/50 ${
                    alert.severity === 'critical' ? 'border-destructive/50' :
                    alert.severity === 'warning' ? 'border-warning/50' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{alert.techniqueName}</CardTitle>
                      <Badge 
                        variant={
                          alert.severity === 'critical' ? 'destructive' :
                          alert.severity === 'warning' ? 'secondary' : 'outline'
                        }
                      >
                        {alert.severity === 'critical' ? 'Crítico' :
                         alert.severity === 'warning' ? 'Atenção' : 'Info'}
                      </Badge>
                    </div>
                    <CardDescription>{alert.dateLabel}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ocupação</span>
                        <span className="font-medium">{Math.round(alert.currentCapacity)}%</span>
                      </div>
                      <Progress value={alert.currentCapacity} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-muted-foreground text-xs">Jobs Agendados</p>
                        <p className="font-semibold">{alert.jobCount}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-muted-foreground text-xs">Máquinas</p>
                        <p className="font-semibold">{alert.machineCount}</p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      💡 {alert.recommendation}
                    </p>
                  </CardContent>
                </Card>
              ))}

              {alerts.length === 0 && (
                <Card className="glass-card border-border/50 col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-success mb-4" />
                    <h3 className="font-semibold text-foreground">Sem Gargalos</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Nenhuma técnica próxima da saturação
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Otimizações</CardTitle>
                <CardDescription>Alertas resolvidos e ações aplicadas</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : resolvedAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="font-semibold text-foreground">Nenhum histórico</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Alertas resolvidos aparecerão aqui
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resolvedAlerts.slice(0, 10).map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <div className={`p-2 rounded-lg ${
                          item.alert_type === 'load_balancing' ? 'bg-success/10' : 'bg-warning/10'
                        }`}>
                          {item.alert_type === 'load_balancing' ? (
                            <Scale className="h-4 w-4 text-success" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-warning" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.resolution_notes || item.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Resolvido em {format(new Date(item.resolved_at!), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <Badge variant="outline" className={`${
                          item.severity === 'error' ? 'border-destructive text-destructive' :
                          item.severity === 'warning' ? 'border-warning text-warning' :
                          'border-muted-foreground text-muted-foreground'
                        }`}>
                          {item.severity === 'error' ? 'Crítico' :
                           item.severity === 'warning' ? 'Alerta' : 'Info'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
