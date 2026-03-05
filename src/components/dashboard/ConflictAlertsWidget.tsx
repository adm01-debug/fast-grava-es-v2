import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useSchedulingConflicts } from '@/hooks/useSchedulingConflicts';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ConflictAlertsWidget() {
  const { conflicts } = useSchedulingConflicts();

  const activeConflicts = useMemo(() => {
    return conflicts?.filter(c => c.severity === 'error') ?? [];
  }, [conflicts]);

  const warnings = useMemo(() => {
    return conflicts?.filter(c => c.severity === 'warning') ?? [];
  }, [conflicts]);

  const hasIssues = activeConflicts.length > 0 || warnings.length > 0;

  return (
    <Card className={cn(
      "glass-card",
      activeConflicts.length > 0 && "border-destructive/30"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className={cn(
            "h-4 w-4",
            activeConflicts.length > 0 ? "text-destructive" : "text-muted-foreground"
          )} />
          Conflitos de Agendamento
          {hasIssues && (
            <Badge variant={activeConflicts.length > 0 ? "destructive" : "secondary"} className="ml-auto">
              {activeConflicts.length + warnings.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasIssues ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Nenhum conflito detectado
          </div>
        ) : (
          <div className="space-y-2">
            {activeConflicts.slice(0, 3).map((conflict) => (
              <div key={conflict.id} className="text-xs p-2 rounded bg-destructive/10 border border-destructive/20">
                <span className="font-medium">{conflict.machineName}</span>
                <span className="text-muted-foreground ml-1">
                  — {conflict.jobs.length} jobs sobrepostos em{' '}
                  {format(conflict.date, "dd/MM", { locale: ptBR })}
                </span>
              </div>
            ))}
            {warnings.slice(0, 2).map((w) => (
              <div key={w.id} className="text-xs p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                <span className="font-medium">{w.machineName}</span>
                <span className="text-muted-foreground ml-1">
                  — {w.jobs.length} jobs próximos
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
