import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { DbJob, DbMachine, DbTechnique } from '@/hooks/useJobs';
import { JobBlock } from './JobBlock';

interface CalendarTimelineProps {
  machines: DbMachine[];
  jobsByMachine: Record<string, DbJob[]>;
  conflictJobIds: Set<string>;
  startHour: number;
  endHour: number;
  currentTimePosition: string | null;
  getTechniqueById: (id: string) => DbTechnique | undefined;
  onJobClick: (job: DbJob) => void;
}

export function CalendarTimeline({
  machines,
  jobsByMachine,
  conflictJobIds,
  startHour,
  endHour,
  currentTimePosition,
  getTechniqueById,
  onJobClick,
}: CalendarTimelineProps) {
  const hours = useMemo(
    () => Array.from({ length: endHour - startHour }, (_, i) => i + startHour),
    [startHour, endHour]
  );
  const totalMinutes = (endHour - startHour) * 60;

  const getPosition = (job: DbJob) => {
    if (!job.start_time || !job.end_time) return { left: '0%', width: '5%' };
    const [sh, sm] = job.start_time.split(':').map(Number);
    const [eh, em] = job.end_time.split(':').map(Number);
    const startMinutes = (sh - startHour) * 60 + sm;
    const endMinutes = (eh - startHour) * 60 + em;
    const left = (startMinutes / totalMinutes) * 100;
    const width = ((endMinutes - startMinutes) / totalMinutes) * 100;
    return { left: `${left}%`, width: `${Math.max(width, 3)}%` };
  };

  return (
    <ScrollArea className="w-full">
      <div className="min-w-[1200px]">
        <div className="flex border-b border-border/40 bg-muted/5">
          <div className="w-28 shrink-0 p-3 border-r border-border/40">
            <span className="text-xs font-medium text-muted-foreground uppercase">Máquina</span>
          </div>
          <div className="flex-1 flex">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex-1 text-center py-3 border-r border-border/20 last:border-r-0"
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>
        </div>

        {machines.map((machine, index) => {
          const machineJobs = jobsByMachine[machine.id] || [];
          const technique = getTechniqueById(machine.technique_id);

          return (
            <div
              key={machine.id}
              className={cn(
                'flex border-b border-border/20 hover:bg-muted/5 transition-colors',
                index % 2 === 0 && 'bg-muted/3'
              )}
            >
              <div className="w-28 shrink-0 p-3 border-r border-border/40 flex items-center gap-2">
                <div
                  className="w-2 h-8 rounded-full"
                  style={{ backgroundColor: technique?.color || 'hsl(var(--muted))' }}
                />
                <div>
                  <div className="text-sm font-semibold text-foreground">{machine.code}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[80px]">
                    {technique?.short_name}
                  </div>
                </div>
              </div>

              <div className="flex-1 relative h-16">
                <div className="absolute inset-0 flex">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="flex-1 border-r border-border/10 last:border-r-0"
                    />
                  ))}
                </div>

                {currentTimePosition && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-destructive z-20 pointer-events-none"
                    style={{ left: currentTimePosition }}
                  >
                    <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-destructive rounded-full" />
                  </div>
                )}

                {machineJobs.map((job) => (
                  <JobBlock
                    key={job.id}
                    job={job}
                    position={getPosition(job)}
                    hasConflict={conflictJobIds.has(job.id)}
                    onClick={onJobClick}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {machines.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            Nenhuma máquina encontrada para os filtros selecionados.
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
