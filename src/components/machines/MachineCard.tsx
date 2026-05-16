import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Target, CheckCircle2, XCircle, Settings, Activity, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface MachineCardProps {
  machine: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onOpenSettings: (machine: any) => void;
  index: number;
  metrics?: {
    oee: number;
    availability: number;
    performance: number;
    quality: number;
  };
}

export function MachineCard({ machine, isSelected, onSelect, onOpenSettings, index, metrics }: MachineCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "relative flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group",
        isSelected
          ? "bg-primary/10 border-primary ring-1 ring-primary/20 shadow-lg"
          : "bg-card border-border/50 hover:border-primary/50 hover:shadow-md",
        !machine.is_active && !isSelected && "opacity-60 grayscale-[0.5]"
      )}
      onClick={() => onSelect(machine.id)}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors relative",
          isSelected ? "bg-primary/20" : "bg-muted"
        )}>
          <Printer className={cn(
            "h-6 w-6",
            isSelected ? "text-primary" : "text-muted-foreground"
          )} />
          {machine.is_active && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-mono font-bold tracking-tight truncate">{machine.code}</p>
            {isSelected && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate leading-none">
            {machine.name}
          </p>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              <Activity className={cn("h-3 w-3", (metrics?.oee || 0) < 65 ? "text-destructive" : "text-primary")} />
              <span>OEE {metrics?.oee ? `${metrics.oee}%` : '--'}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              <Zap className={cn("h-3 w-3", (metrics?.availability || 0) < 80 ? "text-amber-500" : "text-success")} />
              <span>{metrics?.availability ? `${metrics.availability}%` : '--'} Disponib.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 ml-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSettings(machine);
                }}
              >
                <Settings className="h-4.5 w-4.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Configurações da Máquina</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {machine.is_active ? (
          <CheckCircle2 className="h-5 w-5 text-success/80" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive/80" />
        )}
      </div>
    </motion.div>
  );
}
