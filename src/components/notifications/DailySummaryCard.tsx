import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Bell, BellOff, Calendar, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { useDailySummaryNotifications } from '@/hooks/useDailySummaryNotifications';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export function DailySummaryCard() {
  const {
    lastSummary,
    isLoading,
    manualRefresh,
    requestPermission,
    permission,
  } = useDailySummaryNotifications();

  const handleEnableNotifications = async () => {
    await requestPermission();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resumo Diário
            </CardTitle>
            <CardDescription>
              Manutenções e predições - {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {permission !== 'granted' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnableNotifications}
                className="gap-1"
              >
                <Bell className="h-4 w-4" />
                Ativar alertas
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={manualRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && !lastSummary ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : lastSummary ? (
          <div className="space-y-4">
            {/* Maintenance Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Manutenções</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                  <span className="text-2xl font-bold text-destructive">
                    {lastSummary.maintenance.overdue.count}
                  </span>
                  <span className="text-xs text-muted-foreground">Atrasadas</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-warning/10 border border-warning/20">
                  <span className="text-2xl font-bold text-warning">
                    {lastSummary.maintenance.due_today.count}
                  </span>
                  <span className="text-xs text-muted-foreground">Hoje</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-2xl font-bold text-primary">
                    {lastSummary.maintenance.upcoming_7_days.count}
                  </span>
                  <span className="text-xs text-muted-foreground">7 dias</span>
                </div>
              </div>
            </div>

            {/* Predictions Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Predições ML</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                  <span className="text-2xl font-bold text-destructive">
                    {lastSummary.predictions.critical.count}
                  </span>
                  <span className="text-xs text-muted-foreground">Críticas (≥85%)</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <span className="text-2xl font-bold text-orange-500">
                    {lastSummary.predictions.high_risk.count}
                  </span>
                  <span className="text-xs text-muted-foreground">Alto Risco (≥70%)</span>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between pt-2 border-t">
              {lastSummary.alerts.has_critical ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Atenção necessária
                </Badge>
              ) : lastSummary.alerts.total_attention_items > 0 ? (
                <Badge variant="secondary" className="gap-1 bg-warning/20 text-warning border-warning/30">
                  <TrendingUp className="h-3 w-3" />
                  {lastSummary.alerts.total_attention_items} itens pendentes
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1 bg-green-500/20 text-green-600 border-green-500/30">
                  <CheckCircle className="h-3 w-3" />
                  Tudo em ordem
                </Badge>
              )}
              
              <span className="text-xs text-muted-foreground">
                Atualizado às {format(new Date(lastSummary.generated_at), 'HH:mm')}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            {permission !== 'granted' ? (
              <>
                <BellOff className="h-8 w-8 mb-2" />
                <p className="text-sm">Ative as notificações para receber o resumo diário às 8h</p>
              </>
            ) : (
              <>
                <Calendar className="h-8 w-8 mb-2" />
                <p className="text-sm">Clique em atualizar para ver o resumo</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
