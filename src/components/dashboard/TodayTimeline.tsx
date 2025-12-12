import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { mockJobs, getTechniqueById, getMachineById } from '@/data/mockData';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 to 20:00

export function TodayTimeline() {
  const today = new Date();
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();

  const todayJobs = useMemo(() => {
    return mockJobs.filter(job => {
      const jobDate = new Date(job.scheduledDate);
      return jobDate.toDateString() === today.toDateString();
    });
  }, []);

  const getJobPosition = (startTime: string, endTime: string) => {
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
    const grouped: Record<string, typeof todayJobs> = {};
    todayJobs.forEach(job => {
      if (!grouped[job.machineId]) {
        grouped[job.machineId] = [];
      }
      grouped[job.machineId].push(job);
    });
    return grouped;
  }, [todayJobs]);

  const machineIds = Object.keys(jobsByMachine);

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display">Timeline de Hoje</CardTitle>
          <span className="text-sm text-muted-foreground">
            {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-[1200px]">
            {/* Hours header */}
            <div className="flex border-b border-border pb-2 mb-2">
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
                  className="absolute top-0 bottom-0 w-0.5 bg-destructive z-20"
                  style={{ left: `${currentTimePosition + 96}px` }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-destructive" />
                </div>
              )}

              {machineIds.map(machineId => {
                const machine = getMachineById(machineId);
                const technique = machine ? getTechniqueById(machine.techniqueId) : null;
                const jobs = jobsByMachine[machineId];

                return (
                  <div key={machineId} className="flex items-center">
                    <div className="w-24 shrink-0 pr-3">
                      <span className="text-xs font-mono font-medium text-muted-foreground">
                        {machine?.code}
                      </span>
                    </div>
                    <div className="flex-1 relative h-12 bg-muted/30 rounded-lg">
                      {/* Hour grid lines */}
                      {hours.map((hour, i) => (
                        <div
                          key={hour}
                          className="absolute top-0 bottom-0 w-px bg-border/50"
                          style={{ left: `${i * 80}px` }}
                        />
                      ))}

                      {/* Jobs */}
                      {jobs.map(job => {
                        const pos = getJobPosition(job.startTime, job.endTime);
                        const statusColors: Record<string, string> = {
                          production: 'bg-status-production',
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
                              'hover:ring-2 hover:ring-primary hover:ring-offset-1 transition-all',
                              statusColors[job.status]
                            )}
                            style={{ left: `${pos.left}px`, width: `${pos.width}px` }}
                            title={`${job.orderNumber} - ${job.client}`}
                          >
                            <span className="truncate">
                              {job.orderNumber.split('-').pop()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
