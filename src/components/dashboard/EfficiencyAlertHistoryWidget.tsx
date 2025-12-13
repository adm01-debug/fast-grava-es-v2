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
  X
} from "lucide-react";
import { useEfficiencyAlertHistory, EfficiencyAlertHistory } from "@/hooks/useEfficiencyAlertHistory";
import { format, formatDistanceToNow, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const severityColors = {
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
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
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Ativos ({filteredActiveAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Resolvidos ({filteredResolvedAlerts.length})
            </TabsTrigger>
          </TabsList>
          
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