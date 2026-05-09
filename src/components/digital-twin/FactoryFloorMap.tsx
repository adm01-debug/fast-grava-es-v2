import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTPM } from '@/hooks/useTPM';
import { cn } from '@/lib/utils';
import { Activity, Zap, Thermometer, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'lucide-react';

export function FactoryFloorMap() {
  const { machines } = useTPM();
  const [liveData, setLiveData] = useState<Record<string, any>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newData: Record<string, any> = {};
      machines.forEach(m => {
        newData[m.id] = {
          load: Math.floor(Math.random() * 40) + 60, // 60-100%
          temp: Math.floor(Math.random() * 20) + 35, // 35-55C
          efficiency: Math.floor(Math.random() * 15) + 85, // 85-100%
        };
      });
      setLiveData(newData);
    }, 3000);
    return () => clearInterval(interval);
  }, [machines]);

  return (
    <div className="relative w-full aspect-[2/1] bg-secondary/10 rounded-xl border border-border/50 overflow-hidden p-8">
      {/* Factory Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      {/* Walls/Areas */}
      <div className="absolute top-1/4 left-0 w-full h-0.5 bg-primary/20" />
      <div className="absolute top-0 left-1/3 w-0.5 h-full bg-primary/20" />
      
      <div className="absolute top-4 left-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-50">
        Área de Impressão (Serigrafia)
      </div>
      <div className="absolute top-4 left-[35%] text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-50">
        Área de Acabamento
      </div>

      {/* Machines Placement (Simulated Grid) */}
      <div className="relative z-10 grid grid-cols-4 gap-8 h-full">
        {machines.map((machine, idx) => {
          const status = liveData[machine.id] || { load: 0, temp: 0, efficiency: 0 };
          const isWorking = machine.status === 'working';
          
          return (
            <div key={machine.id} className="relative group">
              <div className={cn(
                "w-full h-full rounded-lg border-2 flex flex-col items-center justify-center p-4 transition-all duration-500",
                isWorking ? "bg-primary/5 border-primary/40 shadow-glow-primary" : "bg-muted/20 border-border/30 grayscale opacity-70",
                status.load > 90 && isWorking && "border-amber-500/50 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              )}>
                <Zap className={cn(
                  "h-8 w-8 mb-2 transition-transform",
                  isWorking ? "text-primary animate-pulse" : "text-muted-foreground"
                )} />
                <span className="text-xs font-black uppercase text-center truncate w-full">
                  {machine.name}
                </span>
                <Badge variant={isWorking ? "default" : "secondary"} className="mt-2 text-[8px] h-4">
                  {isWorking ? 'ATIVO' : 'OVAL'}
                </Badge>

                {/* Real-time Overlay */}
                {isWorking && (
                  <div className="mt-3 w-full space-y-1">
                    <div className="flex justify-between text-[8px] font-bold">
                      <span className="text-muted-foreground">CARGA</span>
                      <span className={status.load > 90 ? 'text-amber-500' : 'text-emerald-500'}>{status.load}%</span>
                    </div>
                    <div className="h-1 w-full bg-background rounded-full overflow-hidden">
                      <div className={cn("h-full transition-all duration-1000", status.load > 90 ? 'bg-amber-500' : 'bg-primary')} 
                           style={{ width: `${status.load}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Hover Detailed Stats */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <Card className="glass-card p-2 whitespace-nowrap border-primary/50">
                  <div className="flex gap-4 text-[10px] font-bold">
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-primary" /> {status.efficiency}% OEE
                    </div>
                    <div className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-amber-500" /> {status.temp}°C
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
