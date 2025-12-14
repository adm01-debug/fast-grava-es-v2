import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { DbJob } from '@/hooks/useJobs';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 to 20:00

export function TodayTimeline() {
  const today = new Date();
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();

  const { jobs, machines, isLoading, getTechniqueById, getMachineById } = useSchedulingData();

  const todayJobs = useMemo(() => {
    return jobs.filter(job => {
      if (!job.scheduled_date) return false;
      const jobDate = new Date(job.scheduled_date);
      return jobDate.toDateString() === today.toDateString();
    });
  }, [jobs, today]);

  const getJobPosition = (startTime: string | null, endTime: string | null) => {
    if (!startTime || !endTime) {
      return { left: 0, width: 60 };
    }
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startOffset = (startHour - 7) * 80 + (startMin / 60) * 80;
    const endOffset = (endHour - 7) * 80 + (endMin / 60) * 80;
    
    return {
      left: Math.max(0, startOffset),
      width: Math.max(60, endOffset - startOffset),
    };
  };

  const currentTimePosition = useMemo(() => {
    if (currentHour >= 7 && currentHour <= 20) {
      return (currentHour - 7) * 80 + (currentMinute / 60) * 80;
    }
    return null;
  }, [currentHour, currentMinute]);

  // Group jobs by machine
  const jobsByMachine = useMemo(() => {
    const grouped: Record<string, DbJob[]> = {};
    todayJobs.forEach(job => {
      if (!job.machine_id) return;
      if (!grouped[job.machine_id]) {
        grouped[job.machine_id] = [];
      }
      grouped[job.machine_id].push(job);
    });
    return grouped;
  }, [todayJobs]);

  const machineIds = Object.keys(jobsByMachine);

  if (isLoading) {
    return (
      <Card className="col-span-3 glass-card card-interactive animate-fade-in-up">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-3 glass-card card-interactive animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:0.05s]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display gradient-text">Timeline de Hoje</CardTitle>
          <span className="text-sm text-muted-foreground">
            {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-[1200px]">
            {/* Hours header */}
            <div className="flex border-b border-border/30 pb-2 mb-2">
              <div className="w-24 shrink-0" />
              {hours.map(hour => (
                <div 
                  key={hour} 
                  className="w-20 text-center text-xs text-muted-foreground font-medium"
                >
                  {String(hour).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Timeline rows */}
            <div className="space-y-3 relative">
              {/* Current time indicator */}
              {currentTimePosition !== null && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 animate-pulse-soft"
                  style={{ left: `${currentTimePosition + 96}px` }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary animate-glow-pulse" />
                </div>
              )}

              {machineIds.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  Nenhum job agendado para hoje
                </div>
              ) : (
                machineIds.map(machineId => {
                  const machine = getMachineById(machineId);
                  const technique = machine ? getTechniqueById(machine.technique_id) : null;
                  const machineJobs = jobsByMachine[machineId];

                  return (
                    <div key={machineId} className="flex items-center">
                      <div className="w-24 shrink-0 pr-3">
                        <span className="text-xs font-mono font-medium text-muted-foreground">
                          {machine?.code}
                        </span>
                      </div>
                      <div className="flex-1 relative h-12 bg-secondary/30 rounded-lg">
                        {/* Hour grid lines */}
                        {hours.map((hour, i) => (
                          <div
                            key={hour}
                            className="absolute top-0 bottom-0 w-px bg-border/30"
                            style={{ left: `${i * 80}px` }}
                          />
                        ))}

                        {/* Jobs */}
                        {machineJobs.map(job => {
                          const pos = getJobPosition(job.start_time, job.end_time);
                          const statusColors: Record<string, string> = {
                            production: 'gradient-primary',
                            scheduled: 'bg-status-scheduled',
                            finished: 'bg-status-finished',
                            delayed: 'bg-status-delayed',
                            ready: 'bg-status-ready',
                            queue: 'bg-muted-foreground',
                            paused: 'bg-status-paused',
                            cancelled: 'bg-status-cancelled',
                            rework: 'bg-status-rework',
                          };

                          return (
                            <div
                              key={job.id}
                              className={cn(
                                'absolute top-1.5 bottom-1.5 rounded-md cursor-pointer',
                                'flex items-center px-2 text-xs font-medium text-white',
                                'hover:ring-2 hover:ring-primary/50 hover:ring-offset-1 hover:ring-offset-card',
                                'transition-all hover:scale-[1.02] hover:z-10',
                                statusColors[job.status]
                              )}
                              style={{ left: `${pos.left}px`, width: `${pos.width}px` }}
                              title={`${job.order_number} - ${job.client}`}
                            >
                              <span className="truncate">
                                {job.order_number.split('-').pop()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}