import { useState } from 'react';
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
  Settings2
} from 'lucide-react';
import { useOEE, WORLD_CLASS_OEE, getOEEColor } from '@/hooks/useOEE';
import { OEEGaugeCard } from '@/components/oee/OEEGaugeCard';
import { OEEMachineTable } from '@/components/oee/OEEMachineTable';
import { OEETrendChart } from '@/components/oee/OEETrendChart';
import { OEELossesChart } from '@/components/oee/OEELossesChart';
import { OEETechniqueComparison } from '@/components/oee/OEETechniqueComparison';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { KPITooltip, KPI_DEFINITIONS } from '@/components/ui/kpi-tooltip';
import { VoiceButton } from '@/components/voice/VoiceCommands';

export default function OEEDashboard() {
  const [period, setPeriod] = useState<string>('30');
  const { data, isLoading } = useOEE(parseInt(period));

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
            <h1 className="text-2xl md:text-3xl font-bold font-display flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              OEE Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Overall Equipment Effectiveness - Eficiência Global dos Equipamentos
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <VoiceButton />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
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

        {/* OEE Formula Explanation */}
        <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm md:text-base">
              <span className="font-medium">OEE =</span>
              <Badge variant="outline" className="bg-success/10 border-success text-success">
                Disponibilidade
              </Badge>
              <span>×</span>
              <Badge variant="outline" className="bg-blue-500/10 border-blue-500 text-blue-500">
                Performance
              </Badge>
              <span>×</span>
              <Badge variant="outline" className="bg-purple-500/10 border-purple-500 text-purple-500">
                Qualidade
              </Badge>
              <span>=</span>
              <Badge 
                className="text-lg font-bold"
                style={{ 
                  backgroundColor: getOEEColor(data.overallOEE),
                  color: 'white'
                }}
              >
                {data.overallOEE.toFixed(1)}%
              </Badge>
              {data.overallOEE >= WORLD_CLASS_OEE && (
                <Award className="h-5 w-5 text-primary ml-2" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPITooltip {...KPI_DEFINITIONS.oee}>
            <OEEGaugeCard
              title="OEE Geral"
              value={data.overallOEE}
              icon={<Target className="h-4 w-4" />}
              description="Eficiência geral de todas as máquinas"
              benchmark={WORLD_CLASS_OEE}
            />
          </KPITooltip>
          <KPITooltip {...KPI_DEFINITIONS.availability}>
            <OEEGaugeCard
              title="Disponibilidade"
              value={data.overallAvailability}
              icon={<Clock className="h-4 w-4" />}
              description="Tempo operando vs. tempo planejado"
              benchmark={90}
            />
          </KPITooltip>
          <KPITooltip {...KPI_DEFINITIONS.performance}>
            <OEEGaugeCard
              title="Performance"
              value={data.overallPerformance}
              icon={<Gauge className="h-4 w-4" />}
              description="Velocidade real vs. velocidade ideal"
              benchmark={95}
            />
          </KPITooltip>
          <KPITooltip {...KPI_DEFINITIONS.quality}>
            <OEEGaugeCard
              title="Qualidade"
              value={data.overallQuality}
              icon={<CheckCircle2 className="h-4 w-4" />}
              description="Peças boas vs. total produzido"
              benchmark={99}
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
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
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
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="trend">Evolução</TabsTrigger>
            <TabsTrigger value="losses">Perdas</TabsTrigger>
            <TabsTrigger value="techniques">Técnicas</TabsTrigger>
            <TabsTrigger value="machines">Máquinas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trend">
            <OEETrendChart 
              data={data.trendData} 
              worldClassBenchmark={data.worldClassBenchmark} 
              comparison={data.comparison}
            />
          </TabsContent>
          
          <TabsContent value="losses">
            <OEELossesChart
              availabilityLosses={data.availabilityLosses}
              performanceLosses={data.performanceLosses}
              qualityLosses={data.qualityLosses}
              overallOEE={data.overallOEE}
            />
          </TabsContent>
          
          <TabsContent value="techniques">
            <OEETechniqueComparison 
              techniques={data.byTechnique}
              worldClassBenchmark={data.worldClassBenchmark}
            />
          </TabsContent>
          
          <TabsContent value="machines">
            <OEEMachineTable machines={data.byMachine} />
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
                  <div><span className="text-success font-medium">≥85%</span> World Class</div>
                  <div><span className="text-green-600 font-medium">75-84%</span> Excelente</div>
                  <div><span className="text-yellow-500 font-medium">65-74%</span> Bom</div>
                  <div><span className="text-orange-500 font-medium">50-64%</span> Aceitável</div>
                  <div><span className="text-primary font-medium">&lt;50%</span> Crítico</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
