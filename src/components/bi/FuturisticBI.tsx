import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Activity, Gauge, Target, 
  CheckCircle, PieChart, LineChart, Printer, 
  Users, Wrench, ShieldAlert, Zap, Download, FileText, FileSpreadsheet, Package, Timer, ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar
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
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useOperatorProductivity } from '@/hooks/useOperatorProductivity';
import { useTPM } from '@/hooks/useTPM';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDataExport } from '@/hooks/useDataExport';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DrillDownDialog } from './drilldown/DrillDownDialog';
import { LossesTable } from './losses/LossesTable';
import { DelaysAnalysis } from './delays/DelaysAnalysis';
import { exportProductionReport, exportLossesReport, exportDelaysReport } from '@/lib/pdfExport';
import { subDays } from 'date-fns';




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
  const navigate = useNavigate();
  const { operators, overallStats } = useOperatorProductivity(30);
  const { stats: tpmStats, records: tpmRecords } = useTPM();
  const { exportData: exportJobs } = useDataExport('jobs');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'pdf', type: string) => {
    setIsExporting(true);
    const dateRange = { start: subDays(new Date(), 30), end: new Date(), label: 'Últimos 30 dias' };
    
    try {
      if (format === 'csv') {
        toast.info(`Gerando CSV para ${type}...`);
        
        let dataToExport: any[] = [];
        let filename = `BI_Export_${type}_${formatDate(new Date(), 'yyyyMMdd')}`;

        if (type.includes('Perdas')) {
          dataToExport = jobsWithLosses;
        } else if (type.includes('Atrasos')) {
          dataToExport = delayedJobsList;
        } else if (type.includes('Pedidos_A_Fazer')) {
          dataToExport = (biMetrics.periodJobsList || []).filter((j: any) => j.status === 'scheduled' || j.status === 'queue');
        } else {
          dataToExport = biMetrics.periodJobsList || [];
        }

        if (dataToExport.length === 0) {
          toast.warning("Nenhum dado encontrado para exportar.");
          setIsExporting(false);
          return;
        }

        // Simple CSV generation helper
        const headers = Object.keys(dataToExport[0]).join(',');
        const rows = dataToExport.map(obj => 
          Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        const blob = new Blob([`\uFEFF${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Exportação CSV de ${type} concluída.`);
      } else {
        toast.info(`Gerando PDF para ${type}...`);
        
        if (type.includes('Perdas')) {
          await exportLossesReport(jobsWithLosses, dateRange);
        } else if (type.includes('Atrasos')) {
          await exportDelaysReport(delayedJobsList, dateRange);
        } else {
          const jobs = (biMetrics.periodJobsList || []).map((j: any) => ({
            order_number: j.order_number || `OS-${j.id?.slice(0, 5)}`,
            client: j.client_name || 'Cliente',
            product: j.product_name || 'Produto',
            status: j.status,
            quantity: j.quantity,
            produced_quantity: j.produced_quantity,
            lost_pieces: j.lost_pieces,
            scheduled_date: j.scheduled_date
          }));
          await exportProductionReport(jobs, dateRange, `Relatório: ${type.replace(/_/g, ' ')}`);
        }
        
        toast.success(`Relatório PDF de ${type} gerado com sucesso.`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Falha ao gerar exportação.");
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function for date formatting in filename
  function formatDate(date: Date, pattern: string): string {
    return format(date, pattern);
  }
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState('');
  const [drillDownJobs, setDrillDownJobs] = useState<any[]>([]);

  const handleDrillDown = (title: string, segment: string) => {
    setDrillDownTitle(title);
    
    // Filter real jobs from the list provided by biMetrics
    if (biMetrics.periodJobsList) {
      const filtered = biMetrics.periodJobsList.filter((j: any) => {
        if (segment === 'all') return true;
        const s = segment.toLowerCase();
        
        // Match logic for various drill-down scenarios
        return (
          j.status === s || 
          j.machine_id === segment || 
          j.technique_id === segment ||
          (s === 'lost' && (j.lost_pieces || 0) > 0) ||
          (s === 'delayed' && j.status === 'delayed') ||
          (s === 'queue' && (j.status === 'scheduled' || j.status === 'queue')) ||
          (s === 'production' && j.status === 'production') ||
          (segment.includes('Studio') && (
            // Logical mapping to Studio groups
            (segment === 'Studio Alfa' && j.technique_id?.includes('Laser')) ||
            (segment === 'Studio Beta' && j.technique_id?.includes('UV')) ||
            (segment === 'Studio Gamma' && !j.technique_id?.includes('Laser') && !j.technique_id?.includes('UV'))
          ))
        );
      }).map((j: any) => ({
        id: j.id,
        order_number: j.order_number || `OS-${j.id.slice(0, 5)}`,
        product: j.product_name || 'Produto',
        status: j.status,
        quantity: j.quantity,
        efficiency: j.produced_quantity > 0 ? (((j.produced_quantity - (j.lost_pieces || 0)) / j.produced_quantity) * 100).toFixed(1) + '%' : '--'
      }));
      setDrillDownJobs(filtered);
    } else {
      setDrillDownJobs([]);
    }
    
    setDrillDownOpen(true);
  };

  // Derived data for "Studios" (Grouping machines into studios based on techniques)
  const studioData = useMemo(() => {
    if (!biMetrics.machineUtilization) return [];
    
    // Create logical studios based on machine techniques
    const machineGroups: Record<string, any[]> = {};
    biMetrics.machineUtilization.forEach((m: any) => {
      const studioName = m.technique.includes('Laser') ? 'Studio Alfa' : 
                        m.technique.includes('UV') ? 'Studio Beta' : 
                        'Studio Gamma';
      if (!machineGroups[studioName]) machineGroups[studioName] = [];
      machineGroups[studioName].push(m);
    });

    return Object.entries(machineGroups).map(([name, machines]) => {
      const totalJobs = machines.reduce((sum: number, m: any) => sum + m.totalJobs, 0);
      const avgUtilization = machines.reduce((sum: number, m: any) => sum + m.utilization, 0) / machines.length;
      return {
        name,
        jobs: totalJobs,
        utilization: avgUtilization,
        color: name === 'Studio Alfa' ? CHART_COLORS.primary : name === 'Studio Beta' ? CHART_COLORS.purple : CHART_COLORS.cyan
      };
    }).sort((a, b) => b.jobs - a.jobs);
  }, [biMetrics.machineUtilization]);

  // Derived data for "Losses per Job"
  const lossAnalysis = useMemo(() => {
    if (!biMetrics.dailyTrend) return [];
    return biMetrics.dailyTrend.map((d: any) => ({
      date: d.date,
      lossRate: (d.produced + d.lost) > 0 ? (d.lost / (d.produced + d.lost)) * 100 : 0,
      lost: d.lost
    }));
  }, [biMetrics.dailyTrend]);

  const jobsWithLosses = useMemo(() => {
    if (!biMetrics.periodJobsList) return [];
    return biMetrics.periodJobsList
      .filter((j: any) => (j.lost_pieces || 0) > 0)
      .sort((a: any, b: any) => (b.lost_pieces || 0) - (a.lost_pieces || 0))
      .slice(0, 10);
  }, [biMetrics.periodJobsList]);

  const delayedJobsList = useMemo(() => {
    if (!biMetrics.periodJobsList) return [];
    return biMetrics.periodJobsList
      .filter((j: any) => j.status === 'delayed')
      .slice(0, 10);
  }, [biMetrics.periodJobsList]);

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
          title="Pedidos a Fazer" 
          value={biMetrics.toDoJobs || 0} 
          subtitle="Fila de Espera"
          icon={Package} 
          gradient={GRADIENTS.purple}
          glowColor="purple"
          onExport={(format: 'csv' | 'pdf') => handleExport(format, 'Pedidos_A_Fazer')}
          onClick={() => handleDrillDown('PEDIDOS A FAZER', 'queue')}
        />
        <FuturisticStatCard 
          title="Jobs em Produção" 
          value={kpis.inProgressJobs} 
          subtitle="Capacidade: 92%"
          icon={Zap} 
          gradient={GRADIENTS.success}
          glowColor="success"
          onExport={(format: 'csv' | 'pdf') => handleExport(format, 'Producao_Atual')}
          onClick={() => handleDrillDown('PEDIDOS EM PRODUÇÃO', 'production')}
        />
        <FuturisticStatCard 
          title="Atrasos Críticos" 
          value={kpis.delayedJobs} 
          subtitle={`Ação requerida em ${kpis.delayedJobs}`}
          icon={ShieldAlert} 
          variant="danger"
          gradient={GRADIENTS.danger}
          glowColor="danger"
          onExport={(format: 'csv' | 'pdf') => handleExport(format, 'Atrasos_Criticos')}
          onClick={() => handleDrillDown('PEDIDOS ATRASADOS', 'delayed')}
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
          onExport={(format: 'csv' | 'pdf') => handleExport(format, 'Perdas_Qualidade')}
          onClick={() => handleDrillDown('PEDIDOS COM PERDAS', 'lost')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Production Flux */}
        <Card className="lg:col-span-2 bg-black/40 border-primary/20 backdrop-blur-xl hover:border-primary/40 transition-all duration-500 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <CardHeader className="relative z-10 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display tracking-wider text-xl uppercase">Fluxo de Produção</span>
              <Badge variant="outline" className="border-primary/30 text-primary animate-pulse ml-2">LIVE</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => handleExport('csv', 'Tendencia_Producao')}
              >
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => handleExport('pdf', 'Tendencia_Producao')}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart 
                data={biMetrics.dailyTrend}
                onClick={(data: any) => {
                  if (data && data.activeLabel) {
                    handleDrillDown(`PEDIDOS EM ${data.activeLabel}`, data.activeLabel);
                  }
                }}
              >
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <PieChart className="h-5 w-5 text-primary" />
              <span className="font-display tracking-wider uppercase">Status dos Pedidos</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => handleExport('csv', 'Status_Pedidos')}
              >
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => handleExport('pdf', 'Status_Pedidos')}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
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
                  onClick={(data: any) => handleDrillDown(`PEDIDOS: ${data.name}`, data.name)}
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Printer className="h-5 w-5 text-primary" />
              <span className="font-display tracking-wider uppercase">Produção por Studio</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => handleExport('csv', 'Producao_Studios')}
              >
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => handleExport('pdf', 'Producao_Studios')}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
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
                  onClick={(data: any) => handleDrillDown(`STUDIO: ${data.name}`, data.name)}
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-display tracking-wider uppercase">Top Colaboradores</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => handleExport('csv', 'Ranking_Colaboradores')}
              >
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => handleExport('pdf', 'Ranking_Colaboradores')}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
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
        <LossesTable jobs={jobsWithLosses} onExport={handleExport} />
        <DelaysAnalysis delayedJobs={delayedJobsList} rootCauses={[{ label: 'Setup Complexo', value: 65, color: CHART_COLORS.primary }, { label: 'Manutenção Corretiva', value: 20, color: CHART_COLORS.danger }, { label: 'Insumos Faltantes', value: 10, color: CHART_COLORS.warning }, { label: 'Outros', value: 5, color: CHART_COLORS.purple }]} onExport={handleExport} />
      </div>

      <DrillDownDialog 
        open={drillDownOpen} 
        onOpenChange={setDrillDownOpen} 
        title={drillDownTitle} 
        jobs={drillDownJobs} 
        onExport={(format) => handleExport(format, `DrillDown_${drillDownTitle.replace(/\s+/g, '_')}`)}
      />


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

function FuturisticStatCard({ title, value, subtitle, icon: Icon, trend, trendValue, variant = 'default', gradient, glowColor, onExport, onClick }: any) {
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
      <Card 
        onClick={onClick}
        className={cn(
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
            <div className="flex flex-col items-end gap-2">
              <div className={cn(
                "p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-all duration-500",
                variant === 'danger' && "group-hover:bg-rose-500/20"
              )}>
                <Icon className={cn(
                  "h-6 w-6 text-white group-hover:text-primary transition-colors duration-500",
                  variant === 'danger' && "group-hover:text-rose-500"
                )} />
              </div>

              {onExport && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-1 bg-black/90 border-white/10 backdrop-blur-xl" align="end">
                    <div className="flex flex-col">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="justify-start gap-2 text-xs h-8 hover:bg-white/5"
                        onClick={(e) => { e.stopPropagation(); onExport('csv'); }}
                      >
                        <FileSpreadsheet className="h-3 w-3 text-primary" /> CSV
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="justify-start gap-2 text-xs h-8 hover:bg-white/5"
                        onClick={(e) => { e.stopPropagation(); onExport('pdf'); }}
                      >
                        <FileText className="h-3 w-3 text-primary" /> PDF
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
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
