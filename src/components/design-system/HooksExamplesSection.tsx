import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Code, 
  Play, 
  RefreshCw, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Database,
  Activity,
  Users,
  BarChart,
  Gauge,
  Wrench,
  DollarSign,
  Brain,
  BookOpen,
  Zap
} from "lucide-react";

// Simulated hook states for demonstration
interface SimulatedState {
  isLoading: boolean;
  data: unknown;
  error: string | null;
}

const HookDemo = ({ 
  title, 
  description, 
  code, 
  children,
  icon: Icon = Code
}: { 
  title: string; 
  description: string; 
  code: string; 
  children: React.ReactNode;
  icon?: React.ElementType;
}) => (
  <Card className="card-interactive">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        {children}
      </div>
      <CodeBlock code={code} label="Código" />
    </CardContent>
  </Card>
);

// Demo: useSchedulingData
const UseSchedulingDataDemo = () => {
  const [state, setState] = useState<SimulatedState>({
    isLoading: false,
    data: { jobs: 45, pending: 12, inProgress: 8, completed: 25 },
    error: null
  });

  const simulate = () => {
    setState({ isLoading: true, data: null, error: null });
    setTimeout(() => {
      setState({
        isLoading: false,
        data: { 
          jobs: Math.floor(Math.random() * 50) + 30, 
          pending: Math.floor(Math.random() * 15) + 5, 
          inProgress: Math.floor(Math.random() * 10) + 3, 
          completed: Math.floor(Math.random() * 30) + 15 
        },
        error: null
      });
    }, 1000);
  };

  const stats = state.data as { jobs: number; pending: number; inProgress: number; completed: number } | null;

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
        ) : stats ? (
          <div className="grid grid-cols-4 gap-2">
            <div className="p-3 rounded-lg bg-background border text-center">
              <div className="text-2xl font-bold text-foreground">{stats.jobs}</div>
              <div className="text-xs text-muted-foreground">Total Jobs</div>
            </div>
            <div className="p-3 rounded-lg bg-background border text-center">
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
              <div className="text-xs text-muted-foreground">Na Fila</div>
            </div>
            <div className="p-3 rounded-lg bg-background border text-center">
              <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
              <div className="text-xs text-muted-foreground">Em Produção</div>
            </div>
            <div className="p-3 rounded-lg bg-background border text-center">
              <div className="text-2xl font-bold text-success">{stats.completed}</div>
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

// Demo: useKPIs
const UseKPIsDemo = () => {
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

// Demo: useLoadBalancingWithActions
const UseLoadBalancingDemo = () => {
  const [suggestions] = useState([
    { from: "SER-01", to: "SER-02", job: "OS-1234", loadDiff: 35 },
    { from: "SER-01", to: "SER-03", job: "OS-1235", loadDiff: 28 },
  ]);
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<string[]>([]);

  const apply = (job: string) => {
    setApplying(job);
    setTimeout(() => {
      setApplying(null);
      setApplied(prev => [...prev, job]);
    }, 800);
  };

  return (
    <HookDemo
      title="useLoadBalancingWithActions"
      description="Análise e redistribuição de carga entre máquinas"
      icon={Activity}
      code={`const { 
  suggestions, 
  applySuggestion,
  applyAllSuggestions,
  isApplying 
} = useLoadBalancingWithActions();

// Aplicar sugestão
await applySuggestion(suggestion);`}
    >
      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <div 
            key={i} 
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              applied.includes(s.job) ? "bg-success/10 border-success/30" : "bg-background"
            }`}
          >
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono">{s.job}</Badge>
              <span className="text-sm text-muted-foreground">
                {s.from} → {s.to}
              </span>
              <Badge variant="secondary" className="text-xs">
                -{s.loadDiff}% carga
              </Badge>
            </div>
            <Button 
              size="sm" 
              variant={applied.includes(s.job) ? "ghost" : "outline"}
              onClick={() => apply(s.job)}
              disabled={applying === s.job || applied.includes(s.job)}
            >
              {applying === s.job ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : applied.includes(s.job) ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                "Aplicar"
              )}
            </Button>
          </div>
        ))}
      </div>
    </HookDemo>
  );
};

// Demo: useRetryableQuery
const UseRetryableQueryDemo = () => {
  const [state, setState] = useState<"idle" | "loading" | "error" | "retrying" | "success">("idle");
  const [retryCount, setRetryCount] = useState(0);

  const simulateError = () => {
    setState("loading");
    setTimeout(() => {
      setState("error");
    }, 500);
  };

  const retry = () => {
    setRetryCount(prev => prev + 1);
    setState("retrying");
    setTimeout(() => {
      if (retryCount >= 1) {
        setState("success");
      } else {
        setState("error");
      }
    }, 800);
  };

  const reset = () => {
    setState("idle");
    setRetryCount(0);
  };

  return (
    <HookDemo
      title="useRetryableQuery"
      description="Query com retry automático e error handling"
      icon={RefreshCw}
      code={`const {
  data,
  appError,
  isRetryable,
  manualRetry,
  isNetworkError
} = useRetryableQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  showErrorToast: true,
  onMaxRetriesReached: (error) => {
    console.log('Máximo de tentativas');
  }
});`}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={simulateError} disabled={state !== "idle"}>
            <Play className="h-4 w-4 mr-2" />
            Simular Erro
          </Button>
          {state === "error" && (
            <Button size="sm" variant="default" onClick={retry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry ({retryCount + 1}/3)
            </Button>
          )}
          {(state === "success" || state === "error") && (
            <Button size="sm" variant="ghost" onClick={reset}>
              Reset
            </Button>
          )}
        </div>

        {state === "loading" && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Carregando...</AlertTitle>
          </Alert>
        )}

        {state === "retrying" && (
          <Alert className="border-warning">
            <RefreshCw className="h-4 w-4 animate-spin text-warning" />
            <AlertTitle>Tentando novamente...</AlertTitle>
            <AlertDescription>Tentativa {retryCount + 1} de 3</AlertDescription>
          </Alert>
        )}

        {state === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro de conexão</AlertTitle>
            <AlertDescription>
              isRetryable: true | isNetworkError: true
            </AlertDescription>
          </Alert>
        )}

        {state === "success" && (
          <Alert className="border-success bg-success/10">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertTitle>Sucesso!</AlertTitle>
            <AlertDescription>Dados carregados após {retryCount + 1} tentativas</AlertDescription>
          </Alert>
        )}
      </div>
    </HookDemo>
  );
};

// Demo: useOEE
const UseOEEDemo = () => {
  const [oee] = useState({
    overall: 72,
    availability: 85,
    performance: 88,
    quality: 96
  });

  return (
    <HookDemo
      title="useOEE"
      description="Overall Equipment Effectiveness"
      icon={Gauge}
      code={`const { data } = useOEE(jobs, machines, techniques);

// Métricas OEE
<div>OEE: {data.overall.oee}%</div>
<div>Disponibilidade: {data.overall.availability}%</div>
<div>Performance: {data.overall.performance}%</div>
<div>Qualidade: {data.overall.quality}%</div>`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${oee.overall * 3.52} 352`}
                className="text-primary transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{oee.overall}%</span>
              <span className="text-xs text-muted-foreground">OEE</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <div className="font-semibold text-blue-500">{oee.availability}%</div>
            <div className="text-xs text-muted-foreground">Disponibilidade</div>
          </div>
          <div>
            <div className="font-semibold text-green-500">{oee.performance}%</div>
            <div className="text-xs text-muted-foreground">Performance</div>
          </div>
          <div>
            <div className="font-semibold text-purple-500">{oee.quality}%</div>
            <div className="text-xs text-muted-foreground">Qualidade</div>
          </div>
        </div>
      </div>
    </HookDemo>
  );
};

