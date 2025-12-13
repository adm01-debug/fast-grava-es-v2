import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  History, 
  Play, 
  Pause, 
  CheckCircle2, 
  Eye,
  RotateCcw,
  User,
  Clock,
  Filter,
  X,
  CalendarIcon,
  Bell,
  Volume2,
  VolumeX
} from "lucide-react";
import { formatDistanceToNow, format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";

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

// Function to play notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
    oscillator.frequency.setValueAtTime(1046.5, audioContext.currentTime + 0.1); // C6 note
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Could not play notification sound:', error);
  }
};

export const ScanHistory = ({ jobId, limit = 200 }: ScanHistoryProps) => {
  const [operatorFilter, setOperatorFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Real-time subscription for new scans
  useEffect(() => {
    const channel = supabase
      .channel('scan-history-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'qr_scan_history'
        },
        async (payload) => {
          const newScan = payload.new as any;
          
          // Only show notification if not filtering by specific job, or if it's for this job
          if (jobId && newScan.job_id !== jobId) return;

          // Play notification sound
          if (soundEnabled) {
            playNotificationSound();
          }

          // Fetch operator name
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", newScan.operator_id)
            .maybeSingle();

          const operatorName = profile?.full_name || "Operador";
          const actionLabel = actionConfig[newScan.action]?.label || newScan.action;

          // Show toast notification
          toast({
            title: "Novo scan registrado",
            description: `${operatorName} ${actionLabel.toLowerCase()} uma produção`,
            duration: 4000,
          });

          // Invalidate query to refresh data
          queryClient.invalidateQueries({ queryKey: ['scan-history'] });
          queryClient.invalidateQueries({ queryKey: ['scan-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, toast, queryClient]);

  // Get unique operators for filter
  const operators = useMemo(() => {
    if (!scans) return [];
    const uniqueOps = new Map<string, string>();
    scans.forEach(scan => {
      if (!uniqueOps.has(scan.operator_id)) {
        uniqueOps.set(scan.operator_id, scan.operator_name);
      }
    });
    return Array.from(uniqueOps.entries()).map(([id, name]) => ({ id, name }));
  }, [scans]);

  // Filter scans
  const filteredScans = useMemo(() => {
    if (!scans) return [];
    
    return scans.filter(scan => {
      // Operator filter
      if (operatorFilter !== "all" && scan.operator_id !== operatorFilter) {
        return false;
      }
      
      // Action filter
      if (actionFilter !== "all" && scan.action !== actionFilter) {
        return false;
      }
      
      // Date range filter
      if (dateRange?.from) {
        const scanDate = new Date(scan.scanned_at);
        const start = startOfDay(dateRange.from);
        const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        
        if (!isWithinInterval(scanDate, { start, end })) {
          return false;
        }
      }
      
      return true;
    });
  }, [scans, operatorFilter, actionFilter, dateRange]);

  const hasActiveFilters = operatorFilter !== "all" || actionFilter !== "all" || dateRange?.from;

  const clearFilters = () => {
    setOperatorFilter("all");
    setActionFilter("all");
    setDateRange(undefined);
  };

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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-primary" />
            Histórico de Scans
            {filteredScans.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filteredScans.length}
                {hasActiveFilters && scans && ` / ${scans.length}`}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={soundEnabled ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="gap-1"
              title={soundEnabled ? "Som ativado" : "Som desativado"}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-primary" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Filtros</span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-xs gap-1"
                >
                  <X className="h-3 w-3" />
                  Limpar
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Operator Filter */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Operador</label>
                <Select value={operatorFilter} onValueChange={setOperatorFilter}>
                  <SelectTrigger className="h-9">
                    <User className="h-3 w-3 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os operadores</SelectItem>
                    {operators.map(op => (
                      <SelectItem key={op.id} value={op.id}>
                        {op.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Action Filter */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Tipo de Ação</label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="h-9">
                    <Play className="h-3 w-3 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as ações</SelectItem>
                    {Object.entries(actionConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-3 w-3" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Date Range Filter */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Período</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-9",
                        !dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="h-3 w-3 mr-2" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <span className="text-xs">
                            {format(dateRange.from, "dd/MM", { locale: ptBR })} - {format(dateRange.to, "dd/MM", { locale: ptBR })}
                          </span>
                        ) : (
                          <span className="text-xs">{format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })}</span>
                        )
                      ) : (
                        <span className="text-xs">Selecionar datas</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={1}
                      locale={ptBR}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        {/* Scan List */}
        <ScrollArea className="h-[350px] pr-4">
          {filteredScans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {hasActiveFilters ? "Nenhum scan encontrado com os filtros aplicados" : "Nenhum scan registrado"}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredScans.map((scan) => {
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
