import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Brain, Loader2, RefreshCw, Play, CheckCircle } from "lucide-react";
import { HookDemo } from "./HookDemo";

export const UseRetryableQueryDemo = () => {
  const [state, setState] = useState<"idle" | "loading" | "error" | "retrying" | "success">("idle");
  const [retryCount, setRetryCount] = useState(0);

  const simulateError = () => {
    setState("loading");
    setTimeout(() => setState("error"), 500);
  };

  const retry = () => {
    setRetryCount(prev => prev + 1);
    setState("retrying");
    setTimeout(() => {
      if (retryCount >= 1) setState("success");
      else setState("error");
    }, 800);
  };

  const reset = () => { setState("idle"); setRetryCount(0); };

  return (
    <HookDemo
      title="useRetryableQuery"
      description="Query com retry automático e error handling"
      icon={RefreshCw}
      code={`const {
  data, appError, isRetryable, manualRetry, isNetworkError
} = useRetryableQuery({
  queryKey: ['data'], queryFn: fetchData,
  showErrorToast: true,
  onMaxRetriesReached: (error) => console.log('Máximo de tentativas')
});`}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={simulateError} disabled={state !== "idle"}>
            <Play className="h-4 w-4 mr-2" />Simular Erro
          </Button>
          {state === "error" && (
            <Button size="sm" variant="default" onClick={retry}>
              <RefreshCw className="h-4 w-4 mr-2" />Retry ({retryCount + 1}/3)
            </Button>
          )}
          {(state === "success" || state === "error") && (
            <Button size="sm" variant="ghost" onClick={reset}>Reset</Button>
          )}
        </div>
        {state === "loading" && <Alert><Loader2 className="h-4 w-4 animate-spin" /><AlertTitle>Carregando...</AlertTitle></Alert>}
        {state === "retrying" && <Alert className="border-warning"><RefreshCw className="h-4 w-4 animate-spin text-warning" /><AlertTitle>Tentando novamente...</AlertTitle><AlertDescription>Tentativa {retryCount + 1} de 3</AlertDescription></Alert>}
        {state === "error" && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro de conexão</AlertTitle><AlertDescription>isRetryable: true | isNetworkError: true</AlertDescription></Alert>}
        {state === "success" && <Alert className="border-success bg-success/10"><CheckCircle className="h-4 w-4 text-success" /><AlertTitle>Sucesso!</AlertTitle><AlertDescription>Dados carregados após {retryCount + 1} tentativas</AlertDescription></Alert>}
      </div>
    </HookDemo>
  );
};

export const UseBottleneckPredictionDemo = () => {
  const [predictions] = useState([
    { technique: "Serigrafia", capacity: 92, severity: "critical", pending: 8 },
    { technique: "Laser CO2", capacity: 78, severity: "high", pending: 5 },
    { technique: "Tampografia", capacity: 45, severity: "low", pending: 2 },
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-destructive";
      case "high": return "text-warning";
      default: return "text-success";
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive/10 border-destructive/30";
      case "high": return "bg-warning/10 border-warning/30";
      default: return "bg-muted";
    }
  };

  return (
    <HookDemo
      title="useBottleneckPrediction"
      description="Previsão de gargalos por técnica"
      icon={AlertCircle}
      code={`const { predictions, hasBottlenecks, criticalCount } = useBottleneckPrediction();
if (hasBottlenecks) { predictions.filter(p => p.severity === 'critical'); }`}
    >
      <div className="space-y-3">
        {predictions.map((p, i) => (
          <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${getSeverityBg(p.severity)}`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${p.severity === "critical" ? "bg-destructive animate-pulse" : p.severity === "high" ? "bg-warning" : "bg-success"}`} />
              <span className="font-medium">{p.technique}</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">{p.pending} pendentes</Badge>
              <div className="w-20">
                <div className="flex justify-between text-xs mb-1">
                  <span className={getSeverityColor(p.severity)}>{p.capacity}%</span>
                </div>
                <Progress value={p.capacity} className={`h-1.5 ${p.severity === "critical" ? "[&>div]:bg-destructive" : p.severity === "high" ? "[&>div]:bg-warning" : ""}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </HookDemo>
  );
};

export const UseMLPredictionsDemo = () => {
  const [predictions] = useState([
    { machine: "SER-01", risk: 85, type: "failure", confidence: 78, daysUntil: 3 },
    { machine: "LASER-02", risk: 62, type: "maintenance", confidence: 82, daysUntil: 7 },
    { machine: "TAMP-01", risk: 28, type: "degradation", confidence: 91, daysUntil: 14 },
  ]);
  const [generating, setGenerating] = useState(false);

  const getRiskColor = (risk: number) => {
    if (risk >= 75) return "text-destructive";
    if (risk >= 50) return "text-warning";
    return "text-success";
  };

  return (
    <HookDemo
      title="useMLPredictions"
      description="Predições de falha com Machine Learning"
      icon={Brain}
      code={`const { predictions, generatePredictions, getRiskLevel } = useMLPredictions();
await generatePredictions();
const { label, color } = getRiskLevel(85);`}
    >
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 1500); }} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
            Gerar Predições
          </Button>
        </div>
        <div className="space-y-2">
          {predictions.map((p, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background border">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono">{p.machine}</Badge>
                <Badge variant="secondary" className="text-xs capitalize">{p.type}</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-lg font-bold ${getRiskColor(p.risk)}`}>{p.risk}%</div>
                  <div className="text-xs text-muted-foreground">risco</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{p.confidence}%</div>
                  <div className="text-xs text-muted-foreground">confiança</div>
                </div>
                <Badge variant={p.daysUntil <= 3 ? "destructive" : p.daysUntil <= 7 ? "outline" : "secondary"} className="text-xs">{p.daysUntil}d</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </HookDemo>
  );
};