// Demo: useOperators
const UseOperatorsDemo = () => {
  const [operators] = useState([
    { name: "João Silva", active: true, machines: 3 },
    { name: "Maria Santos", active: true, machines: 2 },
    { name: "Pedro Costa", active: false, machines: 0 },
  ]);

  return (
    <HookDemo
      title="useOperators"
      description="Gestão de operadores e atribuições"
      icon={Users}
      code={`const { 
  data, 
  removeOperator, 
  toggleActive 
} = useOperators();

// Alternar status
await toggleActive(operatorId, true);`}
    >
      <div className="space-y-2">
        {operators.map((op, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background border">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${op.active ? "bg-success" : "bg-muted"}`} />
              <span className="text-sm font-medium">{op.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {op.machines} máquinas
              </Badge>
              <Badge variant={op.active ? "default" : "secondary"} className="text-xs">
                {op.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </HookDemo>
  );
};

// Main Section Component
export function HooksExamplesSection() {
  const [activeCategory, setActiveCategory] = useState("data");

  const categories = [
    { id: "data", label: "Dados", icon: Database },
    { id: "efficiency", label: "Eficiência", icon: Activity },
    { id: "operators", label: "Operadores", icon: Users },
    { id: "utilities", label: "Utilitários", icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Exemplos Interativos de Hooks</h3>
          <p className="text-sm text-muted-foreground">
            Demonstrações funcionais dos principais hooks do sistema
          </p>
        </div>
        <a 
          href="/docs/HOOKS_API.md" 
          target="_blank"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <BookOpen className="h-4 w-4" />
          Documentação completa
        </a>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList>
          {categories.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-2">
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="data" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <UseSchedulingDataDemo />
            <UseKPIsDemo />
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <UseLoadBalancingDemo />
            <UseOEEDemo />
          </div>
        </TabsContent>

        <TabsContent value="operators" className="space-y-6 mt-6">
          <UseOperatorsDemo />
        </TabsContent>

        <TabsContent value="utilities" className="space-y-6 mt-6">
          <UseRetryableQueryDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
}
