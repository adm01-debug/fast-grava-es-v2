import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  VolumeX,
  PieChart as PieChartIcon,
  BarChart3,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { formatDistanceToNow, format, isWithinInterval, startOfDay, endOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

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

// Sound configurations for different actions
const actionSounds: Record<string, { frequencies: number[]; durations: number[]; type: OscillatorType }> = {
  start: { 
    frequencies: [523.25, 659.25, 783.99], // C5, E5, G5 - ascending chord (positive)
    durations: [0.1, 0.1, 0.15],
    type: 'sine'
  },
  pause: { 
    frequencies: [440, 349.23], // A4, F4 - descending (attention)
    durations: [0.15, 0.2],
    type: 'triangle'
  },
  resume: { 
    frequencies: [440, 523.25], // A4, C5 - ascending (resuming)
    durations: [0.1, 0.15],
    type: 'sine'
  },
  finish: { 
    frequencies: [523.25, 659.25, 783.99, 1046.5], // C5, E5, G5, C6 - triumphant
    durations: [0.08, 0.08, 0.08, 0.25],
    type: 'sine'
  },
  view: { 
    frequencies: [880], // A5 - simple notification
    durations: [0.15],
    type: 'sine'
  },
};

// Function to play notification sound using Web Audio API
const playNotificationSound = (action: string) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const soundConfig = actionSounds[action] || actionSounds.view;
    
    let currentTime = audioContext.currentTime;
    
    soundConfig.frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = soundConfig.type;
      oscillator.frequency.setValueAtTime(freq, currentTime);
      
      const duration = soundConfig.durations[index];
      gainNode.gain.setValueAtTime(0.25, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration);
      
      currentTime += duration * 0.9; // Slight overlap for smoother sound
    });
  } catch (error) {
    console.log('Could not play notification sound:', error);
  }
};

