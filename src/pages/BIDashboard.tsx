import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useKPIs } from '@/hooks/useKPIs';
import { useOEE } from '@/hooks/useOEE';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { toast } from 'sonner';
import { FavoriteButton, FavoritesDropdown } from '@/components/navigation/FavoritesManager';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import {
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Gauge, 
  Package, 
  AlertTriangle,
  Printer,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus,
  CalendarIcon,
  Filter,
  GitCompare,
  ArrowRight,
  Download,
  FileText,
  ChevronRight,
  X,
  Eye,
  Command
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  LineChart as RechartsLineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type PeriodFilter = '7d' | '30d' | '90d' | 'custom';

interface DateRange {
  from: Date;
  to: Date;
}

// Color palette for charts - using design system tokens
const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  primaryGlow: 'hsl(var(--primary-glow))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  danger: 'hsl(var(--primary))', // Changed from destructive to primary (orange)
  info: 'hsl(var(--chart-1))',
  muted: 'hsl(var(--muted-foreground))',
  xp: 'hsl(var(--xp))',
  coins: 'hsl(var(--coins))',
  streak: 'hsl(var(--streak))',
};

const PIE_COLORS = [
  'hsl(var(--success))', 
  'hsl(var(--primary))', 
  'hsl(var(--coins))', 
  'hsl(var(--primary-glow))', // Changed from destructive to primary-glow (orange)
  'hsl(var(--xp))', 
  'hsl(var(--streak))'
];

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'border-border/50 hover:border-primary/30',
    success: 'border-success/30 bg-success/5 hover:shadow-glow-success',
    warning: 'border-warning/30 bg-warning/5 hover:shadow-glow-primary',
    danger: 'border-primary/30 bg-primary/5 hover:shadow-glow-primary', // Changed to primary (orange)
  };

  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-primary' : 'text-muted-foreground'; // Changed to primary

  return (
    <Card className={cn(
      variantStyles[variant],
      "card-interactive group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    )}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && trendValue && (
              <div className={cn("flex items-center gap-1 text-sm font-medium", trendColor)}>
                <TrendIcon className="h-4 w-4" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 group-hover:shadow-glow-primary transition-all duration-300">
            <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-card overflow-hidden" style={{ animationDelay: `${i * 100}ms` }}>
            <CardContent className="pt-6">
              <Skeleton className="h-24 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-card" style={{ animationDelay: `${(i + 4) * 100}ms` }}>
            <CardHeader>
              <Skeleton className="h-6 w-48 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function BIDashboard() {
  const navigate = useNavigate();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d');
  const [customRange, setCustomRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Advanced filters
  const [techniqueFilter, setTechniqueFilter] = useState<string>('all');
  const [machineFilter, setMachineFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Drill-down state
  const [drillDownData, setDrillDownData] = useState<{
    type: 'technique' | 'machine' | 'status' | null;
    id: string;
    name: string;
    jobs: any[];
  } | null>(null);
  
  // Comparison mode state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [periodFilter2, setPeriodFilter2] = useState<PeriodFilter>('30d');
  const [customRange2, setCustomRange2] = useState<DateRange>({
    from: subDays(new Date(), 60),
    to: subDays(new Date(), 31)
  });
  const [isCalendarOpen2, setIsCalendarOpen2] = useState(false);

  // Get period days for OEE hook
  const periodDays = useMemo(() => {
    if (periodFilter === 'custom') {
      return differenceInDays(customRange.to, customRange.from) || 30;
    }
    return periodFilter === '7d' ? 7 : periodFilter === '90d' ? 90 : 30;
  }, [periodFilter, customRange]);

  const { data: kpis, isLoading: kpisLoading } = useKPIs();
  const { data: oeeData, isLoading: oeeLoading } = useOEE(periodDays);
  const { jobs, machines, techniques, isLoading: schedulingLoading } = useSchedulingData();

  const isLoading = kpisLoading || oeeLoading || schedulingLoading;

  // Get date range based on filter
  const dateRange = useMemo((): DateRange => {
    const now = new Date();
    if (periodFilter === 'custom') {
      return customRange;
    }
    const days = periodFilter === '7d' ? 7 : periodFilter === '90d' ? 90 : 30;
    return { from: subDays(now, days), to: now };
  }, [periodFilter, customRange]);

  // Get date range for comparison period
  const dateRange2 = useMemo((): DateRange => {
    const now = new Date();
    if (periodFilter2 === 'custom') {
      return customRange2;
    }
    const days = periodFilter2 === '7d' ? 7 : periodFilter2 === '90d' ? 90 : 30;
    // Default to previous equivalent period
    const endDate = subDays(dateRange.from, 1);
    return { from: subDays(endDate, days), to: endDate };
  }, [periodFilter2, customRange2, dateRange.from]);

  // Helper function to calculate metrics for a date range
  const calculatePeriodMetrics = (range: DateRange) => {
    if (!jobs || !machines || !techniques) return null;

    const periodJobs = jobs.filter(j => {
      if (!j.created_at) return false;
      try {
        const created = parseISO(j.created_at);
        return isWithinInterval(created, { start: startOfDay(range.from), end: endOfDay(range.to) });
      } catch {
        return false;
      }
    });

    // Status distribution
    const statusDistribution = [
      { name: 'Finalizados', value: periodJobs.filter(j => j.status === 'finished').length, color: PIE_COLORS[0] },
      { name: 'Em Produção', value: periodJobs.filter(j => j.status === 'production').length, color: PIE_COLORS[1] },
      { name: 'Agendados', value: periodJobs.filter(j => j.status === 'scheduled').length, color: PIE_COLORS[2] },
      { name: 'Na Fila', value: periodJobs.filter(j => j.status === 'queue').length, color: PIE_COLORS[3] },
      { name: 'Atrasados', value: periodJobs.filter(j => j.status === 'delayed').length, color: PIE_COLORS[4] },
    ].filter(s => s.value > 0);

    // Daily production trend
    const trendDays = Math.min(differenceInDays(range.to, range.from), 30);
    const dailyTrend = [];
    for (let i = trendDays - 1; i >= 0; i--) {
      const date = subDays(range.to, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayJobs = periodJobs.filter(j => {
        if (!j.actual_end_time) return false;
        try {
          const endTime = parseISO(j.actual_end_time);
          return isWithinInterval(endTime, { start: dayStart, end: dayEnd });
        } catch {
          return false;
        }
      });

      const produced = dayJobs.reduce((sum, j) => sum + (j.produced_quantity ?? j.quantity ?? 0), 0);
      const lost = dayJobs.reduce((sum, j) => sum + (j.lost_pieces ?? 0), 0);

      dailyTrend.push({
        date: format(date, 'dd/MM', { locale: ptBR }),
        fullDate: format(date, 'dd MMM', { locale: ptBR }),
        jobs: dayJobs.length,
        produced,
        lost,
        efficiency: produced > 0 ? ((produced - lost) / produced * 100) : 0,
      });
    }

    // Technique performance
    const techniquePerformance = techniques.map(tech => {
      const techJobs = periodJobs.filter(j => j.technique_id === tech.id && j.status === 'finished');
      const totalProduced = techJobs.reduce((sum, j) => sum + (j.produced_quantity ?? j.quantity ?? 0), 0);
      const totalLost = techJobs.reduce((sum, j) => sum + (j.lost_pieces ?? 0), 0);
      const techMachines = machines.filter(m => m.technique_id === tech.id);
      
      return {
        id: tech.id,
        name: tech.short_name || tech.name,
        jobs: techJobs.length,
        produced: totalProduced,
        lost: totalLost,
        machines: techMachines.length,
        quality: totalProduced > 0 ? ((totalProduced - totalLost) / totalProduced * 100) : 100,
        color: tech.color,
      };
    }).filter(t => t.jobs > 0).sort((a, b) => b.produced - a.produced);

    // Machine utilization
    const machineUtilization = machines.map(machine => {
      const machineJobs = periodJobs.filter(j => j.machine_id === machine.id);
      const completedJobs = machineJobs.filter(j => j.status === 'finished');
      const technique = techniques.find(t => t.id === machine.technique_id);
      
      return {
        id: machine.id,
        name: machine.code || machine.name,
        technique: technique?.short_name || technique?.name || '',
        totalJobs: machineJobs.length,
        completedJobs: completedJobs.length,
        utilization: machineJobs.length > 0 ? (completedJobs.length / machineJobs.length * 100) : 0,
      };
    }).filter(m => m.totalJobs > 0).sort((a, b) => b.utilization - a.utilization);

    // Period-specific KPIs
    const periodCompletedJobs = periodJobs.filter(j => j.status === 'finished').length;
    const periodCompletedPieces = periodJobs
      .filter(j => j.status === 'finished')
      .reduce((sum, j) => sum + (j.produced_quantity ?? j.quantity ?? 0), 0);
    const periodLostPieces = periodJobs.reduce((sum, j) => sum + (j.lost_pieces ?? 0), 0);
    const periodLossRate = (periodCompletedPieces + periodLostPieces) > 0 
      ? (periodLostPieces / (periodCompletedPieces + periodLostPieces)) * 100 
      : 0;

    return {
      statusDistribution,
      dailyTrend,
      techniquePerformance,
      machineUtilization: machineUtilization.slice(0, 10),
      periodJobs: periodJobs.length,
      periodCompletedJobs,
      periodCompletedPieces,
      periodLostPieces,
      periodLossRate,
      activeMachines: machines.filter(m => m.is_active).length,
      activeTechniques: techniques.length,
    };
  };

  // Filter jobs by selected period
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter(j => {
      if (!j.created_at) return false;
      try {
        const created = parseISO(j.created_at);
        return isWithinInterval(created, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) });
      } catch {
        return false;
      }
    });
  }, [jobs, dateRange]);

  // Calculate metrics for period 1
  const biMetrics = useMemo(() => {
    if (!jobs || !machines || !techniques || !kpis || !oeeData) return null;

    const metrics = calculatePeriodMetrics(dateRange);
    if (!metrics) return null;

    const periodStart = dateRange.from;
    const halfPeriod = subDays(periodStart, differenceInDays(dateRange.to, dateRange.from));

    // Jobs in previous period (for trend calculation)
    const prevPeriodJobs = jobs.filter(j => {
      if (!j.created_at) return false;
      try {
        const created = parseISO(j.created_at);
        return isWithinInterval(created, { start: startOfDay(halfPeriod), end: endOfDay(subDays(periodStart, 1)) });
      } catch {
        return false;
      }
    });

    const productionTrend = metrics.periodJobs > prevPeriodJobs.length ? 'up' : 
                            metrics.periodJobs < prevPeriodJobs.length ? 'down' : 'neutral';
    
    const trendPercentage = prevPeriodJobs.length > 0 
      ? Math.abs(((metrics.periodJobs - prevPeriodJobs.length) / prevPeriodJobs.length) * 100).toFixed(0)
      : '0';

    return {
      ...metrics,
      productionTrend,
      trendPercentage,
    };
  }, [jobs, machines, techniques, kpis, oeeData, dateRange]);

  // Calculate metrics for period 2 (comparison)
  const biMetrics2 = useMemo(() => {
    if (!comparisonMode || !jobs || !machines || !techniques) return null;
    return calculatePeriodMetrics(dateRange2);
  }, [comparisonMode, jobs, machines, techniques, dateRange2]);

  if (isLoading || !biMetrics || !kpis || !oeeData) {
    return (
      <MainLayout>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-display">Business Intelligence</h1>
            <p className="text-muted-foreground">Visão executiva consolidada</p>
          </div>
          <LoadingSkeleton />
        </div>
      </MainLayout>
    );
  }

  // Period label helper
  const getPeriodLabel = (filter: PeriodFilter = periodFilter, range: DateRange = customRange) => {
    if (filter === 'custom') {
      return `${format(range.from, 'dd/MM/yyyy')} - ${format(range.to, 'dd/MM/yyyy')}`;
    }
    return filter === '7d' ? 'Últimos 7 dias' : filter === '90d' ? 'Últimos 90 dias' : 'Últimos 30 dias';
  };

  // Calculate comparison percentages
  const getComparisonDelta = (current: number, previous: number) => {
    if (previous === 0) return { delta: 0, trend: 'neutral' as const };
    const delta = ((current - previous) / previous) * 100;
    return {
      delta: Math.abs(delta),
      trend: delta > 0 ? 'up' as const : delta < 0 ? 'down' as const : 'neutral' as const,
    };
  };

  // Comparison KPI Card component
  const ComparisonKPICard = ({ 
    title, 
    value1, 
    value2, 
    icon: Icon, 
    format: formatFn = (v: number) => v.toLocaleString(),
    higherIsBetter = true 
  }: { 
    title: string; 
    value1: number; 
    value2: number; 
    icon: React.ElementType;
    format?: (v: number) => string;
    higherIsBetter?: boolean;
  }) => {
    const { delta, trend } = getComparisonDelta(value1, value2);
    const isPositive = higherIsBetter ? trend === 'up' : trend === 'down';
    
    return (
      <Card className="card-interactive overflow-hidden group hover:shadow-glow-primary transition-all duration-300">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 group-hover:shadow-glow-primary transition-all duration-300">
              <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Período 1</p>
              <p className="text-2xl font-bold gradient-text">{formatFn(value1)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Período 2</p>
              <p className="text-2xl font-bold text-muted-foreground">{formatFn(value2)}</p>
            </div>
          </div>
          <div className={cn(
            "mt-4 flex items-center gap-2 text-sm font-medium",
            isPositive ? "text-success" : trend === 'neutral' ? "text-muted-foreground" : "text-primary"
          )}>
            {trend === 'up' ? <ArrowUp className="h-4 w-4" /> : 
             trend === 'down' ? <ArrowDown className="h-4 w-4" /> : 
             <Minus className="h-4 w-4" />}
            <span>{delta.toFixed(1)}% {trend === 'up' ? 'maior' : trend === 'down' ? 'menor' : 'igual'}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-8 animate-fade-in">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="animate-slide-up">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-display flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 shadow-glow-primary">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <span className="gradient-text">Business Intelligence</span>
              </h1>
              <FavoriteButton path="/bi" name="Business Intelligence" />
            </div>
            <p className="text-muted-foreground mt-1">
              Visão executiva consolidada • Atualizado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-4 animate-slide-left">
            {/* Favorites Dropdown */}
            <FavoritesDropdown onNavigate={(path) => navigate(path)} />
            
            {/* Command Palette Hint */}
            <Badge variant="outline" className="hidden md:flex gap-1.5 cursor-pointer hover:bg-muted transition-colors">
              <Command className="h-3 w-3" />
              <span className="text-xs">⌘K</span>
            </Badge>
            
            <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-lg">
              <Switch 
                id="comparison-mode" 
                checked={comparisonMode} 
                onCheckedChange={setComparisonMode}
              />
              <Label htmlFor="comparison-mode" className="text-sm cursor-pointer flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-primary" />
                Comparar Períodos
              </Label>
            </div>
            <Badge variant="outline" className="text-sm border-primary/30 bg-primary/5 animate-pulse-glow">
              <Activity className="h-3 w-3 mr-1 text-primary" />
              Dados em tempo real
            </Badge>
          </div>
        </div>

        {/* Period Filters */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-xp/5 glass-card">
          <CardContent className="pt-4 pb-4">
            <div className="space-y-4">
              {/* Period 1 */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">1</Badge>
                  <Filter className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Período 1:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    variant={periodFilter === '7d' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setPeriodFilter('7d')}
                  >
                    7 dias
                  </Button>
                  <Button 
                    variant={periodFilter === '30d' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setPeriodFilter('30d')}
                  >
                    30 dias
                  </Button>
                  <Button 
                    variant={periodFilter === '90d' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setPeriodFilter('90d')}
                  >
                    90 dias
                  </Button>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant={periodFilter === 'custom' ? 'default' : 'outline'} 
                        size="sm"
                        className="gap-2"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        Personalizado
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <div className="p-4 space-y-4">
                        <p className="text-sm font-medium">Selecione o período 1</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">De:</p>
                            <Calendar
                              mode="single"
                              selected={customRange.from}
                              onSelect={(date) => date && setCustomRange(prev => ({ ...prev, from: date }))}
                              disabled={(date) => date > new Date() || date > customRange.to}
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Até:</p>
                            <Calendar
                              mode="single"
                              selected={customRange.to}
                              onSelect={(date) => date && setCustomRange(prev => ({ ...prev, to: date }))}
                              disabled={(date) => date > new Date() || date < customRange.from}
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </div>
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => {
                            setPeriodFilter('custom');
                            setIsCalendarOpen(false);
                          }}
                        >
                          Aplicar
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {getPeriodLabel()} • {biMetrics.periodJobs} jobs
                </Badge>
              </div>

              {/* Period 2 (only shown in comparison mode) */}
              {comparisonMode && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">2</Badge>
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Período 2:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button 
                      variant={periodFilter2 === '7d' ? 'secondary' : 'outline'} 
                      size="sm"
                      onClick={() => setPeriodFilter2('7d')}
                    >
                      7 dias
                    </Button>
                    <Button 
                      variant={periodFilter2 === '30d' ? 'secondary' : 'outline'} 
                      size="sm"
                      onClick={() => setPeriodFilter2('30d')}
                    >
                      30 dias
                    </Button>
                    <Button 
                      variant={periodFilter2 === '90d' ? 'secondary' : 'outline'} 
                      size="sm"
                      onClick={() => setPeriodFilter2('90d')}
                    >
                      90 dias
                    </Button>
                    <Popover open={isCalendarOpen2} onOpenChange={setIsCalendarOpen2}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant={periodFilter2 === 'custom' ? 'secondary' : 'outline'} 
                          size="sm"
                          className="gap-2"
                        >
                          <CalendarIcon className="h-4 w-4" />
                          Personalizado
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <div className="p-4 space-y-4">
                          <p className="text-sm font-medium">Selecione o período 2</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">De:</p>
                              <Calendar
                                mode="single"
                                selected={customRange2.from}
                                onSelect={(date) => date && setCustomRange2(prev => ({ ...prev, from: date }))}
                                disabled={(date) => date > new Date() || date > customRange2.to}
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">Até:</p>
                              <Calendar
                                mode="single"
                                selected={customRange2.to}
                                onSelect={(date) => date && setCustomRange2(prev => ({ ...prev, to: date }))}
                                disabled={(date) => date > new Date() || date < customRange2.from}
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </div>
                          </div>
                          <Button 
                            className="w-full" 
                            onClick={() => {
                              setPeriodFilter2('custom');
                              setIsCalendarOpen2(false);
                            }}
                          >
                            Aplicar
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    {getPeriodLabel(periodFilter2, customRange2)} • {biMetrics2?.periodJobs ?? 0} jobs
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comparison View */}
        {comparisonMode && biMetrics2 ? (
          <>
            {/* Comparison Header */}
            <div className="flex items-center justify-center gap-4 py-6 animate-bounce-in">
              <Badge variant="default" className="text-lg py-3 px-6 shadow-glow-primary animate-pulse-glow">
                {getPeriodLabel()}
              </Badge>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-6 w-6 text-primary animate-slide-right" />
                <span className="text-sm font-medium text-muted-foreground">vs</span>
                <ArrowRight className="h-6 w-6 text-primary rotate-180 animate-slide-left" />
              </div>
              <Badge variant="secondary" className="text-lg py-3 px-6">
                {getPeriodLabel(periodFilter2, customRange2)}
              </Badge>
            </div>

            {/* Comparison KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ComparisonKPICard
                title="Jobs Concluídos"
                value1={biMetrics.periodCompletedJobs}
                value2={biMetrics2.periodCompletedJobs}
                icon={CheckCircle}
                higherIsBetter={true}
              />
              <ComparisonKPICard
                title="Peças Produzidas"
                value1={biMetrics.periodCompletedPieces}
                value2={biMetrics2.periodCompletedPieces}
                icon={Package}
                higherIsBetter={true}
              />
              <ComparisonKPICard
                title="Peças Perdidas"
                value1={biMetrics.periodLostPieces}
                value2={biMetrics2.periodLostPieces}
                icon={AlertTriangle}
                higherIsBetter={false}
              />
              <ComparisonKPICard
                title="Taxa de Perda"
                value1={biMetrics.periodLossRate}
                value2={biMetrics2.periodLossRate}
                icon={Target}
                format={(v) => `${v.toFixed(2)}%`}
                higherIsBetter={false}
              />
            </div>

            {/* Comparison Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Jobs by Status Comparison */}
              <Card className="card-elevated hover:shadow-glow-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Distribuição por Status
                  </CardTitle>
                  <CardDescription>Comparativo entre períodos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-center text-muted-foreground mb-2">Período 1</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsPieChart>
                          <Pie
                            data={biMetrics.statusDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {biMetrics.statusDistribution.map((entry, index) => (
                              <Cell key={`cell-1-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <p className="text-sm text-center text-muted-foreground mb-2">Período 2</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsPieChart>
                          <Pie
                            data={biMetrics2.statusDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {biMetrics2.statusDistribution.map((entry, index) => (
                              <Cell key={`cell-2-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {biMetrics.statusDistribution.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Technique Performance Comparison */}
              <Card className="card-elevated hover:shadow-glow-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Performance por Técnica
                  </CardTitle>
                  <CardDescription>Produção comparativa</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart 
                      data={biMetrics.techniquePerformance.slice(0, 6).map(t1 => {
                        const t2 = biMetrics2?.techniquePerformance.find(t => t.id === t1.id);
                        return {
                          name: t1.name,
                          'Período 1': t1.produced,
                          'Período 2': t2?.produced ?? 0,
                        };
                      })}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={80} 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="Período 1" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                      <Bar dataKey="Período 2" fill={CHART_COLORS.muted} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Machine Utilization Comparison Table */}
            <Card className="card-elevated overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5 text-primary" />
                  Comparativo de Utilização por Máquina
                </CardTitle>
                <CardDescription>Top 10 máquinas em ambos os períodos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Máquina</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Técnica</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-primary">P1 Jobs</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-primary">P1 Util.</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">P2 Jobs</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">P2 Util.</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Variação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {biMetrics.machineUtilization.map((m1) => {
                        const m2 = biMetrics2?.machineUtilization.find(m => m.id === m1.id);
                        const { delta, trend } = getComparisonDelta(m1.utilization, m2?.utilization ?? 0);
                        
                        return (
                          <tr 
                            key={m1.id} 
                            className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium">{m1.name}</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="text-xs">{m1.technique}</Badge>
                            </td>
                            <td className="py-3 px-4 text-center text-primary">{m1.totalJobs}</td>
                            <td className="py-3 px-4 text-center text-primary font-medium">{m1.utilization.toFixed(0)}%</td>
                            <td className="py-3 px-4 text-center text-muted-foreground">{m2?.totalJobs ?? 0}</td>
                            <td className="py-3 px-4 text-center text-muted-foreground">{(m2?.utilization ?? 0).toFixed(0)}%</td>
                            <td className="py-3 px-4 text-right">
                              <span className={cn(
                                "flex items-center justify-end gap-1 text-sm",
                                trend === 'up' ? "text-green-500" : trend === 'down' ? "text-red-500" : "text-muted-foreground"
                              )}>
                                {trend === 'up' ? <ArrowUp className="h-3 w-3" /> : 
                                 trend === 'down' ? <ArrowDown className="h-3 w-3" /> : 
                                 <Minus className="h-3 w-3" />}
                                {delta.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Normal View (non-comparison) */
          <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="OEE Geral"
            value={`${oeeData.overallOEE.toFixed(1)}%`}
            subtitle="Eficiência Global dos Equipamentos"
            icon={Gauge}
            variant={oeeData.overallOEE >= 85 ? 'success' : oeeData.overallOEE >= 65 ? 'warning' : 'danger'}
          />
          <StatCard
            title="Taxa de Qualidade"
            value={`${oeeData.overallQuality.toFixed(1)}%`}
            subtitle={`${biMetrics.periodLostPieces.toLocaleString()} peças perdidas`}
            icon={Target}
            variant={oeeData.overallQuality >= 95 ? 'success' : oeeData.overallQuality >= 85 ? 'warning' : 'danger'}
          />
          <StatCard
            title="Jobs Concluídos"
            value={biMetrics.periodCompletedJobs}
            subtitle={`de ${biMetrics.periodJobs} no período`}
            icon={CheckCircle}
            trend={biMetrics.productionTrend as 'up' | 'down' | 'neutral'}
            trendValue={`${biMetrics.trendPercentage}% vs período anterior`}
          />
          <StatCard
            title="Peças Produzidas"
            value={biMetrics.periodCompletedPieces.toLocaleString()}
            subtitle={`Taxa de perda: ${biMetrics.periodLossRate.toFixed(2)}%`}
            icon={Package}
            variant={biMetrics.periodLossRate > 5 ? 'warning' : 'success'}
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-interactive bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 group hover:shadow-glow-primary">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all">
                  <Printer className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">{biMetrics.activeMachines}</p>
                  <p className="text-xs text-muted-foreground">Máquinas Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-interactive bg-gradient-to-br from-xp/10 via-xp/5 to-transparent border-xp/20 group hover:shadow-[0_0_20px_hsl(var(--xp)/0.3)]">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-xp/10 group-hover:bg-xp/20 transition-all">
                  <Activity className="h-5 w-5 text-xp group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">{biMetrics.activeTechniques}</p>
                  <p className="text-xs text-muted-foreground">Técnicas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-interactive bg-gradient-to-br from-success/10 via-success/5 to-transparent border-success/20 group hover:shadow-glow-success">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10 group-hover:bg-success/20 transition-all">
                  <TrendingUp className="h-5 w-5 text-success group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">{kpis.inProgressJobs}</p>
                  <p className="text-xs text-muted-foreground">Em Produção</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-interactive bg-gradient-to-br from-warning/10 via-warning/5 to-transparent border-warning/20 group hover:shadow-[0_0_20px_hsl(var(--warning)/0.3)]">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10 group-hover:bg-warning/20 transition-all">
                  <AlertTriangle className="h-5 w-5 text-warning group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">{kpis.delayedJobs}</p>
                  <p className="text-xs text-muted-foreground">Atrasados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Production Trend */}
          <Card className="card-elevated hover:shadow-glow-primary transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all">
                  <LineChart className="h-5 w-5 text-primary" />
                </div>
                Tendência de Produção
              </CardTitle>
              <CardDescription>{getPeriodLabel()}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={biMetrics.dailyTrend}>
                  <defs>
                    <linearGradient id="colorProduced" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.2)'
                    }}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="produced" 
                    stroke={CHART_COLORS.success} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorProduced)"
                    name="Produzidas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="jobs" 
                    stroke={CHART_COLORS.primary} 
                    strokeWidth={3}
                    dot={{ r: 4, fill: CHART_COLORS.primary, strokeWidth: 2 }}
                    name="Jobs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="card-elevated hover:shadow-glow-primary transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Distribuição por Status
              </CardTitle>
              <CardDescription>Visão geral dos jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RechartsPieChart>
                  <Pie
                    data={biMetrics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {biMetrics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Technique Performance */}
          <Card className="card-elevated hover:shadow-glow-primary transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                Performance por Técnica
              </CardTitle>
              <CardDescription>Peças produzidas por técnica</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={biMetrics.techniquePerformance.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={80} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.2)'
                    }}
                    formatter={(value: number, name: string) => [value.toLocaleString(), name === 'produced' ? 'Produzidas' : 'Perdidas']}
                  />
                  <Bar dataKey="produced" fill={CHART_COLORS.success} name="Produzidas" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="lost" fill={CHART_COLORS.danger} name="Perdidas" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* OEE Trend */}
          <Card className="card-elevated hover:shadow-glow-primary transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                Evolução OEE
              </CardTitle>
              <CardDescription>Últimos 14 dias • Meta: 85%</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RechartsLineChart data={oeeData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(parseISO(value), 'dd/MM')} 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(label) => format(parseISO(label as string), 'dd/MM/yyyy')}
                    formatter={(value: number) => [`${value.toFixed(1)}%`]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="oee" 
                    stroke={CHART_COLORS.primary} 
                    strokeWidth={3}
                    dot={{ r: 4, fill: CHART_COLORS.primary }}
                    name="OEE"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="quality" 
                    stroke={CHART_COLORS.success} 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Qualidade"
                  />
                  {/* Benchmark line */}
                  <Line
                    type="monotone"
                    dataKey={() => 85}
                    stroke={CHART_COLORS.warning}
                    strokeWidth={1}
                    strokeDasharray="10 5"
                    dot={false}
                    name="Meta"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Machine Utilization Table */}
        <Card className="card-elevated overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Printer className="h-5 w-5 text-primary" />
              </div>
              Top 10 Máquinas por Utilização
            </CardTitle>
            <CardDescription>Taxa de conclusão de jobs por máquina</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/20 bg-primary/5">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Máquina</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Técnica</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">Jobs</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">Concluídos</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Utilização</th>
                  </tr>
                </thead>
                <tbody>
                  {biMetrics.machineUtilization.map((machine, index) => (
                    <tr 
                      key={machine.id} 
                      className="border-b border-border/50 hover:bg-primary/5 transition-all duration-200 group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-5 font-medium">{index + 1}.</span>
                          <span className="font-medium group-hover:text-primary transition-colors">{machine.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs border-primary/30">
                          {machine.technique}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center font-medium">{machine.totalJobs}</td>
                      <td className="py-3 px-4 text-center font-medium">{machine.completedJobs}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 h-2.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${machine.utilization}%`,
                                background: machine.utilization >= 80 
                                  ? 'linear-gradient(90deg, hsl(var(--success)), hsl(var(--success) / 0.8))' 
                                  : machine.utilization >= 50 
                                  ? 'linear-gradient(90deg, hsl(var(--warning)), hsl(var(--warning) / 0.8))'
                                  : 'linear-gradient(90deg, hsl(var(--destructive)), hsl(var(--destructive) / 0.8))'
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold w-12 text-right">
                            {machine.utilization.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* OEE Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-interactive bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 group hover:shadow-glow-primary">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-3 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Disponibilidade</p>
                <p className="text-4xl font-bold font-display gradient-text mt-1">
                  {oeeData.overallAvailability.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Perda: {oeeData.availabilityLosses.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-interactive bg-gradient-to-br from-xp/10 via-xp/5 to-transparent border-xp/20 group hover:shadow-[0_0_30px_hsl(var(--xp)/0.3)]">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="p-3 rounded-xl bg-xp/10 w-fit mx-auto mb-3 group-hover:bg-xp/20 group-hover:scale-110 transition-all duration-300">
                  <TrendingUp className="h-8 w-8 text-xp" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Performance</p>
                <p className="text-4xl font-bold font-display text-xp mt-1">
                  {oeeData.overallPerformance.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Perda: {oeeData.performanceLosses.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-interactive bg-gradient-to-br from-success/10 via-success/5 to-transparent border-success/20 group hover:shadow-glow-success">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="p-3 rounded-xl bg-success/10 w-fit mx-auto mb-3 group-hover:bg-success/20 group-hover:scale-110 transition-all duration-300">
                  <Target className="h-8 w-8 text-success" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Qualidade</p>
                <p className="text-4xl font-bold font-display text-success mt-1">
                  {oeeData.overallQuality.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Perda: {oeeData.qualityLosses.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <Button 
            onClick={() => {
              const exportData = {
                exportedAt: new Date().toISOString(),
                period: getPeriodLabel(),
                metrics: biMetrics,
                oee: oeeData,
              };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `bi-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success('Relatório exportado com sucesso!');
            }}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
