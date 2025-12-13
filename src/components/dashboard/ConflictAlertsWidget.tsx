import { AlertTriangle, Clock, AlertOctagon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSchedulingConflicts, SchedulingConflict } from '@/hooks/useSchedulingConflicts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ConflictCard = ({ conflict }: { conflict: SchedulingConflict }) => {
  const isError = conflict.severity === 'error';
  
  return (
    <div 
      className={`p-3 rounded-lg border ${
        isError 
          ? 'bg-destructive/10 border-destructive/30' 
          : 'bg-yellow-500/10 border-yellow-500/30'
      }`}
    >
      <div className="flex items-start gap-2 mb-2">
        {isError ? (
          <AlertOctagon className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{conflict.machineCode}</span>
            <Badge variant="outline" className="text-xs">
              {format(conflict.date, "dd/MM", { locale: ptBR })}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {conflict.jobs.length} jobs com horários sobrepostos
          </p>
        </div>
      </div>
      
      <div className="space-y-1 ml-6">
        {conflict.jobs.map(job => (
          <div 
            key={job.id}
            className="flex items-center gap-2 text-xs"
          >
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono">{job.startTime}-{job.endTime}</span>
            <span className="text-muted-foreground truncate">
              {job.orderNumber} • {job.client}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ConflictAlertsWidget = () => {
  const { conflicts, hasConflicts, errorCount, warningCount } = useSchedulingConflicts();

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Conflitos de Agendamento
          </CardTitle>
          {hasConflicts && (
            <div className="flex gap-1">
              {errorCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {errorCount} crítico{errorCount > 1 ? 's' : ''}
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-xs">
                  {warningCount} aviso{warningCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasConflicts ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum conflito detectado</p>
            <p className="text-xs mt-1">Todos os agendamentos estão ok</p>
          </div>
        ) : (
          <ScrollArea className="h-[200px] pr-2">
            <div className="space-y-2">
              {conflicts.map(conflict => (
                <ConflictCard key={conflict.id} conflict={conflict} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
