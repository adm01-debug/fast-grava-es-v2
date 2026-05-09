import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { cn } from '@/lib/utils';

export function OccupancyChart() {
  const { jobs, machines } = useSchedulingData();

  const occupancyData = useMemo(() => {
    if (!machines || !jobs) return [];

    return machines.map(machine => {
      const machineJobs = jobs.filter(j => j.machine_id === machine.id && ['production', 'paused', 'scheduled', 'queue'].includes(j.status));
      const totalCapacityHours = 8;
      const usedHours = machineJobs.reduce((sum, j) => sum + (j.estimated_duration || 0) / 60, 0);
      const occupancy = Math.min(100, (usedHours / totalCapacityHours) * 100);

      return {
        id: machine.id,
        name: machine.name,
        code: machine.code,
        occupancy: Math.round(occupancy),
        jobs: machineJobs.length,
      };
    }).sort((a, b) => b.occupancy - a.occupancy);
  }, [machines, jobs]);

  const avgOccupancy = occupancyData.length > 0
    ? Math.round(occupancyData.reduce((sum, m) => sum + m.occupancy, 0) / occupancyData.length)
    : 0;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Ocupação das Máquinas
          <Badge variant="outline" className="ml-auto">{avgOccupancy}% média</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {occupancyData.slice(0, 6).map((machine) => (
            <div key={machine.id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium truncate max-w-[60%]">{machine.name}</span>
                <span className="text-muted-foreground">{machine.occupancy}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    machine.occupancy >= 90 ? "bg-destructive" :
                    machine.occupancy >= 70 ? "bg-yellow-500" :
                    machine.occupancy >= 40 ? "bg-primary" :
                    "bg-muted-foreground/30"
                  )}
                  style={{ width: `${machine.occupancy}%` }}
                />
              </div>
            </div>
          ))}
          {occupancyData.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Nenhuma máquina com dados de ocupação
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
