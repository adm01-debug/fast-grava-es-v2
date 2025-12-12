import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockJobs, getMachineById } from '@/data/mockData';
import { cn } from '@/lib/utils';

const hours = ['07:00', '08:00', '09:00', '10:00', '11:00'];

export function CompactTimeline() {
  const today = new Date();

  const todayJobs = useMemo(() => {
    return mockJobs.filter(job => {
      const jobDate = new Date(job.scheduledDate);
      return jobDate.toDateString() === today.toDateString();
    }).slice(0, 10);
  }, []);

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

  return (
    <Card className="glass-card card-interactive animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:0.1s]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display gradient-text">Timeline de Hoje</CardTitle>
          <span className="text-xs text-muted-foreground">
            {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-0">
        {/* Hours header */}
        <div className="flex border-b border-border/30 pb-2 mb-3">
          <div className="w-14 shrink-0" />
          {hours.map(hour => (
            <div 
              key={hour} 
              className="flex-1 text-center text-xs text-muted-foreground font-medium"
            >
              {hour}
            </div>
          ))}
        </div>

        {/* Timeline rows */}
        <div className="space-y-2">
          {machineIds.map(machineId => {
            const machine = getMachineById(machineId);
            const jobs = jobsByMachine[machineId];
            const firstJob = jobs[0];

            return (
              <div key={machineId} className="flex items-center gap-2">
                <div className="w-14 shrink-0">
                  <span className="text-xs font-mono font-medium text-muted-foreground">
                    {machine?.code}
                  </span>
                </div>
                <div className="flex-1 flex gap-1">
                  {jobs.slice(0, 1).map(job => (
                    <div
                      key={job.id}
                      className={cn(
                        'h-8 rounded-md flex items-center px-3 text-xs font-medium text-white',
                        'hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer flex-1',
                        statusColors[job.status]
                      )}
                      title={`${job.orderNumber} - ${job.client}`}
                    >
                      <span className="truncate">
                        {job.orderNumber.split('-').pop()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}