import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  History, 
  Play, 
  Pause, 
  CheckCircle2, 
  Eye,
  RotateCcw,
  User,
  Clock
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScanHistoryItem {
  id: string;
  job_id: string;
  operator_id: string;
  action: string;
  scanned_at: string;
  device_info: string | null;
  jobs: {
    order_number: string;
    product: string;
    client: string;
  } | null;
}

interface ScanHistoryProps {
  jobId?: string;
  limit?: number;
}

const actionConfig: Record<string, { label: string; icon: typeof Play; color: string }> = {
  view: { label: "Visualizou", icon: Eye, color: "text-blue-400 bg-blue-500/20" },
  start: { label: "Iniciou", icon: Play, color: "text-green-400 bg-green-500/20" },
  pause: { label: "Pausou", icon: Pause, color: "text-yellow-400 bg-yellow-500/20" },
  resume: { label: "Retomou", icon: RotateCcw, color: "text-cyan-400 bg-cyan-500/20" },
  finish: { label: "Finalizou", icon: CheckCircle2, color: "text-purple-400 bg-purple-500/20" },
};

export const ScanHistory = ({ jobId, limit = 50 }: ScanHistoryProps) => {
  const { data: scans, isLoading } = useQuery({
    queryKey: ['scan-history', jobId, limit],
    queryFn: async () => {
      let query = supabase
        .from("qr_scan_history")
        .select(`
          *,
          jobs:job_id (order_number, product, client)
        `)
        .order("scanned_at", { ascending: false })
        .limit(limit);

      if (jobId) {
        query = query.eq("job_id", jobId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch operator names separately
      const operatorIds = [...new Set(data.map(s => s.operator_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", operatorIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      
      return data.map(scan => ({
        ...scan,
        operator_name: profileMap.get(scan.operator_id) || "Operador"
      }));
    }
  });

  if (isLoading) {
    return (
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-primary" />
            Histórico de Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          Histórico de Scans
          {scans && scans.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {scans.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {!scans || scans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhum scan registrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scans.map((scan) => {
                const config = actionConfig[scan.action] || actionConfig.view;
                const Icon = config.icon;
                
                return (
                  <div
                    key={scan.id}
                    className="p-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                          {!jobId && scan.jobs && (
                            <span className="text-xs font-medium text-foreground truncate">
                              OS: {scan.jobs.order_number}
                            </span>
                          )}
                        </div>
                        
                        {!jobId && scan.jobs && (
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            {scan.jobs.product} - {scan.jobs.client}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{scan.operator_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span title={format(new Date(scan.scanned_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}>
                              {formatDistanceToNow(new Date(scan.scanned_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
