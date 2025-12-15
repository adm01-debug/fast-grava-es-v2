import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  History, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  Scale,
  Filter,
  CalendarIcon,
  X,
  TrendingUp,
  BarChart3,
  Timer
} from "lucide-react";
import { useEfficiencyAlertHistory, EfficiencyAlertHistory } from "@/hooks/useEfficiencyAlertHistory";
import { format, formatDistanceToNow, isAfter, isBefore, startOfDay, endOfDay, subDays, eachDayOfInterval, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

const severityColors = {
  error: 'bg-primary/20 text-primary border-primary/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
};

const typeIcons = {
  bottleneck: Zap,
  load_balancing: Scale
};

const typeLabels = {
  bottleneck: 'Gargalo',
  load_balancing: 'Balanceamento'
};

type AlertType = 'all' | 'bottleneck' | 'load_balancing';
type SeverityType = 'all' | 'error' | 'warning' | 'info';

const chartConfig = {
  bottleneck: {
    label: "Gargalo",
    color: "hsl(var(--chart-1))",
  },
  load_balancing: {
    label: "Balanceamento",
    color: "hsl(var(--chart-2))",
  },
  total: {
    label: "Total",
    color: "hsl(var(--chart-3))",
  },
};

const AlertTrendChart = ({ alerts }: { alerts: EfficiencyAlertHistory[] }) => {
  const trendData = useMemo(() => {
    const today = new Date();
    const days = eachDayOfInterval({
      start: subDays(today, 13),
      end: today
    });

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      const dayAlerts = alerts.filter(alert => {
        const alertDate = new Date(alert.detected_at);
        return alertDate >= dayStart && alertDate <= dayEnd;
      });

      const bottleneckCount = dayAlerts.filter(a => a.alert_type === 'bottleneck').length;
      const loadBalancingCount = dayAlerts.filter(a => a.alert_type === 'load_balancing').length;

      return {
        date: format(day, 'dd/MM', { locale: ptBR }),
        bottleneck: bottleneckCount,
        load_balancing: loadBalancingCount,
        total: bottleneckCount + loadBalancingCount
      };
    });
  }, [alerts]);

  const hasData = trendData.some(d => d.total > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
        <TrendingUp className="h-12 w-12 mb-3" />
        <p>Sem dados de tendência</p>
        <p className="text-sm">Alertas aparecerão aqui quando forem detectados</p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillBottleneck" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="fillLoadBalancing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            allowDecimals={false}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
          />
          <Area
            type="monotone"
            dataKey="bottleneck"
            stackId="1"
            stroke="hsl(var(--chart-1))"
            fill="url(#fillBottleneck)"
            name="Gargalo"
          />
          <Area
            type="monotone"
            dataKey="load_balancing"
            stackId="1"
            stroke="hsl(var(--chart-2))"
            fill="url(#fillLoadBalancing)"
            name="Balanceamento"
          />
        </AreaChart>
      </ChartContainer>
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
          <span className="text-xs text-muted-foreground">Gargalo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
          <span className="text-xs text-muted-foreground">Balanceamento</span>
        </div>
      </div>
    </div>
  );
};

interface AlertStats {
  totalAlerts: number;
  resolvedCount: number;
  avgResolutionMinutes: number | null;
  mostFrequentType: 'bottleneck' | 'load_balancing' | null;
  mostFrequentSeverity: 'error' | 'warning' | 'info' | null;
  criticalCount: number;
  resolutionRate: number;
}

