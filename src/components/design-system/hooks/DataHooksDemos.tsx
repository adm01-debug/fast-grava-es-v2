import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Database, BarChart } from "lucide-react";
import { HookDemo } from "./HookDemo";

export const UseSchedulingDataDemo = () => {
  const [state, setState] = useState<{ isLoading: boolean; data: { jobs: number; pending: number; inProgress: number; completed: number } | null }>({
    isLoading: false,
    data: { jobs: 45, pending: 12, inProgress: 8, completed: 25 },
  });

  const simulate = () => {
    setState({ isLoading: true, data: null });
    setTimeout(() => {
      setState({
        isLoading: false,
        data: { 
          jobs: Math.floor(Math.random() * 50) + 30, 
          pending: Math.floor(Math.random() * 15) + 5, 
          inProgress: Math.floor(Math.random() * 10) + 3, 
          completed: Math.floor(Math.random() * 30) + 15 
        },
      });
    }, 1000);
  };

  return (
    <HookDemo
      title="useSchedulingData"
      description="Hook centralizado para dados de agendamento com real-time"
      icon={Database}
      code={`const { jobs, techniques, machines, stats, isLoading } = useSchedulingData();

// Uso dos dados
<div>Total: {stats.totalJobs}</div>
<div>Em produção: {stats.inProgressJobs}</div>`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status da Query</span>
          <Button size="sm" variant="outline" onClick={simulate}>
            <RefreshCw className={`h-4 w-4 mr-2 ${state.isLoading ? "animate-spin" : ""}`} />
            Simular Fetch
          </Button>
        </div>

        {state.isLoading ? (
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : state.data ? (
          <div className="grid grid-cols-4 gap-2">
            <div className="p-3 rounded-lg bg-background border text-center">
              <div className="text-2xl font-bold text-foreground">{state.data.jobs}</div>
              <div className="text-xs text-muted-foreground">Total Jobs</div>
            </div>
            <div className="p-3 rounded-lg bg-background border text-center">
              <div className="text-2xl font-bold text-warning">{state.data.pending}</div>
              <div className="text-xs text-muted-foreground">Na Fila</div>
            </div>
            <div className="p-3 rounded-lg bg-background border text-center">
              <div className="text-2xl font-bold text-primary">{state.data.inProgress}</div>
              <div className="text-xs text-muted-foreground">Em Produção</div>
            </div>
            <div className="p-3 rounded-lg bg-background border text-center">
              <div className="text-2xl font-bold text-success">{state.data.completed}</div>
              <div className="text-xs text-muted-foreground">Finalizados</div>
            </div>
          </div>
        ) : null}

        <Badge variant={state.isLoading ? "secondary" : "outline"} className="text-xs">
          {state.isLoading ? "Carregando..." : "Sincronizado em tempo real"}
        </Badge>
      </div>
    </HookDemo>
  );
};

export const UseKPIsDemo = () => {
  const [kpis] = useState({
    occupancyRate: 78,
    lossRate: 3.2,
    delayRate: 5.8,
    avgProductionTime: 45
  });

  return (
    <HookDemo
      title="useKPIs"
      description="Indicadores chave de performance calculados"
      icon={BarChart}
      code={`const { data } = useKPIs(jobs, machines, techniques);

// Métricas disponíveis
<div>Ocupação: {data.occupancyRate}%</div>
<div>Taxa de Perda: {data.lossRate}%</div>
<div>Taxa de Atraso: {data.delayRate}%</div>`}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Ocupação</span>
              <span className="font-mono">{kpis.occupancyRate}%</span>
            </div>
            <Progress value={kpis.occupancyRate} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Taxa de Perda</span>
              <span className="font-mono text-destructive">{kpis.lossRate}%</span>
            </div>
            <Progress value={kpis.lossRate} className="h-2 [&>div]:bg-destructive" />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline">Tempo Médio: {kpis.avgProductionTime}min</Badge>
          <Badge variant="outline">Atrasos: {kpis.delayRate}%</Badge>
        </div>
      </div>
    </HookDemo>
  );
};
