import { useState, lazy, Suspense, useMemo, memo, useCallback, useEffect } from 'react';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  Clock,
  Gauge,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Settings2,
  Leaf,
  Droplets,
  Zap,
  Sparkles,
  FileDown,
  ArrowRight,
  Calculator,
  Lightbulb,
  ArrowUpRight,
  Play,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  Bookmark,
  Save,
  Trash2,
  Info
} from 'lucide-react';
import { useOEE, WORLD_CLASS_OEE, getOEEColor } from '@/hooks/useOEE';
import { useOEEAlerts } from '@/hooks/useOEEAlerts';
import { useProductionLosses } from '@/hooks/useProductionLosses';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
const OEEGaugeCard = lazy(() => import('@/components/oee/OEEGaugeCard').then(m => ({ default: m.OEEGaugeCard })));
import { Skeleton } from '@/components/ui/skeleton';
import { KPITooltip, KPI_DEFINITIONS } from '@/components/ui/kpi-tooltip';
import { VoiceButton } from '@/components/voice/VoiceCommands';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useDashboardPresets } from '@/hooks/useDashboardPresets';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { KPIPageSkeleton, ChartSkeleton, TableSkeleton } from '@/components/loading';

// Lazy load heavy dashboard components
const OEEMachineTable = lazy(() => import('@/components/oee/OEEMachineTable').then(m => ({ default: m.OEEMachineTable })));
const OEETrendChart = lazy(() => import('@/components/oee/OEETrendChart').then(m => ({ default: m.OEETrendChart })));
const OEELossesChart = lazy(() => import('@/components/oee/OEELossesChart').then(m => ({ default: m.OEELossesChart })));
const OEETechniqueComparison = lazy(() => import('@/components/oee/OEETechniqueComparison').then(m => ({ default: m.OEETechniqueComparison })));
const OEEHeatmap = lazy(() => import('@/components/oee/OEEHeatmap').then(m => ({ default: m.OEEHeatmap })));
const PredictiveAlerts = lazy(() => import('@/components/oee/PredictiveAlerts').then(m => ({ default: m.PredictiveAlerts })));
const ParetoLossesChart = lazy(() => import('@/components/oee/ParetoLossesChart').then(m => ({ default: m.ParetoLossesChart })));
const OEELossDrilldown = lazy(() => import('@/components/oee/OEELossDrilldown').then(m => ({ default: m.OEELossDrilldown })));
const OEEShiftComparison = lazy(() => import('@/components/oee/OEEShiftComparison').then(m => ({ default: m.OEEShiftComparison })));
const OEERecommendations = lazy(() => import('@/components/oee/OEERecommendations').then(m => ({ default: m.OEERecommendations })));
const OEERankingGap = lazy(() => import('@/components/oee/OEERankingGap').then(m => ({ default: m.OEERankingGap })));

