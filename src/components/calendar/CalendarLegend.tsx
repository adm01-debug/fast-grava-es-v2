import { cn } from '@/lib/utils';
import { statusColors, statusLabels } from './types';
import { JobStatus } from '@/types/scheduling';
import { Card, CardContent } from '@/components/ui/card';

export function CalendarLegend() {
  return (
    <Card className="bg-card border border-border/40 rounded-xl">
      <CardContent className="py-3 sm:py-4 px-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="text-xs font-medium text-muted-foreground uppercase w-full sm:w-auto">
            Legenda:
          </span>
          {Object.entries(statusLabels).slice(0, 6).map(([status, label]) => (
            <div key={status} className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={cn(
                  'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm border',
                  statusColors[status as JobStatus]
                )}
              />
              <span className="text-[10px] sm:text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm border-2 border-destructive bg-destructive/10 animate-pulse" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Conflito</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
