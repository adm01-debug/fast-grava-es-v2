import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOperatorDashboardData } from '@/hooks/useOperatorDashboardData';
import { Cpu, Play, Pause, Clock, CheckCircle2, Zap, BrainCircuit } from 'lucide-react';
import { useMLPredictions } from '@/hooks/useMLPredictions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { differenceInMinutes } from 'date-fns';

interface MachineStatus {
  machineId: string;
  machineName: string;
  machineCode: string;
  techniqueName: string;
  techniqueColor: string;
  status: 'idle' | 'producing' | 'paused';
  currentJob?: {
    orderNumber: string;
    client: string;
    product: string;
    quantity: number;
    producedQuantity: number;
    estimatedDuration: number;
    actualStartTime: string | null;
    progress: number;
    elapsedMinutes: number;
    remainingMinutes: number;
  };
}

export function LiveMachineStatusPanel() {
  const { jobs, machines, techniques, isLoading, getTechniqueById } = useOperatorDashboardData();
  const { predictions, getRiskLevel } = useMLPredictions();

  const machineStatuses = useMemo<MachineStatus[]>(() => {
    if (!machines || !jobs) return [];

    return machines.map(machine => {
      const technique = getTechniqueById(machine.technique_id);
      const activeJob = jobs.find(j => j.machine_id === machine.id && j.status === 'production');
      const pausedJob = jobs.find(j => j.machine_id === machine.id && j.status === 'paused');
      const currentJob = activeJob || pausedJob;

      let jobInfo: MachineStatus['currentJob'] | undefined;
      if (currentJob) {
        const elapsed = currentJob.actual_start_time 
          ? differenceInMinutes(new Date(), new Date(currentJob.actual_start_time)) 
          : 0;
        const progress = currentJob.estimated_duration > 0 
          ? Math.min(100, (elapsed / currentJob.estimated_duration) * 100)
          : 0;

        jobInfo = {
          orderNumber: currentJob.order_number,
          client: currentJob.client,
          product: currentJob.product,
          quantity: currentJob.quantity,
          producedQuantity: currentJob.produced_quantity || 0,
          estimatedDuration: currentJob.estimated_duration,
          actualStartTime: currentJob.actual_start_time,
          progress,
          elapsedMinutes: elapsed,
          remainingMinutes: Math.max(0, currentJob.estimated_duration - elapsed),
        };
      }

      return {
        machineId: machine.id,
        machineName: machine.name,
        machineCode: machine.code,
        techniqueName: technique?.name || '',
        techniqueColor: technique?.color || '#888',
        status: activeJob ? 'producing' : pausedJob ? 'paused' : 'idle',
        currentJob: jobInfo,
      };
    });
  }, [machines, jobs, getTechniqueById]);

  if (isLoading) return null;

  const producing = machineStatuses.filter(m => m.status === 'producing').length;
  const idle = machineStatuses.filter(m => m.status === 'idle').length;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            Status das Máquinas
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs gap-1">
              <Play className="h-3 w-3 text-green-400" />
              {producing}
            </Badge>
            <Badge variant="outline" className="text-xs gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {idle}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {machineStatuses.map(machine => (
              <div
                key={machine.machineId}
                className={cn(
                  'p-3 rounded-lg border transition-all',
                  machine.status === 'producing' && 'border-green-500/30 bg-green-500/5',
                  machine.status === 'paused' && 'border-orange-500/30 bg-orange-500/5',
                  machine.status === 'idle' && 'border-border bg-muted/30',
                )}
              >
                {/* Machine header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{machine.machineCode}</span>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: machine.techniqueColor }}
                    />
                  </div>
                  {machine.status === 'producing' && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-[10px] px-1.5 py-0">
                      <Play className="h-2.5 w-2.5 mr-0.5" />
                      Produzindo
                    </Badge>
                  )}
                  {machine.status === 'paused' && (
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 text-[10px] px-1.5 py-0">
                      <Pause className="h-2.5 w-2.5 mr-0.5" />
                      Pausado
                    </Badge>
                  )}
                  {machine.status === 'idle' && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                      Livre
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mb-1">{machine.machineName}</p>

                {machine.currentJob && (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-xs font-medium truncate">
                      {machine.currentJob.orderNumber} - {machine.currentJob.client}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {machine.currentJob.product}
                    </p>
                    
                    <Progress 
                      value={machine.currentJob.progress} 
                      className="h-1.5"
                    />
                    
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{machine.currentJob.elapsedMinutes}min</span>
                      <span className={cn(
                        machine.currentJob.remainingMinutes <= 0 && 'text-red-400 font-medium'
                      )}>
                        {machine.currentJob.remainingMinutes > 0 
                          ? `${machine.currentJob.remainingMinutes}min restantes`
                          : 'Excedido!'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
