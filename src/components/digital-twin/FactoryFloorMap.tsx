import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTPM } from '@/hooks/useTPM';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Activity, Zap, Thermometer, Box, Layers, MousePointer2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function FactoryFloorMap() {
  const { machines } = useTPM();
  const [liveData, setLiveData] = useState<Record<string, any>>({});
  const [activeJobs, setActiveJobs] = useState<Record<string, any>>({});
  const [heatmapType, setHeatmapType] = useState<'none' | 'load' | 'temp'>('none');
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveJobs = async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*, machines(id, name)')
        .eq('status', 'in_progress');
      
      const jobsByMachine: Record<string, any> = {};
      data?.forEach((job: any) => {
        if (job.machine_id) {
          jobsByMachine[job.machine_id] = job;
        }
      });
      setActiveJobs(jobsByMachine);
    };

    fetchActiveJobs();
    
    const interval = setInterval(() => {
      const newData: Record<string, any> = {};
      machines.forEach(m => {
        const hasJob = !!activeJobs[m.id];
        newData[m.id] = {
          load: hasJob ? Math.floor(Math.random() * 20) + 80 : 0, // 80-100% if job, else 0
          temp: hasJob ? Math.floor(Math.random() * 20) + 45 : 30, // Higher temp if working
          efficiency: hasJob ? Math.floor(Math.random() * 10) + 90 : 0,
          isWorking: hasJob
        };
      });
      setLiveData(newData);
    }, 3000);
    return () => clearInterval(interval);
  }, [machines, activeJobs]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-black/40 border border-border/40 p-3 rounded-xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">Modos de Visualização</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch id="heatmap-load" checked={heatmapType === 'load'} onCheckedChange={(val) => setHeatmapType(val ? 'load' : 'none')} />
              <Label htmlFor="heatmap-load" className="text-[9px] font-bold uppercase cursor-pointer">Carga Nominal</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="heatmap-temp" checked={heatmapType === 'temp'} onCheckedChange={(val) => setHeatmapType(val ? 'temp' : 'none')} />
              <Label htmlFor="heatmap-temp" className="text-[9px] font-bold uppercase cursor-pointer">Stress Térmico</Label>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            MOTOR DE SINCRO V2.4 ATIVO
          </Badge>
        </div>
      </div>

      <div className="relative w-full aspect-[2/1] bg-secondary/10 rounded-xl border border-border/50 overflow-hidden p-8 group/map">
      {/* Factory Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      {/* Logistics Flow Animation (Evo 11/10) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-primary animate-[shimmer_2s_infinite]" />
        <div className="absolute top-0 left-1/2 w-[2px] h-full bg-primary animate-[shimmer_3s_infinite]" />
        
        {/* Animated Particles */}
        <div className="absolute top-[20%] left-0 w-2 h-2 bg-primary rounded-full animate-[ping_1.5s_infinite] shadow-glow-primary" style={{ left: '25%' }} />
        <div className="absolute top-[40%] left-0 w-2 h-2 bg-emerald-500 rounded-full animate-[ping_2s_infinite] shadow-glow-success" style={{ left: '65%' }} />
        <div className="absolute top-[80%] left-0 w-2 h-2 bg-amber-500 rounded-full animate-[ping_2.5s_infinite] shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ left: '45%' }} />
      </div>

      {/* Walls/Areas */}
      <div className="absolute top-1/4 left-0 w-full h-0.5 bg-primary/20" />
      <div className="absolute top-0 left-1/3 w-0.5 h-full bg-primary/20" />
      
      <div className="absolute top-4 left-4 text-[10px] font-black uppercase text-primary/60 tracking-widest flex items-center gap-2">
        <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
        Área de Impressão (Serigrafia)
      </div>
      <div className="absolute top-4 left-[35%] text-[10px] font-black uppercase text-primary/60 tracking-widest flex items-center gap-2">
        <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
        Área de Acabamento
      </div>

      {/* Machines Placement (Simulated Grid) */}
      <div className="relative z-10 grid grid-cols-4 gap-8 h-full">
        {machines.map((machine) => {
          const status = liveData[machine.id] || { load: 0, temp: 0, efficiency: 0, isWorking: false };
          const isWorking = status.isWorking;
          
          return (
            <div key={machine.id} className="relative group">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "w-full h-full rounded-lg border-2 flex flex-col items-center justify-center p-4 transition-all duration-500 cursor-pointer",
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
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-2 p-1 max-w-[200px]">
                      <p className="font-bold text-xs uppercase border-b pb-1 mb-1">{machine.name}</p>
                      {isWorking ? (
                        <div className="space-y-2">
                           <div className="p-1.5 rounded bg-primary/10 border border-primary/20">
                              <p className="text-[10px] font-black text-primary uppercase">OP em Andamento</p>
                              <p className="text-[10px] font-bold truncate">{activeJobs[machine.id]?.title || 'Sem título'}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[8px] text-muted-foreground">Progresso</span>
                                <span className="text-[8px] font-black">{activeJobs[machine.id]?.progress || 0}%</span>
                              </div>
                           </div>
                           <div className="flex items-center gap-4 text-[10px] font-bold">
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3 text-primary" /> {status.efficiency}% OEE
                            </div>
                            <div className="flex items-center gap-1">
                              <Thermometer className="h-3 w-3 text-amber-500" /> {status.temp}°C
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] italic text-muted-foreground">Equipamento em Standby ou Setup</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
      </div>
    </div>
  );
}
