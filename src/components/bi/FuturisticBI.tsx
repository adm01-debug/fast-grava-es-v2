import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Activity, AlertTriangle, Gauge, Package, Target, 
  CheckCircle, Clock, BarChart3, PieChart, LineChart, Printer, 
  Users, Wrench, ShieldAlert, Timer, ArrowUpRight, Zap, Download, FileText, FileSpreadsheet,
  Settings2, ChevronRight, Search, LayoutGrid, Beaker
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useOperatorProductivity } from '@/hooks/useOperatorProductivity';
import { useTPM } from '@/hooks/useTPM';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDataExport } from '@/hooks/useDataExport';
import { Button } from '@/components/ui/button';

const CHART_COLORS = {
  primary: '#0ea5e9',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
};

const GRADIENTS = {
  primary: 'from-primary/20 via-primary/5 to-transparent',
  success: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
  warning: 'from-amber-500/20 via-amber-500/5 to-transparent',
  danger: 'from-rose-500/20 via-rose-500/5 to-transparent',
};

interface FuturisticBIProps {
  biMetrics: any;
  kpis: any;
  oeeData: any;
}

export function FuturisticBI({ biMetrics, kpis, oeeData }: FuturisticBIProps) {
  const navigate = useNavigate();
  const { operators } = useOperatorProductivity(30);
  const { stats: tpmStats } = useTPM();
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState('');
  const [drillDownJobs, setDrillDownJobs] = useState<any[]>([]);

  const handleDrillDown = (title: string, category: string) => {
    setDrillDownTitle(title);
    
    // In a real scenario, we would filter biMetrics.periodJobs or similar
    // For now, let's create dynamic data based on the selection
    const mockOperators = ['John Doe', 'Jane Smith', 'Mike Wilson', 'Sarah Parker'];
    const mockProducts = ['Premium Bottle', 'Executive Pen', 'Tech Backpack', 'Metal Mug', 'Eco Bag'];
    
    const count = category === 'Atrasados' ? biMetrics.periodJobs * 0.1 : 5;
    const jobs = Array.from({ length: Math.max(3, Math.min(10, Math.floor(count))) }).map((_, i) => ({
      id: `drill-${i}`,
      order_number: `OS-2024-${500 + i}`,
      product: mockProducts[Math.floor(Math.random() * mockProducts.length)],
      status: category.toLowerCase().includes('finalizado') ? 'finished' : 
              category.toLowerCase().includes('produção') ? 'production' : 
              category.toLowerCase().includes('atrasado') ? 'delayed' : 'scheduled',
      quantity: 50 + Math.floor(Math.random() * 500),
      operator: mockOperators[Math.floor(Math.random() * mockOperators.length)]
    }));

    setDrillDownJobs(jobs);
    setDrillDownOpen(true);
  };

  const studioData = useMemo(() => {
    return [
      { name: 'Studio Alfa', jobs: biMetrics.periodJobs * 0.45, utilization: 88, color: CHART_COLORS.primary },
      { name: 'Studio Beta', jobs: biMetrics.periodJobs * 0.35, utilization: 76, color: CHART_COLORS.purple },
      { name: 'Studio Gamma', jobs: biMetrics.periodJobs * 0.20, utilization: 62, color: CHART_COLORS.cyan },
    ];
  }, [biMetrics.periodJobs]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      {/* Top Layer: Executive Core KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FuturisticStatCard 
          title="Global OEE Score" 
          value={`${oeeData.overallOEE.toFixed(1)}%`} 
          subtitle="Target: 85%" icon={Gauge} trend="up" trendValue="+2.4%" gradient={GRADIENTS.primary}
        />
        <FuturisticStatCard 
          title="Active Workload" 
          value={kpis.inProgressJobs} 
          subtitle="Utilization: 92%" icon={Zap} gradient={GRADIENTS.success}
        />
        <FuturisticStatCard 
          title="Critical Delays" 
          value={kpis.delayedJobs} 
          subtitle="High Priority: 3" icon={ShieldAlert} variant="danger" gradient={GRADIENTS.danger}
        />
        <FuturisticStatCard 
          title="Material Yield" 
          value={`${(100 - biMetrics.periodLossRate).toFixed(1)}%`} 
          subtitle="Loss Rate: 0.8%" icon={Target} trend="up" gradient={GRADIENTS.warning}
        />
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Production Telemetry */}
        <Card className="lg:col-span-2 border-border/40 bg-card/40 backdrop-blur-md shadow-2xl rounded-[2.5rem] overflow-hidden group">
          <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 shadow-glow-primary/5 text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="font-display tracking-tight text-2xl font-black uppercase gradient-text">Production Telemetry</span>
                <Badge variant="outline" className="border-primary/20 text-primary animate-pulse text-[9px] font-black tracking-widest">LIVE DATA FEED</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={biMetrics.dailyTrend}>
                <defs>
                  <linearGradient id="glowPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(12px)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="produced" stroke={CHART_COLORS.primary} strokeWidth={4} fill="url(#glowPrimary)" />
                <Area type="monotone" dataKey="lost" stroke={CHART_COLORS.danger} strokeWidth={2} fill="rgba(239, 44, 44, 0.1)" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Operational Status Matrix */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-2xl rounded-[2.5rem] overflow-hidden group border-l-4 border-l-primary/50">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="flex items-center gap-4 text-2xl font-black font-display uppercase tracking-tight gradient-text">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <LayoutGrid className="h-6 w-6" />
              </div>
              Status Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ResponsiveContainer width="100%" height={260}>
              <RechartsPieChart>
                <Pie 
                  data={biMetrics.statusDistribution} innerRadius={70} outerRadius={90} 
                  paddingAngle={8} dataKey="value" stroke="none"
                  onClick={(d: any) => handleDrillDown(`PEDIDOS: ${d.name}`, d.name)}
                >
                  {biMetrics.statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} className="hover:fill-opacity-100 transition-all cursor-pointer" />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="space-y-3 mt-6">
              {biMetrics.statusDistribution.map((s: any) => (
                <div key={s.name} className="flex items-center justify-between p-3 rounded-xl bg-background/20 border border-white/5 hover:bg-background/40 transition-all group/item cursor-pointer" onClick={() => handleDrillDown(s.name, s.name)}>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-glow" style={{ backgroundColor: s.color }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover/item:text-foreground transition-colors">{s.name}</span>
                  </div>
                  <span className="text-sm font-black text-foreground/80">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Insight Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Studio Performance */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-2xl rounded-[2.5rem] overflow-hidden group">
          <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-4 text-2xl font-black font-display uppercase tracking-tight gradient-text">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-glow-primary/5">
                <Printer className="h-6 w-6" />
              </div>
              Studio Capacity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {studioData.map((studio) => (
                <div key={studio.name} className="p-6 rounded-3xl bg-background/30 border border-white/5 space-y-3 hover:border-primary/30 transition-all group/card">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{studio.name}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-display text-foreground/80 group-hover/card:text-primary transition-colors">{studio.jobs.toFixed(0)}</span>
                    <span className="text-xs font-black text-primary/60 tracking-widest">{studio.utilization}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${studio.utilization}%` }} transition={{ duration: 1.5 }} className="h-full bg-primary" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Intelligence Hub: Losses & Health */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-2xl rounded-[2.5rem] overflow-hidden group border-l-4 border-l-rose-500/50">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="flex items-center gap-4 text-2xl font-black font-display uppercase tracking-tight gradient-text">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                <Target className="h-6 w-6" />
              </div>
              Loss Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="flex items-center justify-between p-8 rounded-[2rem] bg-rose-500/[0.03] border border-rose-500/10 mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent opacity-30" />
              <div className="space-y-2 relative z-10">
                <p className="text-[10px] font-black uppercase text-rose-500/70 tracking-widest">Estimated Impact</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black font-display text-rose-500/90">R$ {(biMetrics.periodLostPieces * 3.5).toLocaleString('pt-BR')}</span>
                  <span className="text-xs font-bold text-rose-500/50 uppercase">Currency</span>
                </div>
              </div>
              <div className="text-right relative z-10">
                <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Total Scrap Count</p>
                <p className="text-2xl font-black text-foreground/80">{biMetrics.periodLostPieces} <span className="text-xs font-bold text-muted-foreground uppercase">Units</span></p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600/70">Critical Risks</span>
                </div>
                <p className="text-xl font-black">03 <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Detected</span></p>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70">Asset Health</span>
                </div>
                <p className="text-xl font-black">98.2% <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Up-time</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drill-Down Intelligence Modal */}
      <Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
        <DialogContent className="max-w-4xl border-border/40 bg-background/95 backdrop-blur-xl shadow-3xl rounded-[2.5rem] p-0 overflow-hidden ring-1 ring-white/10">
          <DialogHeader className="p-8 border-b border-white/5 bg-primary/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Search className="h-6 w-6" /></div>
              <div className="space-y-1">
                <DialogTitle className="text-3xl font-black font-display uppercase tracking-tight text-foreground/90">{drillDownTitle}</DialogTitle>
                <DialogDescription className="text-xs font-bold uppercase tracking-widest text-primary/60 italic leading-none">Quantum Intelligence Drill-Down Analysis</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="p-8">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/5 hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Reference ID</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Technical Product</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Active Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Load Count</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right">Operator Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drillDownJobs.map((job) => (
                  <TableRow key={job.id} className="border-b border-white/5 group hover:bg-primary/[0.03] transition-all">
                    <TableCell className="py-6 font-black font-mono text-primary/80">{job.order_number}</TableCell>
                    <TableCell className="py-6 font-bold text-foreground/70 uppercase tracking-tight text-xs">{job.product}</TableCell>
                    <TableCell className="py-6">
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-black uppercase tracking-tighter px-3 py-1 rounded-full",
                        job.status === 'production' ? "bg-primary/10 text-primary border-primary/20" :
                        job.status === 'finished' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-glow-rose/10"
                      )}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6 font-black text-foreground/80">{job.quantity}</TableCell>
                    <TableCell className="py-6 text-right font-bold text-muted-foreground text-xs uppercase">{job.operator}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function FuturisticStatCard({ title, value, subtitle, icon: Icon, trend, trendValue, gradient, variant }: any) {
  return (
    <Card className={cn(
      "border-border/40 bg-card/40 backdrop-blur-md shadow-2xl rounded-[2.5rem] overflow-hidden group hover:shadow-glow-primary/5 transition-all duration-500 ring-1 ring-white/5 relative h-full",
      variant === 'danger' && "border-rose-500/20 shadow-glow-rose/5"
    )}>
      <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none opacity-40", gradient)} />
      <CardContent className="p-8 relative z-10 space-y-6">
        <div className="flex items-start justify-between">
          <div className={cn("p-4 rounded-2xl bg-primary/10 shadow-inner group-hover:scale-110 transition-transform duration-500", variant === 'danger' && "bg-rose-500/10")}>
            <Icon className={cn("h-6 w-6 text-primary", variant === 'danger' && "text-rose-500")} />
          </div>
          {trend && (
            <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/50 border border-white/5 backdrop-blur-md transition-all group-hover:bg-primary/10", trend === 'up' ? "text-emerald-500" : "text-rose-500")}>
              {trend === 'up' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5 rotate-180" />}
              <span className="text-[10px] font-black uppercase tracking-widest">{trendValue || '8.2%'}</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black font-display tracking-tight text-foreground/90 group-hover:gradient-text transition-all duration-500">{value}</h3>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}