const AlertStatsPanel = ({ alerts, resolvedAlerts }: { alerts: EfficiencyAlertHistory[], resolvedAlerts: EfficiencyAlertHistory[] }) => {
  const stats = useMemo<AlertStats>(() => {
    const allAlerts = alerts;
    const resolved = resolvedAlerts;
    
    // Calculate average resolution time
    let totalResolutionMinutes = 0;
    let resolvedWithTime = 0;
    
    resolved.forEach(alert => {
      if (alert.resolved_at && alert.detected_at) {
        const minutes = differenceInMinutes(new Date(alert.resolved_at), new Date(alert.detected_at));
        if (minutes >= 0) {
          totalResolutionMinutes += minutes;
          resolvedWithTime++;
        }
      }
    });
    
    const avgResolutionMinutes = resolvedWithTime > 0 
      ? Math.round(totalResolutionMinutes / resolvedWithTime) 
      : null;
    
    // Count by type
    const bottleneckCount = allAlerts.filter(a => a.alert_type === 'bottleneck').length;
    const loadBalancingCount = allAlerts.filter(a => a.alert_type === 'load_balancing').length;
    const mostFrequentType = bottleneckCount > loadBalancingCount ? 'bottleneck' 
      : loadBalancingCount > bottleneckCount ? 'load_balancing' 
      : allAlerts.length > 0 ? 'bottleneck' : null;
    
    // Count by severity
    const errorCount = allAlerts.filter(a => a.severity === 'error').length;
    const warningCount = allAlerts.filter(a => a.severity === 'warning').length;
    const infoCount = allAlerts.filter(a => a.severity === 'info').length;
    const mostFrequentSeverity = errorCount >= warningCount && errorCount >= infoCount ? 'error'
      : warningCount >= infoCount ? 'warning' 
      : infoCount > 0 ? 'info' : null;
    
    const resolutionRate = allAlerts.length > 0 
      ? Math.round((resolved.length / allAlerts.length) * 100) 
      : 0;
    
    return {
      totalAlerts: allAlerts.length,
      resolvedCount: resolved.length,
      avgResolutionMinutes,
      mostFrequentType,
      mostFrequentSeverity,
      criticalCount: errorCount,
      resolutionRate
    };
  }, [alerts, resolvedAlerts]);

  const formatResolutionTime = (minutes: number | null) => {
    if (minutes === null) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) return `${hours}h ${mins}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  };

  if (stats.totalAlerts === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
        <BarChart3 className="h-12 w-12 mb-3" />
        <p>Sem estatísticas disponíveis</p>
        <p className="text-sm">Dados aparecerão quando houver alertas registrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20">
              <AlertTriangle className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalAlerts}</p>
          <p className="text-xs text-muted-foreground">Total de Alertas</p>
        </div>
        
        <div className="p-4 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-green-500/20">
              <CheckCircle className="h-4 w-4 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.resolutionRate}%</p>
          <p className="text-xs text-muted-foreground">Taxa de Resolução</p>
        </div>
        
        <div className="p-4 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20">
              <Timer className="h-4 w-4 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatResolutionTime(stats.avgResolutionMinutes)}</p>
          <p className="text-xs text-muted-foreground">Tempo Médio Resolução</p>
        </div>
        
        <div className="p-4 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <AlertTriangle className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.criticalCount}</p>
          <p className="text-xs text-muted-foreground">Alertas Críticos</p>
        </div>
      </div>
      
      {/* Frequency Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-pink-400" />
            Tipo Mais Frequente
          </h4>
          {stats.mostFrequentType ? (
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                stats.mostFrequentType === 'bottleneck' 
                  ? 'bg-pink-500/20' 
                  : 'bg-teal-500/20'
              }`}>
                {stats.mostFrequentType === 'bottleneck' 
                  ? <Zap className="h-5 w-5 text-pink-400" />
                  : <Scale className="h-5 w-5 text-teal-400" />
                }
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {stats.mostFrequentType === 'bottleneck' ? 'Gargalo' : 'Balanceamento'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {alerts.filter(a => a.alert_type === stats.mostFrequentType).length} ocorrências
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados</p>
          )}
        </div>
        
        <div className="p-4 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Severidade Mais Comum
          </h4>
          {stats.mostFrequentSeverity ? (
            <div className="flex items-center gap-3">
              <Badge className={`${severityColors[stats.mostFrequentSeverity]} border`}>
                {stats.mostFrequentSeverity === 'error' ? 'Crítico' 
                  : stats.mostFrequentSeverity === 'warning' ? 'Alerta' 
                  : 'Info'}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {alerts.filter(a => a.severity === stats.mostFrequentSeverity).length} ocorrências
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados</p>
          )}
        </div>
      </div>
      
      {/* Resolution Summary */}
      <div className="p-4 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
        <h4 className="text-sm font-medium text-foreground mb-3">Resumo de Resolução</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${stats.resolutionRate}%` }}
              />
            </div>
          </div>
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {stats.resolvedCount} de {stats.totalAlerts} resolvidos
          </div>
        </div>
      </div>
    </div>
  );
};

export const EfficiencyAlertHistoryWidget = () => {
  const { 
    activeAlerts, 
    resolvedAlerts, 
    isLoading, 
    resolveAlert 
  } = useEfficiencyAlertHistory();

  // Filter states
  const [typeFilter, setTypeFilter] = useState<AlertType>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityType>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  const filterAlerts = (alerts: EfficiencyAlertHistory[]) => {
    return alerts.filter(alert => {
      // Type filter
      if (typeFilter !== 'all' && alert.alert_type !== typeFilter) {
        return false;
      }
      
      // Severity filter
      if (severityFilter !== 'all' && alert.severity !== severityFilter) {
        return false;
      }
      
      // Date range filter
      const alertDate = new Date(alert.detected_at);
      if (dateFrom && isBefore(alertDate, startOfDay(dateFrom))) {
        return false;
      }
      if (dateTo && isAfter(alertDate, endOfDay(dateTo))) {
        return false;
      }
      
      return true;
    });
  };

  const filteredActiveAlerts = useMemo(() => filterAlerts(activeAlerts), [activeAlerts, typeFilter, severityFilter, dateFrom, dateTo]);
  const filteredResolvedAlerts = useMemo(() => filterAlerts(resolvedAlerts), [resolvedAlerts, typeFilter, severityFilter, dateFrom, dateTo]);

  const hasActiveFilters = typeFilter !== 'all' || severityFilter !== 'all' || dateFrom || dateTo;

  const clearFilters = () => {
    setTypeFilter('all');
    setSeverityFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const handleResolve = async (alertId: string) => {
    try {
      await resolveAlert.mutateAsync({ alertId });
      toast.success("Alerta marcado como resolvido");
    } catch (error) {
      toast.error("Erro ao resolver alerta");
    }
  };

  const renderAlertCard = (alert: EfficiencyAlertHistory, showResolveButton: boolean = false) => {
    const TypeIcon = typeIcons[alert.alert_type as keyof typeof typeIcons] || AlertTriangle;
    
    return (
      <div 
        key={alert.id}
        className="p-4 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              alert.alert_type === 'bottleneck' 
                ? 'bg-pink-500/20' 
                : 'bg-teal-500/20'
            }`}>
              <TypeIcon className={`h-4 w-4 ${
                alert.alert_type === 'bottleneck' 
                  ? 'text-pink-400' 
                  : 'text-teal-400'
              }`} />
            </div>
            <div>
              <h4 className="font-medium text-foreground">{alert.title}</h4>
              <p className="text-sm text-muted-foreground">{alert.description}</p>
            </div>
          </div>
          <Badge className={`${severityColors[alert.severity as keyof typeof severityColors]} border`}>
            {alert.severity === 'error' ? 'Crítico' : alert.severity === 'warning' ? 'Alerta' : 'Info'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Detectado {formatDistanceToNow(new Date(alert.detected_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
            <Badge variant="outline" className="text-xs">
              {typeLabels[alert.alert_type as keyof typeof typeLabels]}
            </Badge>
          </div>
          
          {showResolveButton && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleResolve(alert.id)}
              disabled={resolveAlert.isPending}
              className="h-7 text-xs"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Resolver
            </Button>
          )}
          
          {alert.resolved_at && (
            <span className="flex items-center gap-1 text-green-400">
              <CheckCircle className="h-3 w-3" />
              Resolvido {formatDistanceToNow(new Date(alert.resolved_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          )}
        </div>
        
        {alert.resolution_notes && (
          <p className="text-xs text-muted-foreground italic border-t border-border/50 pt-2">
            {alert.resolution_notes}
          </p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="glass-card border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <History className="h-5 w-5 text-purple-400" />
            </div>
            Histórico de Alertas de Eficiência
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar filtros
            </Button>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span className="text-sm">Filtros:</span>
          </div>
          
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AlertType)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="bottleneck">Gargalo</SelectItem>
              <SelectItem value="load_balancing">Balanceamento</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as SeverityType)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas severidades</SelectItem>
              <SelectItem value="error">Crítico</SelectItem>
              <SelectItem value="warning">Alerta</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className={cn(
                  "h-8 text-xs justify-start",
                  !dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-3 w-3 mr-1" />
                {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "De"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
                locale={ptBR}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className={cn(
                  "h-8 text-xs justify-start",
                  !dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-3 w-3 mr-1" />
                {dateTo ? format(dateTo, "dd/MM/yyyy") : "Até"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
                locale={ptBR}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="trend" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendência
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Ativos ({filteredActiveAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Resolvidos ({filteredResolvedAlerts.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats">
            <AlertStatsPanel 
              alerts={[...filteredActiveAlerts, ...filteredResolvedAlerts]} 
              resolvedAlerts={filteredResolvedAlerts} 
            />
          </TabsContent>
          
          <TabsContent value="trend">
            <AlertTrendChart alerts={[...filteredActiveAlerts, ...filteredResolvedAlerts]} />
          </TabsContent>
          
          <TabsContent value="active">
            <ScrollArea className="h-[300px] pr-4">
              {filteredActiveAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <CheckCircle className="h-12 w-12 mb-3 text-green-400" />
                  <p>{hasActiveFilters ? 'Nenhum alerta encontrado' : 'Nenhum alerta ativo'}</p>
                  <p className="text-sm">{hasActiveFilters ? 'Tente ajustar os filtros' : 'Sistema operando normalmente'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredActiveAlerts.map(alert => renderAlertCard(alert, true))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="resolved">
            <ScrollArea className="h-[300px] pr-4">
              {filteredResolvedAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <History className="h-12 w-12 mb-3" />
                  <p>{hasActiveFilters ? 'Nenhum alerta encontrado' : 'Nenhum histórico disponível'}</p>
                  {hasActiveFilters && <p className="text-sm">Tente ajustar os filtros</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredResolvedAlerts.map(alert => renderAlertCard(alert, false))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};