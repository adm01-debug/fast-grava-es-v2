import { useState, lazy, Suspense, useMemo, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  Clock,
  Gauge,
  Target,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Settings2,
  Leaf,
  Droplets,
  Zap,
  Sparkles,
  FileDown,
  ArrowRight,
  Calculator,
  Lightbulb,
  ArrowUpRight,
  Play
} from 'lucide-react';
import { useOEE, WORLD_CLASS_OEE, getOEEColor } from '@/hooks/useOEE';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
const OEEGaugeCard = lazy(() => import('@/components/oee/OEEGaugeCard').then(m => ({ default: m.OEEGaugeCard })));
import { Skeleton } from '@/components/ui/skeleton';
// Breadcrumbs are now handled globally in MainLayout
import { KPITooltip, KPI_DEFINITIONS } from '@/components/ui/kpi-tooltip';
import { VoiceButton } from '@/components/voice/VoiceCommands';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { KPIPageSkeleton, ChartSkeleton, TableSkeleton } from '@/components/loading';

// Lazy load heavy dashboard components
const OEEMachineTable = lazy(() => import('@/components/oee/OEEMachineTable').then(m => ({ default: m.OEEMachineTable })));
const OEETrendChart = lazy(() => import('@/components/oee/OEETrendChart').then(m => ({ default: m.OEETrendChart })));
const OEELossesChart = lazy(() => import('@/components/oee/OEELossesChart').then(m => ({ default: m.OEELossesChart })));
const OEETechniqueComparison = lazy(() => import('@/components/oee/OEETechniqueComparison').then(m => ({ default: m.OEETechniqueComparison })));

