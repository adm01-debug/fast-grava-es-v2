import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  History, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  Scale
} from "lucide-react";
import { useEfficiencyAlertHistory } from "@/hooks/useEfficiencyAlertHistory";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

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

export const EfficiencyAlertHistoryWidget = () => {
  const { 
    activeAlerts, 
    resolvedAlerts, 
    isLoading, 
    resolveAlert 
  } = useEfficiencyAlertHistory();

  const handleResolve = async (alertId: string) => {
    try {
      await resolveAlert.mutateAsync({ alertId });
      toast.success("Alerta marcado como resolvido");
    } catch (error) {
      toast.error("Erro ao resolver alerta");
    }
  };

  const renderAlertCard = (alert: any, showResolveButton: boolean = false) => {
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
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <History className="h-5 w-5 text-purple-400" />
          </div>
          Histórico de Alertas de Eficiência
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Ativos ({activeAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Resolvidos ({resolvedAlerts.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            <ScrollArea className="h-[300px] pr-4">
              {activeAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <CheckCircle className="h-12 w-12 mb-3 text-green-400" />
                  <p>Nenhum alerta ativo</p>
                  <p className="text-sm">Sistema operando normalmente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAlerts.map(alert => renderAlertCard(alert, true))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="resolved">
            <ScrollArea className="h-[300px] pr-4">
              {resolvedAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <History className="h-12 w-12 mb-3" />
                  <p>Nenhum histórico disponível</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resolvedAlerts.map(alert => renderAlertCard(alert, false))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