export const ScanHistory = ({ jobId, limit = 200 }: ScanHistoryProps) => {
  const [operatorFilter, setOperatorFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"charts" | "list" | "both">("both");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newScanIds, setNewScanIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const listParentRef = useRef<HTMLDivElement>(null);
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

          // Play notification sound based on action type
          if (soundEnabled) {
            playNotificationSound(newScan.action);
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

          // Add to new scan IDs for animation
          setNewScanIds(prev => new Set(prev).add(newScan.id));
          
          // Remove from new scan IDs after animation completes
          setTimeout(() => {
            setNewScanIds(prev => {
              const updated = new Set(prev);
              updated.delete(newScan.id);
              return updated;
            });
          }, 3000);

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

  // Get scan counts by operator (real-time counter)
  const operatorScanCounts = useMemo(() => {
    if (!scans) return [];
    const counts = new Map<string, { name: string; count: number; lastAction: string }>();
    
    scans.forEach(scan => {
      const existing = counts.get(scan.operator_id);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(scan.operator_id, {
          name: scan.operator_name,
          count: 1,
          lastAction: scan.action
        });
      }
    });
    
    return Array.from(counts.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count);
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

  // Action distribution for pie chart
  const actionDistribution = useMemo(() => {
    if (!filteredScans || filteredScans.length === 0) return [];
    
    const counts = new Map<string, number>();
    filteredScans.forEach(scan => {
      counts.set(scan.action, (counts.get(scan.action) || 0) + 1);
    });
    
    const actionColors: Record<string, string> = {
      view: "hsl(217, 91%, 60%)",
      start: "hsl(142, 76%, 36%)",
      pause: "hsl(45, 93%, 47%)",
      resume: "hsl(187, 85%, 53%)",
      finish: "hsl(271, 91%, 65%)",
    };
    
    return Array.from(counts.entries()).map(([action, count]) => ({
      action,
      label: actionConfig[action]?.label || action,
      count,
      fill: actionColors[action] || "hsl(var(--primary))",
      percentage: ((count / filteredScans.length) * 100).toFixed(0)
    }));
  }, [filteredScans]);

  // Daily evolution for bar chart (last 7 days)
  const dailyEvolution = useMemo(() => {
    if (!filteredScans || filteredScans.length === 0) return [];
    
    const stats = new Map<string, { date: string; fullDate: string; scans: number }>();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, "yyyy-MM-dd");
      const displayDate = format(date, "dd/MM", { locale: ptBR });
      stats.set(dateKey, { date: displayDate, fullDate: dateKey, scans: 0 });
    }
    
    // Count scans per day
    filteredScans.forEach(scan => {
      const dateKey = format(new Date(scan.scanned_at), "yyyy-MM-dd");
      const existing = stats.get(dateKey);
      if (existing) {
        existing.scans += 1;
      }
    });
    
    return Array.from(stats.values());
  }, [filteredScans]);

  // Pagination
  const totalPages = Math.ceil(filteredScans.length / itemsPerPage);
  const paginatedScans = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredScans.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredScans, currentPage, itemsPerPage]);

  // Virtualization for the list
  const rowVirtualizer = useVirtualizer({
    count: paginatedScans.length,
    getScrollElement: () => listParentRef.current,
    estimateSize: () => 88, // Estimated row height
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalVirtualSize = rowVirtualizer.getTotalSize();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    if (listParentRef.current) {
      listParentRef.current.scrollTop = 0;
    }
  }, [operatorFilter, actionFilter, dateRange]);

  const hasActiveFilters = operatorFilter !== "all" || actionFilter !== "all" || dateRange?.from;

  const clearFilters = () => {
    setOperatorFilter("all");
    setActionFilter("all");
    setDateRange(undefined);
    setCurrentPage(1);
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
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-border/50 p-0.5">
              <Button
                variant={viewMode === "charts" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("charts")}
                className="h-7 px-2"
                title="Apenas gráficos"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "both" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("both")}
                className="h-7 px-2"
                title="Gráficos e lista"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-7 px-2"
                title="Apenas lista"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
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

        {/* Real-time operator scan counters */}
        {operatorScanCounts.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {operatorScanCounts.slice(0, 5).map((op) => {
              const lastActionConfig = actionConfig[op.lastAction];
              return (
                <div
                  key={op.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                    "bg-muted/50 border border-border/50 transition-all duration-300",
                    newScanIds.size > 0 && "animate-pulse"
                  )}
                >
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate max-w-[100px]">{op.name}</span>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "h-5 min-w-[20px] px-1.5 flex items-center justify-center",
                      lastActionConfig?.color
                    )}
                  >
                    {op.count}
                  </Badge>
                </div>
              );
            })}
            {operatorScanCounts.length > 5 && (
              <div className="flex items-center px-2 py-1 text-xs text-muted-foreground">
                +{operatorScanCounts.length - 5} mais
              </div>
            )}
          </div>
        )}
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

        {/* Charts Section */}
        {(viewMode === "charts" || viewMode === "both") && (
          <>
            {/* Action Distribution Mini Pie Chart */}
            {actionDistribution.length > 0 && (
              <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-2 mb-3">
                  <PieChartIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Distribuição de Ações</span>
                </div>
                <div className="flex items-center gap-4">
                  {/* Mini Pie Chart */}
                  <div className="h-[100px] w-[100px] flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={actionDistribution}
                          dataKey="count"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius={40}
                          innerRadius={20}
                        >
                          {actionDistribution.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => [`${value} scans`, name]}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--popover))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {actionDistribution.map((item) => {
                      const Icon = actionConfig[item.action]?.icon || Eye;
                      return (
                        <div 
                          key={item.action}
                          className="flex items-center gap-2 text-xs"
                        >
                          <div 
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: item.fill }}
                          />
                          <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground truncate">{item.label}</span>
                          <span className="font-medium text-foreground ml-auto">{item.percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Daily Evolution Bar Chart */}
            {dailyEvolution.some(d => d.scans > 0) && (
              <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-foreground">Evolução Diária (últimos 7 dias)</span>
                </div>
                <div className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyEvolution}>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        width={25}
                        allowDecimals={false}
                      />
                      <RechartsTooltip 
                        formatter={(value: number) => [`${value} scans`, 'Scans']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar 
                        dataKey="scans" 
                        fill="hsl(187, 85%, 53%)" 
                        radius={[4, 4, 0, 0]}
                        name="Scans"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}

        {/* Scan List */}
        {(viewMode === "list" || viewMode === "both") && (
        <>
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
              {paginatedScans.map((scan) => {
                const config = actionConfig[scan.action] || actionConfig.view;
                const Icon = config.icon;
                
                const isNew = newScanIds.has(scan.id);
                
                return (
                  <TooltipProvider key={scan.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "p-3 rounded-lg border transition-all duration-500 cursor-pointer",
                            isNew 
                              ? "bg-primary/20 border-primary/50 animate-pulse shadow-lg shadow-primary/20 ring-2 ring-primary/30" 
                              : "bg-muted/30 border-border/30 hover:bg-muted/50"
                          )}
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
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs p-3">
                        <div className="space-y-2">
                          <div className="font-semibold text-foreground">
                            Detalhes do Job
                          </div>
                          {scan.jobs ? (
                            <>
                              <div className="text-xs space-y-1">
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Ordem:</span>
                                  <span className="font-medium">{scan.jobs.order_number}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Produto:</span>
                                  <span className="font-medium truncate max-w-[150px]">{scan.jobs.product}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Cliente:</span>
                                  <span className="font-medium truncate max-w-[150px]">{scan.jobs.client}</span>
                                </div>
                              </div>
                              <div className="border-t border-border/50 pt-2 mt-2 text-xs space-y-1">
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Operador:</span>
                                  <span className="font-medium">{scan.operator_name}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Ação:</span>
                                  <span className="font-medium">{config.label}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Data/Hora:</span>
                                  <span className="font-medium">{format(new Date(scan.scanned_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</span>
                                </div>
                              </div>
                              {scan.notes && (
                                <div className="border-t border-border/50 pt-2 mt-2 text-xs">
                                  <span className="text-muted-foreground">Notas:</span>
                                  <p className="font-medium mt-1">{scan.notes}</p>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-muted-foreground">Job não encontrado</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        {/* Pagination */}
        {filteredScans.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-border/30 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredScans.length)} de {filteredScans.length}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Por página:</span>
                <Select 
                  value={String(itemsPerPage)} 
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
            )}
          </div>
        )}
        </>
        )}
      </CardContent>
    </Card>
  );
};
