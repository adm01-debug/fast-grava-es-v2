import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AlertTriangle, Target, Clock, Percent } from 'lucide-react';

interface KPIAlertsTabProps {
  goalAlerts: any[];
  kpis: any;
}

const KPIAlertsTabComponent = ({
  goalAlerts, kpis
}: KPIAlertsTabProps) => {
  return (
    <div className="space-y-6">
      {goalAlerts.length > 0 && (
        <Card className="glass-card border-amber-500/20 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-500">
              <Target className="h-5 w-5" />
              Alertas de Metas de Operadores
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            Alertas de Desvio & Anomalias
          </CardTitle>
          <CardDescription>Detecção automática de gargalos e quedas de performance</CardDescription>
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
                <p className="text-muted-foreground">Nenhum desvio detectado no momento</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const KPIAlertsTab = memo(KPIAlertsTabComponent);
