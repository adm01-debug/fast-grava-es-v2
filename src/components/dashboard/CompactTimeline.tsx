import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { DbJob } from '@/hooks/useJobs';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const hours = ['07:00', '08:00', '09:00', '10:00', '11:00'];

export function CompactTimeline() {
  const today = new Date();
  const { jobs, isLoading, getMachineById } = useSchedulingData();

  const todayJobs = useMemo(() => {
    return jobs.filter(job => {
      if (!job.scheduled_date) return false;
      const jobDate = new Date(job.scheduled_date);
      return jobDate.toDateString() === today.toDateString();
    }).slice(0, 10);
  }, [jobs, today]);

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

  const machineIds = Object.keys(jobsByMachine).slice(0, 8);

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

  if (isLoading) {
    return (
      <Card className="glass-card card-interactive animate-fade-in-up">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card card-interactive animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:0.1s]">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <CardTitle className="text-base sm:text-lg font-display gradient-text">Timeline de Hoje</CardTitle>
          <span className="text-xs text-muted-foreground">
            {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-0 overflow-x-auto">
        <div className="min-w-[400px]">
          {/* Hours header */}
          <div className="flex border-b border-border/30 pb-2 mb-3">
            <div className="w-12 sm:w-14 shrink-0" />
            {hours.map(hour => (
              <div 
                key={hour} 
                className="flex-1 text-center text-[10px] sm:text-xs text-muted-foreground font-medium"
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Timeline rows */}
          <div className="space-y-2">
            {machineIds.length === 0 ? (
              <div className="text-center text-muted-foreground py-4 text-sm">
                Nenhum job agendado para hoje
              </div>
            ) : (
              machineIds.map(machineId => {
                const machine = getMachineById(machineId);
                const machineJobs = jobsByMachine[machineId];
                const firstJob = machineJobs[0];

                return (
                  <div key={machineId} className="flex items-center gap-2">
                    <div className="w-12 sm:w-14 shrink-0">
                      <span className="text-[10px] sm:text-xs font-mono font-medium text-muted-foreground">
                        {machine?.code}
                      </span>
                    </div>
                    <div className="flex-1 flex gap-1">
                      {machineJobs.slice(0, 1).map(job => (
                        <div
                          key={job.id}
                          className={cn(
                            'h-6 sm:h-8 rounded-md flex items-center px-2 sm:px-3 text-[10px] sm:text-xs font-medium text-white',
                            'hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer flex-1',
                            statusColors[job.status]
                          )}
                          title={`${job.order_number} - ${job.client}`}
                        >
                          <span className="truncate">
                            {job.order_number.split('-').pop()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}