const OEEDashboard = memo(function OEEDashboard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<string>('30');
  const [showSimulator, setShowSimulator] = useState(false);
  const [simValues, setSimValues] = useState({ availability: 85, performance: 90, quality: 98 });
  const { data, isLoading, downloadReport } = useOEE(parseInt(period));

  const handleDownloadReport = useCallback(() => {
    downloadReport();
    toast.success(t('common.reportExported', 'Relatório OEE exportado!'));
  }, [downloadReport]);


  if (isLoading) {
    return <KPIPageSkeleton />;
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>{t('oee.loadingError', 'Não foi possível carregar os dados de OEE.')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const machinesAtWorldClass = data.byMachine.filter(m => m.oee >= WORLD_CLASS_OEE).length;
  const machinesBelowTarget = data.byMachine.filter(m => m.oee < 65 && m.totalJobs > 0).length;

  return (
      <div className="p-6 space-y-6">
        <Helmet>
          <title>OEE Dashboard | 52 STÚDIOS DE GRAVAÇÃO</title>
          <meta name="description" content="Análise de Eficiência Global dos Equipamentos (OEE) e indicadores de performance industrial." />
        </Helmet>
        {/* Breadcrumbs removed - handled by MainLayout */}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black font-display flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary animate-pulse" />
              OEE Industrial Core
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('oee.description', 'Overall Equipment Effectiveness - Eficiência Global dos Equipamentos')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <VoiceButton />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReport}
              className="hidden md:flex gap-2 border-primary/20 hover:bg-primary/5 active:scale-95 transition-transform"
            >
              <FileDown className="h-4 w-4" />
              {t('common.report', 'Relatório')}
            </Button>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 md:w-40 glass-card border-primary/20">
                <SelectValue placeholder={t('common.period', 'Período')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">{t('common.last7Days', 'Últimos 7 dias')}</SelectItem>
                <SelectItem value="14">{t('common.last14Days', 'Últimos 14 dias')}</SelectItem>
                <SelectItem value="30">{t('common.last30Days', 'Últimos 30 dias')}</SelectItem>
                <SelectItem value="90">{t('common.last90Days', 'Últimos 90 dias')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* AI Performance Insight Banner */}
        <Card className="bg-black/40 border-primary/30 backdrop-blur-2xl relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="h-32 w-32 text-primary" />
          </div>
          <CardContent className="py-6 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                 <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse uppercase text-[10px] font-black">AI Insight</Badge>
                 <h2 className="text-xl font-bold tracking-tight">{t('oee.consolidated', 'OEE Consolidado')}: {data.overallOEE.toFixed(1)}%</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {data.overallOEE >= 85 
                  ? "Sua planta está operando em nível de Classe Mundial. Mantenha a estabilidade dos processos." 
                  : data.overallOEE >= 65 
                  ? `A técnica ${data.byTechnique[0]?.techniqueName || 'principal'} está liderando a produtividade. Foque em reduzir perdas de disponibilidade para atingir 85%.`
                  : "Atenção: Eficiência global abaixo do esperado. Verifique o drill-down de perdas para identificar gargalos críticos."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 bg-background/40 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
              <div className="text-center px-4 border-r border-border/50">
                 <p className="text-2xl font-black text-primary">{data.overallAvailability.toFixed(0)}%</p>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('oee.availabilityShort', 'Disponib.')}</p>
              </div>
              <div className="text-center px-4 border-r border-border/50">
                 <p className="text-2xl font-black text-indicator-info">{data.overallPerformance.toFixed(0)}%</p>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('oee.performanceShort', 'Perform.')}</p>
              </div>
              <div className="text-center px-4">
                 <p className="text-2xl font-black text-accent-purple">{data.overallQuality.toFixed(0)}%</p>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('common.quality', 'Qualidade')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actionable Insights & Simulator Toggle */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Smart Actions */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-indicator-warning bg-indicator-warning/10">
              <CardContent className="p-4 flex gap-4">
                <div className="h-10 w-10 rounded-full bg-indicator-warning/20 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-5 w-5 text-indicator-warning" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{data.overallPerformance < 85 ? t('oee.performanceBottleneck', 'Gargalo de Performance') : 'Otimização Ativa'}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.overallPerformance < 85 
                      ? `A técnica ${data.byTechnique[0]?.techniqueName} apresenta perdas de velocidade. Recomendamos revisão de setup e calibração.`
                      : 'Performance estabilizada. Continue monitorando a qualidade para evitar retrabalhos.'}
                  </p>
                  <Button variant="link" size="sm" onClick={() => {
                    const tab = document.querySelector('[value="losses"]') as HTMLElement;
                    if (tab) tab.click();
                  }} className="p-0 h-auto text-indicator-warning text-xs mt-2">
                    {t('common.viewDetails', 'Ver Detalhes')} <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary bg-primary/5">
              <CardContent className="p-4 flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{t('oee.simulator', 'OEE Simulator')}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('oee.simulatorDescription', 'Simule o impacto de melhorias operacionais no seu OEE final.')}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSimulator(!showSimulator)}
                    className="h-8 text-xs mt-2 border-primary/20 hover:bg-primary/10"
                  >
                    {showSimulator ? t('oee.closeSimulator', 'Fechar Simulador') : t('oee.openSimulator', 'Abrir Simulador')}
                    <Play className={cn("ml-2 h-3 w-3 transition-transform", showSimulator && "rotate-90")} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Simulator Panel */}
        {showSimulator && (
          <Card className="border-primary/20 bg-muted/20 animate-in slide-in-from-top-4 duration-300">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('oee.availability', 'Disponibilidade')}</Label>
                      <span className="text-xs font-black">{simValues.availability}%</span>
                    </div>
                    <Slider
                      value={[simValues.availability]}
                      max={100}
                      step={1}
                      onValueChange={([v]) => setSimValues({...simValues, availability: v})}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('common.performance', 'Performance')}</Label>
                      <span className="text-xs font-black">{simValues.performance}%</span>
                    </div>
                    <Slider
                      value={[simValues.performance]}
                      max={100}
                      step={1}
                      onValueChange={([v]) => setSimValues({...simValues, performance: v})}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('common.quality', 'Qualidade')}</Label>
                      <span className="text-xs font-black">{simValues.quality}%</span>
                    </div>
                    <Slider
                      value={[simValues.quality]}
                      max={100}
                      step={1}
                      onValueChange={([v]) => setSimValues({...simValues, quality: v})}
                    />
                  </div>
                </div>

                <div className="lg:col-span-2 flex flex-col md:flex-row items-center justify-around gap-6 bg-background/50 rounded-2xl p-6 border border-border/50">
                   <div className="text-center">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-2">{t('oee.currentOEE', 'OEE Atual')}</p>
                      <p className="text-5xl font-black text-muted-foreground/50">{data.overallOEE.toFixed(1)}%</p>
                   </div>

                   <ArrowRight className="h-8 w-8 text-muted-foreground/30 hidden md:block" />

                   <div className="text-center">
                      <p className="text-xs font-bold text-primary uppercase mb-2">{t('oee.projectedOEE', 'OEE Projetado')}</p>
                      <p className="text-6xl font-black text-primary">
                        {((simValues.availability/100) * (simValues.performance/100) * (simValues.quality/100) * 100).toFixed(1)}%
                      </p>
                      <Badge className="bg-success/20 text-success border-success/30 mt-2">
                        + {(((simValues.availability/100) * (simValues.performance/100) * (simValues.quality/100) * 100) - data.overallOEE).toFixed(1)}% {t('oee.gain', 'de ganho')}
                      </Badge>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Metrics with OEE Formula Drill-down */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              {t('oee.drilldownTitle', 'Drill-down de Performance (Fórmula OEE)')}
            </h2>
            <div className="flex items-center gap-3">
               <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-1 h-3 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
               </div>
               <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary animate-pulse">REAL-TIME CALCULATION</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPITooltip {...KPI_DEFINITIONS.oee}>
              <OEEGaugeCard
                title={t('oee.generalOEE', 'OEE Geral')}
                value={data.overallOEE}
                icon={<Target className="h-4 w-4" />}
                description={t('oee.generalOEEDesc', 'Eficiência geral de todas as máquinas')}
                benchmark={WORLD_CLASS_OEE}
                trend={data.comparison ? data.comparison.currentOEE - data.comparison.previousOEE : undefined}
                className="border-primary/40 shadow-[0_0_25px_rgba(14,165,233,0.15)] bg-black/60 backdrop-blur-xl"
                variant="glass"
              />
            </KPITooltip>

            <KPITooltip {...KPI_DEFINITIONS.availability}>
              <OEEGaugeCard
                title={t('oee.availability', 'Disponibilidade')}
                value={data.overallAvailability}
                icon={<Clock className="h-4 w-4" />}
                description={t('oee.availabilityDesc', 'Tempo operando / Tempo planejado')}
                benchmark={90}
                trend={data.comparison ? data.comparison.currentAvailability - data.comparison.previousAvailability : undefined}
                variant="glass"
              />
            </KPITooltip>

            <KPITooltip {...KPI_DEFINITIONS.performance}>
              <OEEGaugeCard
                title={t('common.performance', 'Performance')}
                value={data.overallPerformance}
                icon={<Gauge className="h-4 w-4" />}
                description={t('oee.performanceDesc', 'Produção Real / Produção Estimada')}
                benchmark={95}
                trend={data.comparison ? data.comparison.currentPerformance - data.comparison.previousPerformance : undefined}
                variant="glass"
              />
            </KPITooltip>

            <KPITooltip {...KPI_DEFINITIONS.quality}>
              <OEEGaugeCard
                title={t('common.quality', 'Qualidade')}
                value={data.overallQuality}
                icon={<CheckCircle2 className="h-4 w-4" />}
                description={t('oee.qualityDesc', 'Peças Boas / Total Produzido')}
                benchmark={99}
                trend={data.comparison ? data.comparison.currentQuality - data.comparison.previousQuality : undefined}
                variant="glass"
              />
            </KPITooltip>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-muted/20 border-dashed border-border/50">
              <CardContent className="p-3 text-[10px] space-y-1">
                <p className="font-bold uppercase text-muted-foreground">{t('oee.availabilityCalculation', 'Cálculo de Disponibilidade')}</p>
                <div className="flex justify-between items-center bg-background/50 p-2 rounded">
                  <span className="font-mono">{data.byMachine.reduce((s, m) => s + m.actualOperatingMinutes, 0)} min</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="font-mono">{data.byMachine.reduce((s, m) => s + m.plannedProductionMinutes, 0)} min</span>
                  <span className="text-primary font-bold">= {data.overallAvailability.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/20 border-dashed border-border/50">
              <CardContent className="p-3 text-[10px] space-y-1">
                <p className="font-bold uppercase text-muted-foreground">{t('oee.performanceCalculation', 'Cálculo de Performance')}</p>
                <div className="flex justify-between items-center bg-background/50 p-2 rounded">
                  <span className="font-mono">{data.byMachine.reduce((s, m) => s + m.idealCycleMinutes, 0)} min (Est.)</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="font-mono">{data.byMachine.reduce((s, m) => s + m.actualOperatingMinutes, 0)} min (Real)</span>
                  <span className="text-indicator-info font-bold">= {data.overallPerformance.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/20 border-dashed border-border/50">
              <CardContent className="p-3 text-[10px] space-y-1">
                <p className="font-bold uppercase text-muted-foreground">Cálculo de Qualidade</p>
                <div className="flex justify-between items-center bg-background/50 p-2 rounded">
                  <span className="font-mono">{data.byMachine.reduce((s, m) => s + m.goodPieces, 0)} pcs (Boas)</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="font-mono">{data.byMachine.reduce((s, m) => s + m.totalPiecesProduced, 0)} pcs (Total)</span>
                  <span className="text-accent-purple font-bold">= {data.overallQuality.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Award className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{machinesAtWorldClass}</p>
                  <p className="text-xs text-muted-foreground">World Class (≥85%)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{machinesBelowTarget}</p>
                  <p className="text-xs text-muted-foreground">Abaixo do Target (&lt;65%)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Settings2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.byMachine.filter(m => m.totalJobs > 0).length}</p>
                  <p className="text-xs text-muted-foreground">Máquinas Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indicator-info/10">
                  <BarChart3 className="h-5 w-5 text-indicator-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.byTechnique.length}</p>
                  <p className="text-xs text-muted-foreground">Técnicas Analisadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="trend" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="trend">Evolução</TabsTrigger>
            <TabsTrigger id="oee-tabs-trigger-losses" value="losses">Perdas</TabsTrigger>
            <TabsTrigger value="techniques">Técnicas</TabsTrigger>
            <TabsTrigger value="machines">Máquinas</TabsTrigger>
            <TabsTrigger value="sustainability" className="text-emerald-600 flex items-center gap-1.5">
              <Leaf className="h-3 w-3" />
              Sustentabilidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trend">
            <Suspense fallback={<ChartSkeleton />}>
              <OEETrendChart
                data={data.trendData}
                worldClassBenchmark={data.worldClassBenchmark}
                comparison={data.comparison}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="losses">
            <Suspense fallback={<ChartSkeleton />}>
              <OEELossesChart
                availabilityLosses={data.availabilityLosses}
                performanceLosses={data.performanceLosses}
                qualityLosses={data.qualityLosses}
                overallOEE={data.overallOEE}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="techniques">
            <Suspense fallback={<ChartSkeleton />}>
              <OEETechniqueComparison
                techniques={data.byTechnique}
                worldClassBenchmark={data.worldClassBenchmark}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="machines">
            <Suspense fallback={<TableSkeleton />}>
              <OEEMachineTable machines={data.byMachine} />
            </Suspense>
          </TabsContent>


          <TabsContent value="sustainability" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-success/5 border-success/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-success/20 rounded-full text-success">
                      <Leaf className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-foreground">Resíduos Evitados</h3>
                    <p className="text-3xl font-black text-success">{(data.overallQuality * 100).toFixed(0)} kg</p>
                    <p className="text-xs text-success/80 font-medium">Estimativa de material salvo por alta qualidade</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-indicator-info/5 border-indicator-info/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-indicator-info/20 rounded-full text-indicator-info">
                      <Droplets className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-foreground">Otimização de Insumos</h3>
                    <p className="text-3xl font-black text-indicator-info">{(data.overallPerformance * 1.2).toFixed(1)}%</p>
                    <p className="text-xs text-indicator-info/80 font-medium">Economia de tintas/solventes por performance</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-warning/5 border-warning/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-warning/20 rounded-full text-warning">
                      <Zap className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-foreground">Eficiência Energética</h3>
                    <p className="text-3xl font-black text-warning">{(data.overallAvailability * 0.9).toFixed(1)}%</p>
                    <p className="text-xs text-warning/80 font-medium">Redução de tempo em idle (ociosidade)</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Impacto Ambiental por Técnica</h3>
                    <p className="text-xs text-muted-foreground">Redução de emissões e resíduos por tipo de processo</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {data.byTechnique.map((tech) => (
                    <div key={tech.techniqueId} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{tech.techniqueName}</span>
                        <span className="text-success font-bold">Eco-Score: {(tech.averageOEE * 0.8 + 20).toFixed(0)}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success transition-all"
                          style={{ width: `${tech.averageOEE}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Benchmark Info */}
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Benchmarks de OEE na Indústria</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-muted-foreground">
                  <div><span className="text-indicator-success font-medium">≥85%</span> World Class</div>
                  <div><span className="text-success font-medium">75-84%</span> Excelente</div>
                  <div><span className="text-indicator-warning font-medium">65-74%</span> Bom</div>
                  <div><span className="text-priority-high font-medium">50-64%</span> Aceitável</div>
                  <div><span className="text-primary font-medium">&lt;50%</span> Crítico</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
});

export default OEEDashboard;