const OEEDashboard = memo(function OEEDashboard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<string>('30');
  const [machineId, setMachineId] = useState<string>('all');
  const [techniqueId, setTechniqueId] = useState<string>('all');
  const [shift, setShift] = useState<string>('all');
  const [showSimulator, setShowSimulator] = useState(false);
  const [simValues, setSimValues] = useState({ availability: 85, performance: 90, quality: 98 });
  const [presetName, setPresetName] = useState('');
  const { presets, savePreset, deletePreset } = useDashboardPresets('oee');
  const [activeTab, setActiveTab] = useState('overview');
  const [showConfig, setShowSimulatorLocal] = useState(false); // Used for a future settings modal if needed
  const [showAudit, setShowAudit] = useState(false);
  
  const dateRange = useMemo(() => {
    const now = new Date();
    return {
      start: startOfDay(subDays(now, parseInt(period))),
      end: endOfDay(now)
    };
  }, [period]);

  const oeeFilters = useMemo(() => ({
    machineId: machineId === 'all' ? undefined : machineId,
    techniqueId: techniqueId === 'all' ? undefined : techniqueId,
    shift: shift === 'all' ? undefined : shift,
    startDate: dateRange.start,
    endDate: dateRange.end
  }), [machineId, techniqueId, shift, dateRange]);

  const lossFilters = useMemo(() => ({
    ...oeeFilters,
    startDate: dateRange.start.toISOString(),
    endDate: dateRange.end.toISOString()
  }), [oeeFilters, dateRange]);

  const { data, isLoading, downloadReport } = useOEE(parseInt(period), 30, oeeFilters);
  const { losses, isLoading: lossesLoading } = useProductionLosses(undefined, lossFilters);

  const applyPreset = (preset: any) => {
    if (preset.filters.period) setPeriod(preset.filters.period);
    if (preset.filters.machineId) setMachineId(preset.filters.machineId);
    if (preset.filters.techniqueId) setTechniqueId(preset.filters.techniqueId);
    if (preset.filters.shift) setShift(preset.filters.shift);
    toast.success(`Filtro "${preset.name}" aplicado`);
  };

  const handleSavePreset = () => {
    if (!presetName) return;
    savePreset({
      name: presetName,
      filters: { period, machineId, techniqueId, shift }
    });
    setPresetName('');
    toast.success('Preset salvo com sucesso');
  };

  const handleShare = () => {
    const params = new URLSearchParams({
      period,
      machineId,
      techniqueId,
      shift,
      tab: activeTab
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    toast.success('Link de compartilhamento copiado!', {
      description: 'Todos os filtros atuais foram incluídos no link.'
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('period');
    const m = params.get('machineId');
    const t = params.get('techniqueId');
    const s = params.get('shift');
    const tab = params.get('tab');

    if (p) setPeriod(p);
    if (m) setMachineId(m);
    if (t) setTechniqueId(t);
    if (s) setShift(s);
    if (tab) setActiveTab(tab);
  }, []);

  const handleDownloadReport = useCallback(async (reportFormat: 'excel' | 'pdf' | 'csv') => {
    if (!data) return;
    
    if (reportFormat === 'csv') {
      const csvData = data.byMachine.map(m => ({
        'Máquina': m.machineName,
        'Código': m.machineCode,
        'Técnica': m.techniqueName,
        'Disponibilidade (%)': m.availability,
        'Performance (%)': m.performance,
        'Qualidade (%)': m.quality,
        'OEE (%)': m.oee,
        'Gap vs Meta': (m.oee - 85).toFixed(1) + '%',
        'Total Peças': m.totalPiecesProduced,
        'Peças Boas': m.goodPieces,
        'Perdas': m.lostPieces
      }));
      
      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map(row => Object.values(row).map(v => typeof v === 'string' ? `"${v}"` : v).join(','));
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `fast_gravacoes_oee_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (reportFormat === 'pdf') {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      
      // Header and Logo simulation
      doc.setFillColor(232, 93, 58); // Premium Orange
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setFontSize(24);
      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.text('FAST GRAVAÇÕES', 14, 25);
      doc.setFontSize(10);
      doc.text('GESTÃO DE GRAVAÇÃO - RELATÓRIO OEE', 14, 32);
      
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text('Relatório Executivo de Performance', 14, 55);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Período: Últimos ${period} dias`, 14, 65);
      doc.text(`Filtros: Máquina: ${machineId === 'all' ? 'Todas' : machineId} | Técnica: ${techniqueId === 'all' ? 'Todas' : techniqueId} | Turno: ${shift === 'all' ? 'Todos' : shift}`, 14, 70);
      doc.text(`Gerado em: ${format(new Date(), 'PPP', { locale: ptBR })}`, 14, 75);
      
      // Summary Box
      doc.setDrawColor(230);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 85, 180, 40, 3, 3, 'FD');
      
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.text('RESUMO GERAL DO PERÍODO', 20, 95);
      
      doc.setFontSize(28);
      doc.setTextColor(232, 93, 58);
      doc.text(`${data.overallOEE.toFixed(1)}%`, 20, 115);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('OEE GLOBAL', 20, 120);
      
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`${data.overallAvailability.toFixed(1)}%`, 70, 110);
      doc.setFontSize(8);
      doc.text('DISPONIBILIDADE', 70, 115);
      
      doc.setFontSize(12);
      doc.text(`${data.overallPerformance.toFixed(1)}%`, 110, 110);
      doc.setFontSize(8);
      doc.text('PERFORMANCE', 110, 115);
      
      doc.setFontSize(12);
      doc.text(`${data.overallQuality.toFixed(1)}%`, 150, 110);
      doc.setFontSize(8);
      doc.text('QUALIDADE', 150, 115);

      const tableData = data.byMachine.map((m, idx) => [
        idx + 1,
        m.machineName,
        m.techniqueName,
        `${m.availability}%`,
        `${m.performance}%`,
        `${m.quality}%`,
        `${m.oee}%`,
        (m.oee - 85).toFixed(1) + '%',
        m.lostPieces.toLocaleString()
      ]);
      
      autoTable(doc, {
        startY: 135,
        head: [['#', 'Máquina', 'Técnica', 'Disp.', 'Perf.', 'Qual.', 'OEE', 'Gap', 'Perdas']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [232, 93, 58],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          6: { fontStyle: 'bold' },
          7: { fontStyle: 'bold' }
        }
      });
      
      // Action Plan section
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      if (finalY < 250) {
        doc.setFontSize(14);
        doc.setTextColor(232, 93, 58);
        doc.text('Recomendações e Plano de Ação', 14, finalY);
        
        doc.setFontSize(9);
        doc.setTextColor(100);
        let actionY = finalY + 10;
        if (data.overallOEE < 85) {
          doc.text('• Implementar melhoria contínua nos gargalos de disponibilidade.', 14, actionY);
          doc.text('• Revisar tempos de setup nas máquinas com maior gap vs meta.', 14, actionY + 5);
        } else {
          doc.text('• Performance de Classe Mundial atingida. Manter protocolos atuais.', 14, actionY);
        }
      }
      
      doc.save(`fast_gravacoes_oee_report_${new Date().toISOString().slice(0,10)}.pdf`);
    } else {
      downloadReport(reportFormat);
    }
    toast.success(t('common.reportExported', 'Relatório exportado com sucesso!'));
  }, [data, downloadReport, t, period, machineId, techniqueId, shift]);

  // Activate OEE alerts
  useOEEAlerts();

  if (isLoading) {
    return <KPIPageSkeleton />;
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>{t('oee.loadingError', 'Não foi possível carregar os dados de OEE.')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const machinesAtWorldClass = data.byMachine.filter(m => m.oee >= WORLD_CLASS_OEE).length;
  const machinesBelowTarget = data.byMachine.filter(m => m.oee < 65 && m.totalJobs > 0).length;

  return (
      <div className="p-6 space-y-6">
        <Helmet>
          <title>OEE Dashboard | FAST GRAVAÇÕES</title>
          <meta name="description" content="Análise de Eficiência Global dos Equipamentos (OEE) e indicadores de performance industrial." />
        </Helmet>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black font-display flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary animate-pulse hidden sm:block" />
              FAST GRAVAÇÕES - GESTÃO DE GRAVAÇÃO
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('oee.description', 'Overall Equipment Effectiveness - Eficiência Global dos Equipamentos')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <VoiceButton />
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShare}
              className="flex gap-2 border-primary/20 hover:bg-primary/5 active:scale-95 transition-transform"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span className="hidden sm:inline">Compartilhar</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex gap-2 border-primary/20 hover:bg-primary/5 active:scale-95 transition-transform">
                  <FileDown className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('common.export', 'Exportar')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownloadReport('excel')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-green-500" /> Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadReport('pdf')}>
                  <FileText className="h-4 w-4 mr-2 text-red-500" /> Relatório PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadReport('csv')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" /> Dados CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[100px] sm:w-28 md:w-36 glass-card border-primary/20">
                <SelectValue placeholder={t('common.period', 'Período')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">{t('common.last7Days', '7 dias')}</SelectItem>
                <SelectItem value="14">{t('common.last14Days', '14 dias')}</SelectItem>
                <SelectItem value="30">{t('common.last30Days', '30 dias')}</SelectItem>
                <SelectItem value="60">{t('common.last60Days', '60 dias')}</SelectItem>
                <SelectItem value="90">{t('common.last90Days', '90 dias')}</SelectItem>
                <SelectItem value="180">{t('common.last180Days', '180 dias')}</SelectItem>
                <SelectItem value="365">{t('common.last365Days', '365 dias')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={techniqueId} onValueChange={setTechniqueId}>
              <SelectTrigger className="w-[110px] sm:w-32 md:w-44 glass-card border-primary/20">
                <SelectValue placeholder={t('common.technique', 'Técnica')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allTechniques', 'Todas Técnicas')}</SelectItem>
                {data.byTechnique.map(tech => (
                  <SelectItem key={tech.techniqueId} value={tech.techniqueId}>{tech.techniqueName}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={machineId} onValueChange={setMachineId}>
              <SelectTrigger className="w-[110px] sm:w-32 md:w-44 glass-card border-primary/20">
                <SelectValue placeholder={t('common.machine', 'Máquina')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allMachines', 'Todas Máquinas')}</SelectItem>
                {data.byMachine
                  .filter(m => techniqueId === 'all' || m.techniqueId === techniqueId)
                  .map(m => (
                    <SelectItem key={m.machineId} value={m.machineId}>{m.machineName}</SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select value={shift} onValueChange={setShift}>
              <SelectTrigger className="w-[100px] sm:w-28 md:w-36 glass-card border-primary/20">
                <SelectValue placeholder="Turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Turnos</SelectItem>
                <SelectItem value="1">Turno 1 (Manhã)</SelectItem>
                <SelectItem value="2">Turno 2 (Tarde)</SelectItem>
                <SelectItem value="3">Turno 3 (Noite)</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="glass-card border-primary/20">
                  <Bookmark className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Presets</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <h3 className="text-sm font-bold mb-3 uppercase tracking-wider">Filtros Salvos</h3>
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
                  {presets && presets.length > 0 ? (
                    presets.map(p => (
                      <div key={p.id} className="flex items-center justify-between group">
                        <button 
                          onClick={() => applyPreset(p)}
                          className="text-xs font-medium hover:text-primary transition-colors truncate flex-1 text-left"
                        >
                          {p.name}
                        </button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deletePreset(p.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-muted-foreground italic">Nenhum preset salvo.</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                  <Input placeholder="Nome do filtro..." className="h-8 text-xs" value={presetName} onChange={e => setPresetName(e.target.value)} />
                  <Button size="sm" className="h-8 w-full gap-2" onClick={handleSavePreset} disabled={!presetName}>
                    <Save className="h-3 w-3" /> Salvar Atual
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* AI Performance Insight Banner */}
        <Card className="bg-black/40 border-primary/30 backdrop-blur-2xl relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="h-32 w-32 text-primary" />
          </div>
          <CardContent className="py-6 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                 <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse uppercase text-[10px] font-black">AI Insight</Badge>
                 <h2 className="text-xl font-bold tracking-tight">{t('oee.consolidated', 'OEE Consolidado')}: {data.overallOEE.toFixed(1)}%</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {data.overallOEE >= 85 
                  ? "Sua planta está operando em nível de Classe Mundial. Mantenha a estabilidade dos processos." 
                  : data.overallOEE >= 65 
                  ? `A técnica ${data.byTechnique[0]?.techniqueName || 'principal'} está liderando a produtividade. Foque em reduzir perdas de disponibilidade para atingir 85%.`
                  : "Atenção: Eficiência global abaixo do esperado. Verifique o drill-down de perdas para identificar gargalos críticos."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 bg-background/40 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
              <div className="text-center px-4 border-r border-border/50">
                 <p className="text-2xl font-black text-primary">{data.overallAvailability.toFixed(0)}%</p>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('oee.availabilityShort', 'Disponib.')}</p>
              </div>
              <div className="text-center px-4 border-r border-border/50">
                 <p className="text-2xl font-black text-indicator-info">{data.overallPerformance.toFixed(0)}%</p>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('oee.performanceShort', 'Perform.')}</p>
              </div>
              <div className="text-center px-4">
                 <p className="text-2xl font-black text-accent-purple">{data.overallQuality.toFixed(0)}%</p>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('common.quality', 'Qualidade')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Predictive Maintenance & Health Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<div className="h-24 animate-pulse bg-muted rounded-xl" />}>
            <PredictiveAlerts alerts={data.maintenanceAlerts} />
          </Suspense>
          <Suspense fallback={<div className="h-24 animate-pulse bg-muted rounded-xl" />}>
            <OEERecommendations data={data} />
          </Suspense>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-indicator-info bg-indicator-info/10">
              <CardContent className="p-4 flex gap-4">
                <div className="h-10 w-10 rounded-full bg-indicator-info/20 flex items-center justify-center shrink-0">
                  <Activity className="h-5 w-5 text-indicator-info" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Status da Linha</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    Operação estabilizada com {machinesAtWorldClass} máquinas em modo de alta performance.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indicator-warning bg-indicator-warning/10">
              <CardContent className="p-4 flex gap-4">
                <div className="h-10 w-10 rounded-full bg-indicator-warning/20 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-5 w-5 text-indicator-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{data.overallPerformance < 85 ? t('oee.performanceBottleneck', 'Gargalo de Performance') : 'Otimização Ativa'}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {data.overallPerformance < 85 ? `A técnica ${data.byTechnique[0]?.techniqueName} apresenta perdas.` : 'Performance estabilizada.'}
                  </p>
                  <Button variant="link" size="sm" onClick={() => setActiveTab('losses')} className="p-0 h-auto text-indicator-warning text-[10px] font-black uppercase mt-1">
                    {t('common.viewDetails', 'Ver Detalhes')} <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indicator-info bg-indicator-info/5">
              <CardContent className="p-4 flex gap-4">
                <div className="h-10 w-10 rounded-full bg-indicator-info/10 flex items-center justify-center shrink-0">
                  <Calculator className="h-5 w-5 text-indicator-info" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">Audit & Simulação</h3>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAudit(!showAudit)} className="h-7 text-[9px] font-black uppercase border-indicator-info/20 hover:bg-indicator-info/10 flex-1">
                      {showAudit ? 'Fechar Audit' : 'Audit OEE'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowSimulator(!showSimulator)} className="h-7 text-[9px] font-black uppercase border-indicator-info/20 hover:bg-indicator-info/10 flex-1">
                      {showSimulator ? 'Fechar Sim' : 'Simular'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="border-l-4 border-l-accent-purple bg-accent-purple/5 transition-all hover:bg-accent-purple/10 cursor-help group">
                    <CardContent className="p-4 flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-accent-purple/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-5 w-5 text-accent-purple" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">Benchmark Industrial</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          OEE Geral: <span className="font-bold text-accent-purple">{data.overallOEE.toFixed(1)}%</span> vs Meta: 85.0%
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-[9px] font-black text-accent-purple/70 uppercase">
                          <Info className="h-3 w-3" /> Ver composição
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent className="w-80 p-4 bg-black/95 border-primary/20 backdrop-blur-xl shadow-2xl" side="bottom">
                  <div className="space-y-4">
                    <div className="border-b border-white/10 pb-2">
                      <p className="text-xs font-black uppercase text-primary tracking-widest mb-1">Fórmula OEE Industrial</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        O OEE é a multiplicação dos 3 fatores abaixo. Se um deles cai, o resultado global é severamente impactado.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-white uppercase">Disponibilidade ({data.overallAvailability.toFixed(1)}%)</p>
                          <p className="text-[9px] text-muted-foreground">Gap vs Meta (90%): <span className={cn(data.overallAvailability >= 90 ? "text-success" : "text-destructive")}>{(data.overallAvailability - 90).toFixed(1)}%</span></p>
                        </div>
                        <div className={cn("px-1.5 py-0.5 rounded text-[8px] font-black", data.overallAvailability < 90 ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success")}>
                          {data.overallAvailability < 90 ? "PUXA PARA BAIXO" : "DENTRO DA META"}
                        </div>
                      </div>

                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-white uppercase">Performance ({data.overallPerformance.toFixed(1)}%)</p>
                          <p className="text-[9px] text-muted-foreground">Gap vs Meta (95%): <span className={cn(data.overallPerformance >= 95 ? "text-success" : "text-destructive")}>{(data.overallPerformance - 95).toFixed(1)}%</span></p>
                        </div>
                        <div className={cn("px-1.5 py-0.5 rounded text-[8px] font-black", data.overallPerformance < 95 ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success")}>
                          {data.overallPerformance < 95 ? "PUXA PARA BAIXO" : "DENTRO DA META"}
                        </div>
                      </div>

                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-white uppercase">Qualidade ({data.overallQuality.toFixed(1)}%)</p>
                          <p className="text-[9px] text-muted-foreground">Gap vs Meta (99%): <span className={cn(data.overallQuality >= 99 ? "text-success" : "text-destructive")}>{(data.overallQuality - 99).toFixed(1)}%</span></p>
                        </div>
                        <div className={cn("px-1.5 py-0.5 rounded text-[8px] font-black", data.overallQuality < 99 ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success")}>
                          {data.overallQuality < 99 ? "PUXA PARA BAIXO" : "DENTRO DA META"}
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/10 p-2 rounded border border-primary/20">
                      <p className="text-[9px] font-bold text-primary uppercase text-center">
                        {data.overallOEE < 85 
                          ? `Foco sugerido: Reduzir perdas de ${[
                              {n: 'Disponibilidade', v: data.overallAvailability, m: 90},
                              {n: 'Performance', v: data.overallPerformance, m: 95},
                              {n: 'Qualidade', v: data.overallQuality, m: 99}
                            ].sort((a,b) => (a.v - a.m) - (b.v - b.m))[0].n}`
                          : "Status: Operação de Classe Mundial"}
                      </p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {showAudit && (
          <Card className="border-indicator-info/20 bg-muted/20 animate-in slide-in-from-top-4 duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Calculator className="h-4 w-4 text-indicator-info" />
                Auditoria de Memória de Cálculo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="bg-background/50 p-4 rounded-xl border border-border/50">
                    <p className="text-[10px] font-black text-primary uppercase mb-2">Fórmula Disponibilidade</p>
                    <p className="text-xs font-mono mb-2">(Tempo Operação / Tempo Planejado) * 100</p>
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Real / Alvo</p>
                        <p className="text-sm font-bold">{data.byMachine.reduce((s, m) => s + m.actualOperatingMinutes, 0)} / {data.byMachine.reduce((s, m) => s + m.plannedProductionMinutes, 0)} min</p>
                      </div>
                      <p className="text-xl font-black text-primary">{data.overallAvailability.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-background/50 p-4 rounded-xl border border-border/50">
                    <p className="text-[10px] font-black text-indicator-info uppercase mb-2">Fórmula Performance</p>
                    <p className="text-xs font-mono mb-2">(Tempo Ideal / Tempo Real) * 100</p>
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Ideal / Real</p>
                        <p className="text-sm font-bold">{data.byMachine.reduce((s, m) => s + m.idealCycleMinutes, 0)} / {data.byMachine.reduce((s, m) => s + m.actualOperatingMinutes, 0)} min</p>
                      </div>
                      <p className="text-xl font-black text-indicator-info">{data.overallPerformance.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-background/50 p-4 rounded-xl border border-border/50">
                    <p className="text-[10px] font-black text-accent-purple uppercase mb-2">Fórmula Qualidade</p>
                    <p className="text-xs font-mono mb-2">(Peças Boas / Peças Produzidas) * 100</p>
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Boas / Total</p>
                        <p className="text-sm font-bold">{data.byMachine.reduce((s, m) => s + m.goodPieces, 0)} / {data.byMachine.reduce((s, m) => s + m.totalPiecesProduced, 0)} pcs</p>
                      </div>
                      <p className="text-xl font-black text-accent-purple">{data.overallQuality.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-black/40 rounded-xl border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary/20 text-primary border-primary/30">OEE FINAL</Badge>
                  <p className="text-xs font-medium text-muted-foreground">O OEE é o produto dos três indicadores acima (Disp x Perf x Qual)</p>
                </div>
                <p className="text-2xl font-black text-primary">{data.overallOEE.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
        )}

        {showSimulator && (
          <Card className="border-primary/20 bg-muted/20 animate-in slide-in-from-top-4 duration-300">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('oee.availability', 'Disponibilidade')}</Label>
                      <span className="text-xs font-black">{simValues.availability}%</span>
                    </div>
                    <Slider value={[simValues.availability]} max={100} step={1} onValueChange={([v]) => setSimValues({...simValues, availability: v})} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('common.performance', 'Performance')}</Label>
                      <span className="text-xs font-black">{simValues.performance}%</span>
                    </div>
                    <Slider value={[simValues.performance]} max={100} step={1} onValueChange={([v]) => setSimValues({...simValues, performance: v})} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('common.quality', 'Qualidade')}</Label>
                      <span className="text-xs font-black">{simValues.quality}%</span>
                    </div>
                    <Slider value={[simValues.quality]} max={100} step={1} onValueChange={([v]) => setSimValues({...simValues, quality: v})} />
                  </div>
                </div>

                <div className="lg:col-span-2 flex flex-col md:flex-row items-center justify-around gap-6 bg-background/50 rounded-2xl p-6 border border-border/50">
                   <div className="text-center">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-2">{t('oee.currentOEE', 'OEE Atual')}</p>
                      <p className="text-5xl font-black text-muted-foreground/50">{data.overallOEE.toFixed(1)}%</p>
                   </div>
                   <ArrowRight className="h-8 w-8 text-muted-foreground/30 hidden md:block" />
                   <div className="text-center">
                      <p className="text-xs font-bold text-primary uppercase mb-2">{t('oee.projectedOEE', 'OEE Projetado')}</p>
                      <p className="text-6xl font-black text-primary">
                        {((simValues.availability/100) * (simValues.performance/100) * (simValues.quality/100) * 100).toFixed(1)}%
                      </p>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-background/50 border border-primary/20 p-1">
            <TabsTrigger value="overview" className="gap-2 text-xs font-bold uppercase tracking-tight">
              <LayoutDashboard className="h-4 w-4" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="losses" className="gap-2 text-xs font-bold uppercase tracking-tight">
              <AlertTriangle className="h-4 w-4" /> Análise de Perdas
            </TabsTrigger>
            <TabsTrigger value="machines" className="gap-2 text-xs font-bold uppercase tracking-tight">
              <Settings2 className="h-4 w-4" /> Ranking & Eficiência
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="gap-2 text-xs font-bold uppercase tracking-tight">
              <BarChart3 className="h-4 w-4" /> Produtividade
            </TabsTrigger>
            <TabsTrigger value="shifts" className="gap-2 text-xs font-bold uppercase tracking-tight">
              <Clock className="h-4 w-4" /> Comparativo de Turnos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <OEEGaugeCard title={t('oee.generalOEE', 'OEE Geral')} value={data.overallOEE} icon={<Target className="h-4 w-4" />} benchmark={WORLD_CLASS_OEE} variant="glass" />
              <OEEGaugeCard title={t('oee.availability', 'Disponibilidade')} value={data.overallAvailability} icon={<Clock className="h-4 w-4" />} benchmark={90} variant="glass" />
              <OEEGaugeCard title={t('common.performance', 'Performance')} value={data.overallPerformance} icon={<Gauge className="h-4 w-4" />} benchmark={95} variant="glass" />
              <OEEGaugeCard title={t('common.quality', 'Qualidade')} value={data.overallQuality} icon={<CheckCircle2 className="h-4 w-4" />} benchmark={99} variant="glass" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-primary/20 bg-muted/5">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Top Ranking Máquinas (vs Meta 85%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-4">
                      {data.byMachine.slice(0, 10).map((m, idx) => {
                        const gap = m.oee - 85;
                        return (
                          <div key={m.machineId} className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-border/50 group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-muted-foreground w-4">{idx + 1}</span>
                              <div>
                                <p className="text-sm font-bold tracking-tight">{m.machineName}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">{m.techniqueName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={cn("text-sm font-black", getOEEColor(m.oee))}>{m.oee.toFixed(1)}%</p>
                              <p className={cn("text-[9px] font-bold uppercase", gap >= 0 ? "text-success" : "text-destructive")}>
                                {gap >= 0 ? `+${gap.toFixed(1)}%` : `${gap.toFixed(1)}%`}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-muted/5">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Maiores Impactos de Perda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-4">
                      {data.byMachine
                        .sort((a, b) => b.lostPieces - a.lostPieces)
                        .slice(0, 10)
                        .map((m, idx) => (
                          <div key={m.machineId} className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-border/50 group hover:border-destructive/30 transition-all">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-muted-foreground w-4">{idx + 1}</span>
                              <div>
                                <p className="text-sm font-bold tracking-tight">{m.machineName}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">{m.techniqueName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-destructive">{m.lostPieces.toLocaleString()}</p>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase">Peças Perdidas</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-success/5 border-success/10 transition-transform hover:scale-[1.02]">
                <CardContent className="pt-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-success/20">
                         <Award className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-success">{machinesAtWorldClass}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">World Class</p>
                      </div>
                   </div>
                </CardContent>
              </Card>

              <Card className="bg-destructive/5 border-destructive/10 transition-transform hover:scale-[1.02]">
                <CardContent className="pt-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-destructive/20">
                         <AlertTriangle className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-destructive">{machinesBelowTarget}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Crítico/Baixo</p>
                      </div>
                   </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/10 transition-transform hover:scale-[1.02]">
                <CardContent className="pt-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                         <Settings2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-primary">{data.byMachine.filter(m => m.totalJobs > 0).length}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Máquinas Ativas</p>
                      </div>
                   </div>
                </CardContent>
              </Card>

              <Card className="bg-indicator-info/5 border-indicator-info/10 transition-transform hover:scale-[1.02]">
                <CardContent className="pt-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indicator-info/20">
                         <BarChart3 className="h-5 w-5 text-indicator-info" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-indicator-info">{data.byTechnique.length}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Técnicas</p>
                      </div>
                   </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          <TabsContent value="losses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Suspense fallback={<ChartSkeleton />}><OEELossDrilldown filters={lossFilters} /></Suspense>
                <Suspense fallback={<ChartSkeleton />}><OEELossesChart availabilityLosses={data.availabilityLosses} performanceLosses={data.performanceLosses} qualityLosses={data.qualityLosses} overallOEE={data.overallOEE} /></Suspense>
              </div>
              <div className="space-y-6">
                <Suspense fallback={<ChartSkeleton />}><ParetoLossesChart losses={losses || []} /></Suspense>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="machines" className="space-y-6">
            <Suspense fallback={<ChartSkeleton />}>
              <OEERankingGap machines={data.byMachine} techniques={data.byTechnique} />
            </Suspense>
            <Suspense fallback={<TableSkeleton />}><OEEMachineTable machines={data.byMachine} /></Suspense>
            <Suspense fallback={<ChartSkeleton />}><OEETechniqueComparison techniques={data.byTechnique} worldClassBenchmark={data.worldClassBenchmark} /></Suspense>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-6">
            <Suspense fallback={<ChartSkeleton />}><OEETrendChart data={data.trendData} worldClassBenchmark={data.worldClassBenchmark} comparison={data.comparison} /></Suspense>
            <Suspense fallback={<ChartSkeleton />}><OEEHeatmap data={data.heatmapData} /></Suspense>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-success/5 border-success/20"><CardContent className="pt-6"><h3 className="font-bold">Resíduos Evitados</h3><p className="text-3xl font-black text-success">{(data.overallQuality * 100).toFixed(0)} kg</p></CardContent></Card>
              <Card className="bg-indicator-info/5 border-indicator-info/20"><CardContent className="pt-6"><h3 className="font-bold">Otimização</h3><p className="text-3xl font-black text-indicator-info">{(data.overallPerformance * 1.2).toFixed(1)}%</p></CardContent></Card>
              <Card className="bg-warning/5 border-warning/20"><CardContent className="pt-6"><h3 className="font-bold">Eficiência Energética</h3><p className="text-3xl font-black text-warning">{(data.overallAvailability * 0.9).toFixed(1)}%</p></CardContent></Card>
            </div>
          </TabsContent>
          
          <TabsContent value="shifts" className="space-y-6">
            <Suspense fallback={<ChartSkeleton />}>
              <OEEShiftComparison shifts={data.byShift || []} />
            </Suspense>
          </TabsContent>
        </Tabs>

        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Benchmarks de OEE na Indústria</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-muted-foreground">
                  <div><span className="text-indicator-success font-medium">≥85%</span> World Class</div>
                  <div><span className="text-success font-medium">75-84%</span> Excelente</div>
                  <div><span className="text-indicator-warning font-medium">65-74%</span> Bom</div>
                  <div><span className="text-priority-high font-medium">50-64%</span> Aceitável</div>
                  <div><span className="text-primary font-medium">&lt;50%</span> Crítico</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
});

export default OEEDashboard;
