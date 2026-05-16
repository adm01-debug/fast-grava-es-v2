import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AlertTriangle, Target, Clock, Percent, ShieldCheck, User } from 'lucide-react';
import { useAuditTrail } from '@/hooks/useAuditTrail';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface KPIAlertsTabProps {
  goalAlerts: any[];
  kpis: any;
}

const KPIAlertsTabComponent = ({
  goalAlerts, kpis
}: KPIAlertsTabProps) => {
  const { data: auditLogs } = useAuditTrail({ limit: 5, entity_type: 'jobs' });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals Alerts */}
        <div className="space-y-6">
          {goalAlerts.length > 0 && (
            <Card className="glass-card border-amber-500/20 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-amber-500">
                  <Target className="h-5 w-5" />
                  Alertas de Metas
                </CardTitle>
                <CardDescription>Operadores com metas em risco ou atrasadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {goalAlerts.map((alert: any) => (
                  <div key={alert.goalId} className={cn(
                    "p-4 rounded-xl border flex items-center justify-between",
                    alert.riskLevel === 'critical' ? "bg-red-500/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20"
                  )}>
                    <div>
                      <p className="font-bold text-sm">{alert.operatorName}</p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-lg font-bold",
                        alert.riskLevel === 'critical' ? "text-red-500" : "text-amber-500"
                      )}>
                        {alert.progressPercentage.toFixed(0)}%
                      </span>
                      <Progress value={alert.progressPercentage} className="h-1 w-16 mt-1" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Desvios & Anomalias
              </CardTitle>
              <CardDescription>Detecção de gargalos e quedas de performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpis.anomalies.map((anomaly: any) => (
                  <div key={anomaly.id} className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border animate-in fade-in slide-in-from-left-4 duration-300",
                    anomaly.severity === 'high' ? "border-primary/40 bg-primary/10" : "border-amber-500/20 bg-amber-500/5"
                  )}>
                    <div className={cn(
                      "p-2 rounded-lg",
                      anomaly.severity === 'high' ? "bg-primary/20" : "bg-amber-500/20"
                    )}>
                      {anomaly.type === 'loss' ? <Percent className={cn("h-5 w-5", anomaly.severity === 'high' ? "text-primary" : "text-amber-500")} /> :
                       anomaly.type === 'delay' ? <Clock className={cn("h-5 w-5", anomaly.severity === 'high' ? "text-primary" : "text-amber-500")} /> :
                       <AlertTriangle className={cn("h-5 w-5", anomaly.severity === 'high' ? "text-primary" : "text-amber-500")} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">{anomaly.entityName}</p>
                        {anomaly.severity === 'high' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-white font-black">CRÍTICO</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{anomaly.message}</p>
                    </div>
                  </div>
                ))}
                {kpis.anomalies.length === 0 && (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">Nenhum desvio detectado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Trail Panel */}
        <div className="space-y-6">
          <Card className="glass-card border-primary/20 bg-primary/5 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Auditoria de Mudanças
                  </CardTitle>
                  <CardDescription>Rastreabilidade de status e eventos críticos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs?.map((log: any) => (
                  <div key={log.id} className="p-3 rounded-lg bg-background/50 border border-border/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-xs font-medium">{log.actor_name || 'Usuário'}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(log.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] uppercase font-bold py-0 h-4">
                          {log.entity_type}
                        </Badge>
                        <span className="text-xs font-bold">
                          {log.action === 'UPDATE' ? 'Alterou Status' : 
                           log.action === 'INSERT' ? 'Criou Registro' : log.action}
                        </span>
                      </div>
                      {log.details && typeof log.details === 'object' && (
                        <div className="mt-2 text-[11px] text-muted-foreground bg-muted/30 p-2 rounded">
                          {Object.entries(log.details).slice(0, 2).map(([key, val]: [string, any]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key}:</span>
                              <span className="font-medium text-foreground">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {!auditLogs?.length && (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">Nenhuma atividade recente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const KPIAlertsTab = memo(KPIAlertsTabComponent);

export const KPIAlertsTab = memo(KPIAlertsTabComponent);
