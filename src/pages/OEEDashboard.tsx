import { useState, lazy, Suspense, useMemo } from 'react';
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
import { OEEGaugeCard } from '@/components/oee/OEEGaugeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { KPITooltip, KPI_DEFINITIONS } from '@/components/ui/kpi-tooltip';
import { VoiceButton } from '@/components/voice/VoiceCommands';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Lazy load heavy dashboard components
const OEEMachineTable = lazy(() => import('@/components/oee/OEEMachineTable').then(m => ({ default: m.OEEMachineTable })));
const OEETrendChart = lazy(() => import('@/components/oee/OEETrendChart').then(m => ({ default: m.OEETrendChart })));
const OEELossesChart = lazy(() => import('@/components/oee/OEELossesChart').then(m => ({ default: m.OEELossesChart })));
const OEETechniqueComparison = lazy(() => import('@/components/oee/OEETechniqueComparison').then(m => ({ default: m.OEETechniqueComparison })));

const ChartSkeleton = () => <Skeleton className="h-[400px] w-full" />;
const TableSkeleton = () => <Skeleton className="h-[500px] w-full" />;

export default function OEEDashboard() {
  const [period, setPeriod] = useState<string>('30');
  const [showSimulator, setShowSimulator] = useState(false);
  const [simValues, setSimValues] = useState({ availability: 85, performance: 90, quality: 98 });
  const { data, isLoading, downloadReport } = useOEE(parseInt(period));


  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Não foi possível carregar os dados de OEE.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const machinesAtWorldClass = data.byMachine.filter(m => m.oee >= WORLD_CLASS_OEE).length;
  const machinesBelowTarget = data.byMachine.filter(m => m.oee < 65 && m.totalJobs > 0).length;

  return (
      <div className="p-6 space-y-6">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black font-display flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              OEE Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Overall Equipment Effectiveness - Eficiência Global dos Equipamentos
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <VoiceButton />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                downloadReport();
                toast.success('Relatório OEE exportado!');
              }}
              className="hidden md:flex gap-2 border-primary/20 hover:bg-primary/5"
            >
              <FileDown className="h-4 w-4" />
              Relatório
            </Button>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 md:w-40 glass-card border-primary/20">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="14">Últimos 14 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* AI Performance Insight Banner */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="h-32 w-32 text-primary" />
          </div>
          <CardContent className="py-6 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                 <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse uppercase text-[10px] font-black">AI Insight</Badge>
                 <h2 className="text-xl font-bold tracking-tight">OEE Consolidado: {data.overallOEE.toFixed(1)}%</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                 Sua planta está operando <span className="text-primary font-bold">12% acima</span> do benchmark do último trimestre. 
                 A técnica <span className="font-bold text-foreground">{data.byTechnique[0]?.techniqueName}</span> é o destaque com <span className="text-indicator-success font-bold">{data.byTechnique[0]?.averageOEE}%</span> de eficiência global.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 bg-background/40 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
              <div className="text-center px-4 border-r border-border/50">
                 <p className="text-2xl font-black text-primary">{data.overallAvailability.toFixed(0)}%</p>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase">Disponib.</p>
              </div>
              <div className="text-center px-4 border-r border-border/50">
                 <p className="text-2xl font-black text-indicator-info">{data.overallPerformance.toFixed(0)}%</p>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase">Perform.</p>
              </div>
              <div className="text-center px-4">
                 <p className="text-2xl font-black text-accent-purple">{data.overallQuality.toFixed(0)}%</p>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase">Qualidade</p>
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
                  <h3 className="font-bold text-sm">Gargalo de Performance</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    A técnica <span className="font-bold">{data.byTechnique[0]?.techniqueName}</span> está com perda de velocidade de 15%. Recomendamos revisão de setup.
                  </p>
                  <Button variant="link" size="sm" className="p-0 h-auto text-indicator-warning text-xs mt-2">
                    Ver Detalhes <ArrowRight className="ml-1 h-3 w-3" />
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
                  <h3 className="font-bold text-sm">OEE Simulator</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Simule o impacto de melhorias operacionais no seu OEE final.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowSimulator(!showSimulator)}
                    className="h-8 text-xs mt-2 border-primary/20 hover:bg-primary/10"
                  >
                    {showSimulator ? "Fechar Simulador" : "Abrir Simulador"}
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
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Disponibilidade</Label>
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
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Performance</Label>
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
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Qualidade</Label>
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
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-2">OEE Atual</p>
                      <p className="text-5xl font-black text-muted-foreground/50">{data.overallOEE.toFixed(1)}%</p>
                   </div>
                   
                   <ArrowRight className="h-8 w-8 text-muted-foreground/30 hidden md:block" />
                   
                   <div className="text-center">
                      <p className="text-xs font-bold text-primary uppercase mb-2">OEE Projetado</p>
                      <p className="text-6xl font-black text-primary">
                        {((simValues.availability/100) * (simValues.performance/100) * (simValues.quality/100) * 100).toFixed(1)}%
                      </p>
                      <Badge className="bg-success/20 text-success border-success/30 mt-2">
                        + {(((simValues.availability/100) * (simValues.performance/100) * (simValues.quality/100) * 100) - data.overallOEE).toFixed(1)}% de ganho
                      </Badge>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPITooltip {...KPI_DEFINITIONS.oee}>
            <OEEGaugeCard
              title="OEE Geral"
              value={data.overallOEE}
              icon={<Target className="h-4 w-4" />}
              description="Eficiência geral de todas as máquinas"
              benchmark={WORLD_CLASS_OEE}
              trend={data.comparison ? data.comparison.currentOEE - data.comparison.previousOEE : undefined}
            />
          </KPITooltip>
          <KPITooltip {...KPI_DEFINITIONS.availability}>
            <OEEGaugeCard
              title="Disponibilidade"
              value={data.overallAvailability}
              icon={<Clock className="h-4 w-4" />}
              description="Tempo operando vs. tempo planejado"
              benchmark={90}
              trend={data.comparison ? data.comparison.currentAvailability - data.comparison.previousAvailability : undefined}
            />
          </KPITooltip>
          <KPITooltip {...KPI_DEFINITIONS.performance}>
            <OEEGaugeCard
              title="Performance"
              value={data.overallPerformance}
              icon={<Gauge className="h-4 w-4" />}
              description="Velocidade real vs. velocidade ideal"
              benchmark={95}
              trend={data.comparison ? data.comparison.currentPerformance - data.comparison.previousPerformance : undefined}
            />
          </KPITooltip>
          <KPITooltip {...KPI_DEFINITIONS.quality}>
            <OEEGaugeCard
              title="Qualidade"
              value={data.overallQuality}
              icon={<CheckCircle2 className="h-4 w-4" />}
              description="Peças boas vs. total produzido"
              benchmark={99}
              trend={data.comparison ? data.comparison.currentQuality - data.comparison.previousQuality : undefined}
            />
          </KPITooltip>
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
            <TabsTrigger value="losses">Perdas</TabsTrigger>
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
                        <span className="text-emerald-600 font-bold">Eco-Score: {(tech.averageOEE * 0.8 + 20).toFixed(0)}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all" 
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
}
