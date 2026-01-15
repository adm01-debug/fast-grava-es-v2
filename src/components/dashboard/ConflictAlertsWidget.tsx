import { memo } from 'react';
import { AlertTriangle, Clock, AlertOctagon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSchedulingConflicts, SchedulingConflict } from '@/hooks/useSchedulingConflicts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ConflictCard = memo(function ConflictCard({ conflict }: { conflict: SchedulingConflict }) {
  const isError = conflict.severity === 'error';
  
  return (
    <div 
      className={`p-2 rounded-lg border text-xs ${
        isError 
          ? 'bg-destructive/10 border-destructive/30' 
          : 'bg-yellow-500/10 border-yellow-500/30'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {isError ? (
          <AlertOctagon className="h-3 w-3 text-destructive shrink-0" />
        ) : (
          <AlertTriangle className="h-3 w-3 text-yellow-500 shrink-0" />
        )}
        <span className="font-medium">{conflict.machineCode}</span>
        <Badge variant="outline" className="text-[10px] h-4 px-1">
          {format(conflict.date, "dd/MM", { locale: ptBR })}
        </Badge>
      </div>
      <div className="space-y-0.5 ml-5">
        {conflict.jobs.slice(0, 2).map(job => (
          <div key={job.id} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            <span className="font-mono">{job.startTime}-{job.endTime}</span>
            <span className="truncate">{job.orderNumber}</span>
          </div>
        ))}
        {conflict.jobs.length > 2 && (
          <span className="text-[10px] text-muted-foreground">+{conflict.jobs.length - 2} mais</span>
        )}
      </div>
    </div>
  );
});
ConflictCard.displayName = 'ConflictCard';

function ConflictAlertsWidgetComponent() {
  const { conflicts, hasConflicts, errorCount, warningCount } = useSchedulingConflicts();

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
            Conflitos
          </CardTitle>
          {hasConflicts && (
            <div className="flex gap-1">
              {errorCount > 0 && (
                <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                  {errorCount} crít.
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-[10px] h-5 px-1.5">
                  {warningCount} aviso
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {!hasConflicts ? (
          <div className="text-center py-3 text-muted-foreground">
            <AlertTriangle className="h-6 w-6 mx-auto mb-1 opacity-50" />
            <p className="text-xs">Nenhum conflito</p>
          </div>
        ) : (
          <ScrollArea className="h-[140px] pr-2">
            <div className="space-y-1.5">
              {conflicts.map(conflict => (
                <ConflictCard key={conflict.id} conflict={conflict} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export const ConflictAlertsWidget = memo(ConflictAlertsWidgetComponent);
ConflictAlertsWidget.displayName = 'ConflictAlertsWidget';
