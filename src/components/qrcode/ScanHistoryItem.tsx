import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Pause, CheckCircle2, Eye, RotateCcw, User, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const actionConfig: Record<string, { label: string; icon: typeof Play; color: string }> = {
  view: { label: "Visualizou", icon: Eye, color: "text-blue-400 bg-blue-500/20" },
  start: { label: "Iniciou", icon: Play, color: "text-green-400 bg-green-500/20" },
  pause: { label: "Pausou", icon: Pause, color: "text-yellow-400 bg-yellow-500/20" },
  resume: { label: "Retomou", icon: RotateCcw, color: "text-cyan-400 bg-cyan-500/20" },
  finish: { label: "Finalizou", icon: CheckCircle2, color: "text-purple-400 bg-purple-500/20" },
};

interface ScanHistoryItemProps {
  scan: {
    id: string;
    action: string;
    operator_name: string;
    scanned_at: string;
    notes?: string | null;
    jobs?: { order_number: string; product: string; client: string } | null;
  };
  isNew: boolean;
  showJobInfo: boolean;
}

export function ScanHistoryItem({ scan, isNew, showJobInfo }: ScanHistoryItemProps) {
  const config = actionConfig[scan.action] || actionConfig.view;
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "p-3 rounded-lg border transition-all duration-500 cursor-pointer",
            isNew ? "bg-primary/20 border-primary/50 animate-pulse shadow-lg shadow-primary/20 ring-2 ring-primary/30" : "bg-muted/30 border-border/30 hover:bg-muted/50"
          )}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${config.color}`}><Icon className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{config.label}</Badge>
                  {showJobInfo && scan.jobs && <span className="text-xs font-medium text-foreground truncate">OS: {scan.jobs.order_number}</span>}
                </div>
                {showJobInfo && scan.jobs && <p className="text-xs text-muted-foreground truncate mb-1">{scan.jobs.product} - {scan.jobs.client}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><User className="h-3 w-3" /><span>{scan.operator_name}</span></div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span title={format(new Date(scan.scanned_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}>
                      {formatDistanceToNow(new Date(scan.scanned_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs p-3">
          <div className="space-y-2">
            <div className="font-semibold text-foreground">Detalhes do Job</div>
            {scan.jobs ? (
              <div className="text-xs space-y-1">
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Ordem:</span><span className="font-medium">{scan.jobs.order_number}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Produto:</span><span className="font-medium truncate max-w-[150px]">{scan.jobs.product}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Cliente:</span><span className="font-medium truncate max-w-[150px]">{scan.jobs.client}</span></div>
                <div className="border-t border-border/50 pt-2 mt-2 space-y-1">
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Operador:</span><span className="font-medium">{scan.operator_name}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Ação:</span><span className="font-medium">{config.label}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Data/Hora:</span><span className="font-medium">{format(new Date(scan.scanned_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</span></div>
                </div>
                {scan.notes && <div className="border-t border-border/50 pt-2 mt-2"><span className="text-muted-foreground">Notas:</span><p className="font-medium mt-0.5">{scan.notes}</p></div>}
              </div>
            ) : <p className="text-xs text-muted-foreground">Job não encontrado</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
