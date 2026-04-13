import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

const actionColorMap: Record<string, string> = {
  view: "text-blue-400 bg-blue-500/20",
  start: "text-green-400 bg-green-500/20",
  pause: "text-yellow-400 bg-yellow-500/20",
  resume: "text-cyan-400 bg-cyan-500/20",
  finish: "text-purple-400 bg-purple-500/20",
};

interface OperatorCount {
  id: string;
  name: string;
  count: number;
  lastAction: string;
}

interface ScanHistoryOperatorCountersProps {
  operatorScanCounts: OperatorCount[];
  hasNewScans: boolean;
}

export function ScanHistoryOperatorCounters({ operatorScanCounts, hasNewScans }: ScanHistoryOperatorCountersProps) {
  if (operatorScanCounts.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {operatorScanCounts.slice(0, 5).map((op) => (
        <div
          key={op.id}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
            "bg-muted/50 border border-border/50 transition-all duration-300",
            hasNewScans && "animate-pulse"
          )}
        >
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="truncate max-w-[100px]">{op.name}</span>
          <Badge variant="secondary" className={cn("h-5 min-w-[20px] px-1.5 flex items-center justify-center", actionColorMap[op.lastAction])}>
            {op.count}
          </Badge>
        </div>
      ))}
      {operatorScanCounts.length > 5 && (
        <div className="flex items-center px-2 py-1 text-xs text-muted-foreground">
          +{operatorScanCounts.length - 5} mais
        </div>
      )}
    </div>
  );
}
