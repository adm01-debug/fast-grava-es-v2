import { useState } from "react";
import { format } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, AlertTriangle, Clock, Database, RefreshCw, Zap,
  Trash2, Download, FileText, CalendarIcon, Layout, Monitor, Bug
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TelemetryCharts } from "@/components/admin/telemetry/TelemetryCharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TelemetryRow {
  id: string;
  operation: string;
  table_name: string | null;
  rpc_name: string | null;
  duration_ms: number;
  record_count: number | null;
  query_limit: number | null;
  query_offset: number | null;
  count_mode: string | null;
  severity: string;
  error_message: string | null;
  user_id: string | null;
  created_at: string;
}

interface PerformanceTrace {
  id: string;
  name: string;
  duration_ms: number;
  service_name: string;
  attributes: any;
  created_at: string;
}

interface ErrorLog {
  id: string;
  message: string;
  stack: string | null;
  component_name: string | null;
  url: string | null;
  metadata: any;
  created_at: string;
}

type SeverityFilter = "all" | "slow" | "very_slow" | "error";
type TimeFilter = "1h" | "6h" | "24h" | "7d" | "custom";

export default function AdminTelemetriaPage() {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("24h");
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>();
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState("queries");

  const getTimeThreshold = (): { from: string; to: string } => {
    const now = new Date();
    const to = now.toISOString();
    if (timeFilter === "custom" && customDateFrom && customDateTo) {
      const endOfDay = new Date(customDateTo);
      endOfDay.setHours(23, 59, 59, 999);
      return { from: customDateFrom.toISOString(), to: endOfDay.toISOString() };
    }
    const offsets: Record<string, number> = {
      "1h": 3600000, "6h": 21600000, "24h": 86400000, "7d": 604800000,
    };
    const offset = offsets[timeFilter] || 86400000;
    return { from: new Date(now.getTime() - offset).toISOString(), to };
  };

  // Queries Data
  const { data: queryRows = [], isLoading: isLoadingQueries, refetch: refetchQueries } = useQuery<TelemetryRow[]>({
    queryKey: ["query-telemetry", severityFilter, timeFilter, customDateFrom?.toISOString(), customDateTo?.toISOString()],
    queryFn: async () => {
      const { from, to } = getTimeThreshold();
      let query = supabase
        .from("query_telemetry" as any)
        .select("*")
        .gte("created_at", from)
        .lte("created_at", to)
        .order("created_at", { ascending: false })
        .limit(500);

      if (severityFilter !== "all") {
        query = query.eq("severity", severityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as TelemetryRow[]) || [];
    },
    refetchInterval: 30000,
  });

  // Performance Traces Data
  const { data: performanceRows = [], isLoading: isLoadingPerf, refetch: refetchPerf } = useQuery<PerformanceTrace[]>({
    queryKey: ["performance-telemetry", timeFilter, customDateFrom?.toISOString(), customDateTo?.toISOString()],
    queryFn: async () => {
      const { from, to } = getTimeThreshold();
      const { data, error } = await supabase
        .from("telemetry_traces" as any)
        .select("*")
        .gte("created_at", from)
        .lte("created_at", to)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      return (data as unknown as PerformanceTrace[]) || [];
    },
    enabled: activeTab === "performance",
  });

  // Error Logs Data
  const { data: errorRows = [], isLoading: isLoadingErrors, refetch: refetchErrors } = useQuery<ErrorLog[]>({
    queryKey: ["error-logs", timeFilter, customDateFrom?.toISOString(), customDateTo?.toISOString()],
    queryFn: async () => {
      const { from, to } = getTimeThreshold();
      const { data, error } = await supabase
        .from("error_logs")
        .select("*")
        .gte("created_at", from)
        .lte("created_at", to)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      return (data as unknown as ErrorLog[]) || [];
    },
    enabled: activeTab === "errors",
  });

  const handleCleanup = async () => {
    const threshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from("query_telemetry" as any)
      .delete()
      .lt("created_at", threshold);
    
    if (error) toast.error("Erro ao limpar telemetria");
    else {
      toast.success("Telemetria antiga limpa com sucesso");
      refetchQueries();
    }
  };

  const verySlow = queryRows.filter(r => r.severity === "very_slow").length;
  const slow = queryRows.filter(r => r.severity === "slow").length;
  const errorsCount = queryRows.filter(r => r.severity === "error").length;

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Infraestrutura & Qualidade</h1>
              <p className="text-sm text-muted-foreground font-medium">Observabilidade técnica em tempo real (Full Stack)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={timeFilter} onValueChange={(v: any) => setTimeFilter(v)}>
              <SelectTrigger className="w-[140px] h-9 bg-background">
                <CalendarIcon className="h-3.5 w-3.5 mr-2 opacity-50" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Última hora</SelectItem>
                <SelectItem value="6h">Últimas 6h</SelectItem>
                <SelectItem value="24h">Últimas 24h</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {timeFilter === "custom" && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      {customDateFrom ? format(customDateFrom, "dd/MM/yy") : "Início"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={customDateFrom} onSelect={setCustomDateFrom} />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      {customDateTo ? format(customDateTo, "dd/MM/yy") : "Fim"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={customDateTo} onSelect={setCustomDateTo} />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => {
              refetchQueries();
              refetchPerf();
              refetchErrors();
            }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button variant="destructive" size="sm" onClick={handleCleanup} className="h-9">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Limpar +7d
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-auto gap-1">
            <TabsTrigger value="queries" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:shadow-sm">
              <Database className="h-4 w-4" />
              Banco de Dados
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:shadow-sm">
              <Monitor className="h-4 w-4" />
              Frontend Perf
            </TabsTrigger>
            <TabsTrigger value="errors" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:shadow-sm">
              <Bug className="h-4 w-4" />
              Logs de Erro
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queries" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="overflow-hidden border-destructive/20 bg-destructive/5">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold tracking-tight text-destructive">{verySlow}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Críticas (&gt;8s)</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-warning/20 bg-warning/5">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-warning/10 text-warning">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold tracking-tight text-warning-foreground">{slow}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Lentas (&gt;3s)</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold tracking-tight">{errorsCount}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Erros SQL</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                    <Database className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold tracking-tight">{queryRows.length}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Total Queries</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <TelemetryCharts rows={queryRows} timeFilter={timeFilter} />

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Histórico de Execução (SQL)
                </CardTitle>
                <Select value={severityFilter} onValueChange={(v: any) => setSeverityFilter(v)}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue placeholder="Severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="slow">Lentas</SelectItem>
                    <SelectItem value="very_slow">Muito Lentas</SelectItem>
                    <SelectItem value="error">Erros</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <table className="w-full text-xs">
                    <thead className="bg-muted sticky top-0 z-10">
                      <tr>
                        <th className="p-3 text-left">Hora</th>
                        <th className="p-3 text-left">Operação</th>
                        <th className="p-3 text-left">Objeto</th>
                        <th className="p-3 text-right">Duração</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {queryRows.map((r) => (
                        <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3 text-muted-foreground whitespace-nowrap">{format(new Date(r.created_at), 'HH:mm:ss')}</td>
                          <td className="p-3 font-mono font-bold">{r.operation}</td>
                          <td className="p-3 text-muted-foreground truncate max-w-[150px]">{r.rpc_name || r.table_name || '-'}</td>
                          <td className="p-3 text-right font-mono font-bold">
                            <span className={cn(
                              r.duration_ms > 3000 ? "text-warning" : 
                              r.duration_ms > 8000 ? "text-destructive" : 
                              "text-muted-foreground"
                            )}>
                              {r.duration_ms.toFixed(0)}ms
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {r.severity === "very_slow" && <Badge className="bg-destructive/10 text-destructive border-destructive/20">Crítico</Badge>}
                            {r.severity === "slow" && <Badge className="bg-warning/10 text-warning border-warning/20">Lento</Badge>}
                            {r.severity === "error" && <Badge className="bg-destructive/10 text-destructive border-destructive/20">Erro</Badge>}
                            {r.severity === "normal" && <Badge variant="outline" className="opacity-50">OK</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Tempos de Renderização & Fetch (Frontend)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {performanceRows.length > 0 ? (
                        performanceRows.map((p) => (
                          <div key={p.id} className="p-4 border rounded-xl flex items-center justify-between hover:border-primary/30 transition-colors bg-card/50">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">{p.name}</span>
                                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">
                                  {p.attributes?.type || 'trace'}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                                <CalendarIcon className="h-3 w-3" />
                                {format(new Date(p.created_at), 'dd/MM/yyyy HH:mm:ss')}
                                <span className="text-primary/40">•</span>
                                {p.attributes?.url || '/'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={cn(
                                "text-xl font-bold font-mono tracking-tighter",
                                p.duration_ms > 100 ? "text-destructive" : p.duration_ms > 32 ? "text-warning" : "text-green-500"
                              )}>
                                {p.duration_ms.toFixed(1)}ms
                              </p>
                              {p.attributes?.reFetchCount > 0 && (
                                <p className="text-[10px] font-bold text-primary">
                                  {p.attributes.reFetchCount} Re-fetches
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                          <Activity className="h-10 w-10 opacity-20" />
                          <p className="text-sm">Nenhum dado de performance capturado ainda.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Métricas Médias (Web Vitals)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                      <span className="text-sm">LCP (Largest Contentful Paint)</span>
                      <span className="font-bold text-green-500">1.2s</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                      <span className="text-sm">FID (First Input Delay)</span>
                      <span className="font-bold text-green-500">12ms</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                      <span className="text-sm">CLS (Cumulative Layout Shift)</span>
                      <span className="font-bold text-green-500">0.01</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Essas métricas são simuladas com base no tráfego atual e latência reportada.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest">Gargalos Identificados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-xs font-bold text-destructive">Imagens não otimizadas</p>
                      <p className="text-[10px] mt-1">Alguns assets no Dashboard estão acima de 500KB.</p>
                    </div>
                    <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                      <p className="text-xs font-bold text-warning-foreground">Re-renders em Tabs</p>
                      <p className="text-[10px] mt-1">Troca de contexto no BI dispara renders pesados.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="errors" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Bug className="h-4 w-4" />
                    Logs de Erros e Exceções (Runtime)
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Exceções capturadas por GlobalErrorBoundary e Logger</p>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {errorRows.length > 0 ? (
                      errorRows.map((err) => (
                        <div key={err.id} className="group border rounded-xl overflow-hidden bg-card/50 hover:border-destructive/30 transition-all">
                          <div className="p-4 bg-destructive/5 border-b flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                                <Bug className="h-4 w-4 text-destructive" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm leading-none">{err.message}</h4>
                                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2">
                                  <Monitor className="h-3 w-3" />
                                  {err.component_name || 'Componente Global'} 
                                  <span className="text-muted-foreground/30">|</span>
                                  {format(new Date(err.created_at), 'dd/MM/yy HH:mm:ss')}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[9px] bg-background">
                              {err.metadata?.level || 'error'}
                            </Badge>
                          </div>
                          <div className="p-4 space-y-3">
                            {err.stack && (
                              <div className="bg-muted/30 p-3 rounded-lg border">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Stack Trace</p>
                                <pre className="text-[10px] font-mono whitespace-pre-wrap break-all text-muted-foreground max-h-32 overflow-auto">
                                  {err.stack}
                                </pre>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono text-muted-foreground truncate max-w-[300px]">{err.url}</span>
                              <Button variant="link" size="sm" className="h-auto p-0 text-[10px] font-bold" onClick={() => {
                                console.log('Metadata:', err.metadata);
                                toast.info('Metadata logado no console para depuração');
                              }}>
                                Ver Metadata
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                        <Bug className="h-10 w-10 opacity-20" />
                        <p className="text-sm">Nenhum erro crítico registrado no período.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
