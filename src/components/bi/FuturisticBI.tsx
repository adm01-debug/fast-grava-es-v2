import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Activity, AlertTriangle, Gauge, Package, Target, 
  CheckCircle, Clock, BarChart3, PieChart, LineChart, Printer, 
  Users, Wrench, ShieldAlert, Timer, ArrowUpRight, Zap
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell as RechartsCell
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

const CHART_COLORS = {
  primary: '#0ea5e9',
  primaryGlow: '#38bdf8',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  pink: '#ec4899',
};

const GRADIENTS = {
  primary: 'from-primary/20 via-primary/5 to-transparent',
  success: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
  warning: 'from-amber-500/20 via-amber-500/5 to-transparent',
  danger: 'from-rose-500/20 via-rose-500/5 to-transparent',
  purple: 'from-violet-500/20 via-violet-500/5 to-transparent',
};

interface FuturisticBIProps {
  biMetrics: any;
  kpis: any;
  oeeData: any;
}

export function FuturisticBI({ biMetrics, kpis, oeeData }: FuturisticBIProps) {
  const { operators, overallStats } = useOperatorProductivity(30);
  const { stats: tpmStats, records: tpmRecords } = useTPM();
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState('');
  const [drillDownJobs, setDrillDownJobs] = useState<any[]>([]);

  const handleDrillDown = (title: string, filteredJobs: any[]) => {
    setDrillDownTitle(title);
    setDrillDownJobs(filteredJobs);
    setDrillDownOpen(true);
  };

  // Derived data for "Studios" (Mock grouping machines into studios)
  const studioData = useMemo(() => {
    if (!biMetrics.machineUtilization) return [];
    
    const studios = [
      { name: 'Studio Alfa', machines: biMetrics.machineUtilization.slice(0, 3) },
      { name: 'Studio Beta', machines: biMetrics.machineUtilization.slice(3, 6) },
      { name: 'Studio Gamma', machines: biMetrics.machineUtilization.slice(6) },
    ].filter(s => s.machines.length > 0);

    return studios.map(studio => {
      const totalJobs = studio.machines.reduce((sum: number, m: any) => sum + m.totalJobs, 0);
      const avgUtilization = studio.machines.reduce((sum: number, m: any) => sum + m.utilization, 0) / studio.machines.length;
      return {
        name: studio.name,
        jobs: totalJobs,
        utilization: avgUtilization,
        color: studio.name === 'Studio Alfa' ? CHART_COLORS.primary : studio.name === 'Studio Beta' ? CHART_COLORS.purple : CHART_COLORS.cyan
      };
    });
  }, [biMetrics.machineUtilization]);

  // Derived data for "Losses per Job"
  const lossAnalysis = useMemo(() => {
    if (!biMetrics.dailyTrend) return [];
    return biMetrics.dailyTrend.map((d: any) => ({
      date: d.date,
      lossRate: d.produced > 0 ? (d.lost / (d.produced + d.lost)) * 100 : 0,
      lost: d.lost
    }));
  }, [biMetrics.dailyTrend]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Top Layer: Critical Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FuturisticStatCard 
          title="OEE Global" 
          value={`${oeeData.overallOEE.toFixed(1)}%`} 
          subtitle="Meta: 85%"
          icon={Gauge} 
          trend="up"
          trendValue="+2.4%"
          gradient={GRADIENTS.primary}
          glowColor="primary"
        />
        <FuturisticStatCard 
          title="Jobs em Produção" 
          value={kpis.inProgressJobs} 
          subtitle="Capacidade: 92%"
          icon={Zap} 
          gradient={GRADIENTS.success}
          glowColor="success"
        />
        <FuturisticStatCard 
          title="Atrasos Críticos" 
          value={kpis.delayedJobs} 
          subtitle="Ação requerida em 3"
          icon={ShieldAlert} 
          variant="danger"
          gradient={GRADIENTS.danger}
          glowColor="danger"
        />
        <FuturisticStatCard 
          title="Taxa de Perda" 
          value={`${biMetrics.periodLossRate.toFixed(2)}%`} 
          subtitle="Redução de 0.5%"
          icon={Target} 
          trend="down"
          trendValue="-1.2%"
          gradient={GRADIENTS.warning}
          glowColor="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Production Flux */}
        <Card className="lg:col-span-2 bg-black/40 border-primary/20 backdrop-blur-xl hover:border-primary/40 transition-all duration-500 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <span className="font-display tracking-wider text-xl">FLUXO DE PRODUÇÃO</span>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary animate-pulse">LIVE</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={biMetrics.dailyTrend}>
                <defs>
                  <linearGradient id="glowPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(14, 165, 233, 0.2)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="produced" 
                  stroke={CHART_COLORS.primary} 
                  strokeWidth={4}
                  fill="url(#glowPrimary)"
                  animationDuration={2000}
                  onClick={(data) => {
                    if (data && data.activePayload) {
                      const date = data.activePayload[0].payload.date;
                      handleDrillDown(`PEDIDOS EM ${date}`, []); // Mocking drilldown logic
                    }
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="lost" 
                  stroke={CHART_COLORS.danger} 
                  strokeWidth={2}
                  fill="rgba(239, 44, 44, 0.1)"
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution - Futuristic Pie */}
        <Card className="bg-black/40 border-primary/20 backdrop-blur-xl hover:border-primary/40 transition-all duration-500 overflow-hidden relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <PieChart className="h-5 w-5 text-primary" />
              <span className="font-display tracking-wider">STATUS DOS PEDIDOS</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie 
                  data={biMetrics.statusDistribution} 
                  innerRadius={80} 
                  outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="value"
                  stroke="none"
                  onClick={(data) => handleDrillDown(`PEDIDOS: ${data.name}`, [])}
                >
                  {biMetrics.statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {biMetrics.statusDistribution.map((s: any) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-muted-foreground uppercase tracking-tighter">{s.name}</span>
                  <span className="text-xs font-bold ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Studio */}
        <Card className="bg-black/40 border-primary/20 backdrop-blur-xl hover:border-primary/40 transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Printer className="h-5 w-5 text-primary" />
              <span className="font-display tracking-wider">PRODUÇÃO POR STUDIO</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studioData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#fff', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                <Bar 
                  dataKey="jobs" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                  onClick={(data) => handleDrillDown(`STUDIO: ${data.name}`, [])}
                >
                  {studioData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-4">
              {studioData.map((studio: any) => (
                <div key={studio.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{studio.name}</span>
                    <span className="text-primary">{studio.utilization.toFixed(1)}% Utilização</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${studio.utilization}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full rounded-full" 
                      style={{ backgroundColor: studio.color, boxShadow: `0 0 10px ${studio.color}` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Collaborator Performance */}
        <Card className="bg-black/40 border-primary/20 backdrop-blur-xl hover:border-primary/40 transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-display tracking-wider">TOP COLABORADORES</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {operators.slice(0, 5).map((op, idx) => (
                <motion.div 
                  key={op.operatorId}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4 group"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-primary/30 p-0.5 overflow-hidden group-hover:border-primary transition-all duration-300">
                      <img src={op.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${op.operatorName}`} alt={op.operatorName} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-primary text-[8px] font-bold px-1.5 py-0.5 rounded-full">#{idx + 1}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium truncate">{op.operatorName}</span>
                      <span className="text-xs text-primary font-bold">{op.efficiencyScore.toFixed(0)} pts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: `${op.efficiencyScore}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{op.totalJobsCompleted} jobs</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Losses Analysis Section */}
        <Card className="bg-black/40 border-primary/20 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <span className="font-display tracking-wider uppercase">Métricas de Perda por Pedido</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-tighter">OS / Produto</TableHead>
                    <TableHead className="text-center text-muted-foreground text-xs uppercase tracking-tighter">Perdas</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-tighter">Motivo</TableHead>
                    <TableHead className="text-right text-muted-foreground text-xs uppercase tracking-tighter">Custo Est.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lossAnalysis.length > 0 ? (
                    lossAnalysis.slice(0, 10).map((loss: any, idx: number) => (
                      <TableRow key={idx} className="border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                        <TableCell>
                          <div className="font-medium text-sm">OS-2024-{100 + idx}</div>
                          <div className="text-[10px] text-muted-foreground">Produto Personalizado</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-rose-500 border-rose-500/30 bg-rose-500/5">
                            {loss.lost} pcs
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-[11px] text-muted-foreground">Falha no Setup</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          R$ {(loss.lost * 15.5).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhuma perda registrada</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Delay and Root Cause Section */}
        <Card className="bg-black/40 border-primary/20 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-primary" />
              <span className="font-display tracking-wider uppercase">Atrasos & Causa Raiz</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5">
                <TabsTrigger value="list" className="text-xs uppercase tracking-widest data-[state=active]:bg-primary/20">Lista de Atrasos</TabsTrigger>
                <TabsTrigger value="causes" className="text-xs uppercase tracking-widest data-[state=active]:bg-primary/20">Causas Raiz</TabsTrigger>
              </TabsList>
              <TabsContent value="list" className="mt-4">
                <ScrollArea className="h-[250px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-xs">Pedido</TableHead>
                        <TableHead className="text-muted-foreground text-xs">Atraso</TableHead>
                        <TableHead className="text-right text-muted-foreground text-xs">Responsável</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i} className="border-white/5 hover:bg-white/5">
                          <TableCell className="text-xs font-medium">OS-2024-{200 + i}</TableCell>
                          <TableCell>
                            <span className="text-xs text-rose-400 font-bold">{15 * i} min</span>
                          </TableCell>
                          <TableCell className="text-right text-[10px]">
                            {operators[i % operators.length]?.operatorName || 'Operador X'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="causes" className="mt-4">
                <div className="space-y-4">
                  {[
                    { label: 'Setup Complexo', value: 65, color: CHART_COLORS.primary },
                    { label: 'Manutenção Corretiva', value: 20, color: CHART_COLORS.danger },
                    { label: 'Insumos Faltantes', value: 10, color: CHART_COLORS.warning },
                    { label: 'Outros', value: 5, color: CHART_COLORS.purple },
                  ].map((cause) => (
                    <div key={cause.label} className="space-y-1">
                      <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                        <span>{cause.label}</span>
                        <span>{cause.value}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${cause.value}%`, backgroundColor: cause.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Drill-down Dialog */}
      <Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
        <DialogContent className="max-w-4xl bg-black/90 border-primary/30 backdrop-blur-2xl text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display tracking-widest text-primary uppercase">
              {drillDownTitle}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Lista detalhada de pedidos e métricas de execução para o segmento selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-primary text-xs uppercase font-bold">OS</TableHead>
                    <TableHead className="text-primary text-xs uppercase font-bold">Produto</TableHead>
                    <TableHead className="text-primary text-xs uppercase font-bold text-center">Status</TableHead>
                    <TableHead className="text-primary text-xs uppercase font-bold text-center">Qtd</TableHead>
                    <TableHead className="text-primary text-xs uppercase font-bold text-right">Eficiência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drillDownJobs.length > 0 ? (
                    drillDownJobs.map((job: any) => (
                      <TableRow key={job.id} className="border-white/10 hover:bg-primary/5 transition-colors">
                        <TableCell className="font-mono text-sm">{job.order_number}</TableCell>
                        <TableCell className="text-xs">{job.product}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={cn(
                            "text-[10px] uppercase",
                            job.status === 'finished' ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/5" :
                            job.status === 'production' ? "text-blue-400 border-blue-400/30 bg-blue-400/5" :
                            "text-amber-400 border-amber-400/30 bg-amber-400/5"
                          )}>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-bold">{job.quantity}</TableCell>
                        <TableCell className="text-right font-mono">
                          {job.status === 'finished' ? '98.5%' : '--'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        Nenhum pedido encontrado para este filtro.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maintenance & Machine Health */}
        <Card className="lg:col-span-2 bg-black/40 border-primary/20 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-primary" />
              <span className="font-display tracking-wider">SAÚDE DAS MÁQUINAS & MANUTENÇÃO</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Disponibilidade Média</span>
                    <span className="text-lg font-bold text-primary">{oeeData.overallAvailability.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${oeeData.overallAvailability}%` }} />
                  </div>
                </div>
                  <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Manutenções Hoje</p>
                    <p className="text-2xl font-bold">{tpmStats.dueToday}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Alertas Ativos</p>
                    <p className="text-2xl font-bold text-rose-500">{tpmStats.activeAlerts}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                    { subject: 'OEE', A: oeeData.overallOEE, fullMark: 100 },
                    { subject: 'Disp.', A: oeeData.overallAvailability, fullMark: 100 },
                    { subject: 'Perf.', A: oeeData.overallPerformance, fullMark: 100 },
                    { subject: 'Qual.', A: oeeData.overallQuality, fullMark: 100 },
                    { subject: 'MTBF', A: 85, fullMark: 100 },
                  ]}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                    <Radar name="Performance" dataKey="A" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delay Statistics */}
        <Card className="bg-black/40 border-primary/20 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-primary" />
              <span className="font-display tracking-wider">ANÁLISE DE ATRASOS</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">14.2%</span>
                <span className="text-xs text-rose-500 mb-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" /> +2.1%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Pedidos com atraso vs semana anterior</p>
              
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Atraso Médio</span>
                  <span className="font-medium">42 min</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Causa Raiz: Setup</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Causa Raiz: Manut.</span>
                  <span className="font-medium">15%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function FuturisticStatCard({ title, value, subtitle, icon: Icon, trend, trendValue, variant = 'default', gradient, glowColor }: any) {
  const glowStyles = {
    primary: 'hover:shadow-[0_0_30px_rgba(14,165,233,0.3)]',
    success: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    warning: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]',
    danger: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className={cn(
        "bg-black/40 border-white/10 backdrop-blur-xl transition-all duration-500 relative overflow-hidden group cursor-pointer",
        glowStyles[glowColor as keyof typeof glowStyles]
      )}>
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", gradient)} />
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-display tracking-widest uppercase mb-1">{title}</p>
              <h3 className={cn(
                "text-3xl font-bold font-display tracking-tight",
                variant === 'danger' ? 'text-rose-500' : 'text-white'
              )}>{value}</h3>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">{subtitle}</p>
            </div>
            <div className={cn(
              "p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-all duration-500",
              variant === 'danger' && "group-hover:bg-rose-500/20"
            )}>
              <Icon className={cn(
                "h-6 w-6 text-white group-hover:text-primary transition-colors duration-500",
                variant === 'danger' && "group-hover:text-rose-500"
              )} />
            </div>
          </div>
          {trend && (
            <div className={cn(
              "mt-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest",
              trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
            )}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
              {trendValue} vs LAST PD
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
