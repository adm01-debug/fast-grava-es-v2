import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Edit, Clock, Wrench, ListOrdered, Package, Lightbulb,
  AlertTriangle, Info, CheckCircle2, FileDown, Copy,
  QrCode, Maximize2, Zap, Droplets, MoveHorizontal, Thermometer,
  CheckSquare, History, ShieldCheck, ChevronRight, Activity, Settings2
} from 'lucide-react';
import { useTechnicalSheetDetails } from '@/hooks/useTechnicalSheets';
import { KnowledgeSheetQRCode } from './KnowledgeSheetQRCode';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TechnicalSheetViewerProps {
  sheetId: string;
  onEdit?: () => void;
  onDuplicate?: () => void;
}

export const TechnicalSheetViewer = ({ sheetId, onEdit, onDuplicate }: TechnicalSheetViewerProps) => {
  const { sheet, steps, sheetMaterials, tips, isLoading } = useTechnicalSheetDetails(sheetId);
  const [checklistMode, setChecklistMode] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showQR, setShowQR] = useState(false);

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  const handleExportPDF = async () => {
    if (!sheet) return;
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      let y = 20;

      // Header: Technical Service Order Style
      doc.setFillColor(240, 240, 240);
      doc.rect(10, 10, 190, 40, 'F');
      doc.setFontSize(22);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('ORDEM DE SERVIÇO TÉCNICA', 105, 25, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`DATA: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 15, 35);
      doc.text(`VERSÃO DA FICHA: v${sheet.version || '1'}`, 15, 42);
      doc.text(`PROTOCOLO ID: ${sheet.id.slice(0, 8).toUpperCase()}`, 130, 35);
      
      y = 60;

      // Product & Technique Info
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('1. ESPECIFICAÇÕES DO PRODUTO', 14, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`TÍTULO: ${sheet.title}`, 14, y);
      y += 6;
      if (sheet.techniques) {
        doc.text(`TÉCNICA DE PERSONALIZAÇÃO: ${sheet.techniques.name}`, 14, y);
        y += 6;
      }
      if (sheet.product_categories) {
        doc.text(`CATEGORIA: ${sheet.product_categories.name}`, 14, y);
        y += 6;
      }
      if (sheet.materials) {
        doc.text(`MATERIAL BASE: ${sheet.materials.name}`, 14, y);
        y += 6;
      }
      y += 10;

      // Machine & Setup
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('2. CONFIGURAÇÃO DA MÁQUINA (SETUP)', 14, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      if (sheet.machines) {
        doc.text(`MÁQUINA RECOMENDADA: ${sheet.machines.name} (${sheet.machines.code})`, 14, y);
        y += 6;
      }
      
      // Machine Parameters Table
      const settings = (sheet.machine_settings as any) || {};
      const ranges = (sheet.settings_ranges as any) || {};
      
      doc.rect(14, y, 180, 25);
      doc.line(14, y + 8, 194, y + 8);
      doc.setFont('helvetica', 'bold');
      doc.text('PARÂMETRO', 16, y + 5);
      doc.text('VALOR NOMINAL', 70, y + 5);
      doc.text('FAIXA RECOMENDADA', 130, y + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Passadas', 16, y + 13);
      doc.text(settings.squeegee_passes || '-', 70, y + 13);
      doc.text(`${ranges.squeegee_passes?.min || '-'} a ${ranges.squeegee_passes?.max || '-'}`, 130, y + 13);
      
      doc.text('Pressão', 16, y + 18);
      doc.text(settings.pressure || '-', 70, y + 18);
      doc.text(`${ranges.pressure?.min || '-'} a ${ranges.pressure?.max || '-'}`, 130, y + 18);

      doc.text('Temperatura', 16, y + 23);
      doc.text(settings.temperature || '-', 70, y + 23);
      doc.text(`${ranges.temperature?.min || '-'} a ${ranges.temperature?.max || '-'}`, 130, y + 23);
      
      y += 35;

      // Insumos
      if (sheetMaterials.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('3. INSUMOS E CONSUMÍVEIS', 14, y);
        y += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        sheetMaterials.forEach(m => {
          doc.text(`• ${m.name}: ${m.quantity || 'N/A'} [ ] Confirmado`, 18, y);
          y += 6;
          if (y > 270) { doc.addPage(); y = 20; }
        });
        y += 10;
      }

      // Quality Checklist
      if (sheet.quality_checklist && sheet.quality_checklist.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('4. CHECKLIST DE QUALIDADE', 14, y);
        y += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        sheet.quality_checklist.forEach((item: any) => {
          doc.text(`[ ] ${item.description}${item.required ? ' (OBRIGATÓRIO)' : ''}`, 18, y);
          y += 6;
          if (y > 270) { doc.addPage(); y = 20; }
        });
        y += 10;
      }

      // Footer Signatures
      if (y > 240) { doc.addPage(); y = 20; }
      y = 260;
      doc.line(14, y, 90, y);
      doc.text('Assinatura do Operador', 14, y + 5);
      doc.line(110, y, 194, y);
      doc.text('Assinatura do Coordenador', 110, y + 5);

      doc.save(`OS_TECNICA_${sheet.title.replace(/\s+/g, '_').toUpperCase()}_v${sheet.version || 1}.pdf`);
      toast.success('PDF exportado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar PDF');
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/40 bg-card/20 backdrop-blur-sm h-full flex items-center justify-center rounded-[2.5rem]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Initializing Protocol Viewer...</p>
        </div>
      </Card>
    );
  }

  if (!sheet) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Main Content Area */}
      <Card className="flex-1 flex flex-col border-border/40 bg-card/40 backdrop-blur-md shadow-2xl rounded-[2.5rem] overflow-hidden ring-1 ring-white/5">
        <CardHeader className="p-8 pb-6 border-b border-border/20">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {sheet.techniques && (
                  <Badge
                    style={{ backgroundColor: `${sheet.techniques.color}20`, color: sheet.techniques.color, borderColor: `${sheet.techniques.color}40` }}
                    className="h-7 px-3 rounded-lg border font-black uppercase tracking-widest text-[10px]"
                  >
                    {sheet.techniques.short_name}
                  </Badge>
                )}
                {sheet.product_categories && (
                  <Badge variant="outline" className="h-7 px-3 rounded-lg border-border/40 bg-background/50 text-[10px] font-bold uppercase tracking-wider">
                    {sheet.product_categories.name}
                  </Badge>
                )}
                <Badge className="h-7 px-3 rounded-lg bg-primary/10 text-primary border-primary/20 text-[10px] font-black tracking-widest uppercase">
                  v{sheet.version || '1'}
                </Badge>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black font-display tracking-tight text-foreground/90 uppercase">{sheet.title}</CardTitle>
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-60">
                  <span className="flex items-center gap-1.5"><History className="h-3.5 w-3.5" /> Updated {format(new Date(sheet.updated_at), "MMM d, yyyy")}</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Certified Protocol</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex bg-muted/20 p-1.5 rounded-2xl border border-border/20 shadow-inner">
                {onDuplicate && (
                  <Button variant="ghost" size="icon" onClick={onDuplicate} className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                    <Copy className="h-4.5 w-4.5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setShowQR(!showQR)} className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                  <QrCode className="h-4.5 w-4.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleExportPDF} className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                  <FileDown className="h-4.5 w-4.5" />
                </Button>
                {onEdit && (
                  <Button variant="ghost" size="icon" onClick={onEdit} className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                    <Edit className="h-4.5 w-4.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 bg-gradient-to-b from-transparent to-primary/[0.02]">
          <ScrollArea className="h-full">
            <div className="p-10 space-y-12 pb-20">
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-[2rem] bg-background/40 border border-border/20 backdrop-blur-sm group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Cycle Time</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-display tracking-tight text-foreground/80">{sheet.estimated_time_minutes || '0'}</span>
                    <span className="text-xs font-bold text-muted-foreground uppercase">min</span>
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-background/40 border border-border/20 backdrop-blur-sm group hover:border-amber-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Workstation</span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-bold font-display tracking-tight text-foreground/80 truncate">
                      {sheet.machines?.name || 'Any'}
                    </p>
                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{sheet.machines?.code || 'GLB-00'}</p>
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-background/40 border border-border/20 backdrop-blur-sm group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <CheckSquare className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Quality Pts</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-display tracking-tight text-foreground/80">{sheet.quality_checklist?.length || '0'}</span>
                    <span className="text-xs font-bold text-muted-foreground uppercase">Criteria</span>
                  </div>
                </div>
              </div>

              {/* Main Specification Tabs/Sections */}
              <div className="space-y-12">
                {/* Machine Parameters */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-amber-500 rounded-full shadow-glow-amber/50" />
                    <h3 className="text-lg font-black font-display uppercase tracking-widest text-foreground/80 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-500" />
                      Critical Regulation Parameters
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                      { id: 'squeegee_passes', label: 'Passes', icon: MoveHorizontal },
                      { id: 'pressure', label: 'Pressure', icon: Zap },
                      { id: 'speed', label: 'Speed', icon: Activity },
                      { id: 'temperature', label: 'Temp', icon: Thermometer },
                    ].map((param) => {
                      const value = (sheet.machine_settings as any)?.[param.id];
                      const range = (sheet.settings_ranges as any)?.[param.id];
                      if (!value && !range) return null;
                      return (
                        <div key={param.id} className="p-6 rounded-[2.5rem] bg-amber-500/[0.03] border border-amber-500/10 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <param.icon className="h-12 w-12" />
                          </div>
                          <div className="space-y-1 relative z-10">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-amber-600/60 mb-2 block">{param.label}</Label>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-3xl font-black font-display tracking-tight text-amber-600/90">{value || '--'}</span>
                            </div>
                            {range && (range.min || range.max) && (
                              <div className="pt-3 mt-3 border-t border-amber-500/10 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-amber-600/40 uppercase">Range:</span>
                                <span className="text-[10px] font-black text-amber-600/80 tracking-widest">{range.min || '0'} – {range.max || '∞'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Setup Instructions */}
                {sheet.setup_instructions && (
                  <section className="space-y-6 animate-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-1 bg-blue-500 rounded-full shadow-glow-blue/50" />
                      <h3 className="text-lg font-black font-display uppercase tracking-widest text-foreground/80 flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-blue-500" />
                        Setup & Preparation Guide
                      </h3>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-blue-500/[0.03] border border-blue-500/10 text-sm font-medium leading-relaxed text-blue-900/70 whitespace-pre-wrap backdrop-blur-sm">
                      {sheet.setup_instructions}
                    </div>
                  </section>
                )}

                {/* Steps & Checklist */}
                <section className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-1 bg-primary rounded-full shadow-glow-primary/50" />
                      <h3 className="text-lg font-black font-display uppercase tracking-widest text-foreground/80 flex items-center gap-2">
                        <ListOrdered className="h-5 w-5 text-primary" />
                        Execution Workflow
                      </h3>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setChecklistMode(!checklistMode)}
                      className={cn(
                        "rounded-full h-10 px-6 font-black uppercase tracking-widest text-[10px] transition-all",
                        checklistMode ? "bg-primary text-primary-foreground border-transparent shadow-glow-primary/20" : "hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      {checklistMode ? `PROGRESS: ${progress}%` : 'ACTIVATE WORKFLOW'}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {steps.map((step, idx) => (
                      <div 
                        key={step.id} 
                        className={cn(
                          "relative group rounded-[2.5rem] transition-all duration-500 overflow-hidden border",
                          completedSteps.has(step.id) 
                            ? "bg-emerald-500/[0.02] border-emerald-500/20 opacity-60" 
                            : "bg-background/40 border-border/20 hover:border-primary/30"
                        )}
                      >
                        <div className="flex items-start gap-6 p-8">
                          <div className="flex flex-col items-center gap-4">
                            <div className={cn(
                              "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-500",
                              completedSteps.has(step.id) 
                                ? "bg-emerald-500 text-white shadow-glow-emerald/20" 
                                : "bg-primary/10 text-primary border border-primary/20"
                            )}>
                              {idx + 1}
                            </div>
                            {checklistMode && (
                              <Checkbox 
                                checked={completedSteps.has(step.id)}
                                onCheckedChange={() => toggleStep(step.id)}
                                className="h-6 w-6 rounded-lg border-2"
                              />
                            )}
                          </div>
                          
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xl font-black font-display tracking-tight uppercase text-foreground/80">{step.title}</h4>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">PHASE {idx + 1}</Badge>
                              </div>
                            </div>
                            <p className="text-sm font-medium leading-relaxed text-muted-foreground/80">
                              {step.description}
                            </p>
                            
                            {(step.tips || step.warnings) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                {step.tips && (
                                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 text-primary/80 border border-primary/10">
                                    <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs font-bold leading-tight uppercase tracking-wider">{step.tips}</p>
                                  </div>
                                )}
                                {step.warnings && (
                                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/5 text-rose-500/80 border border-rose-500/10">
                                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs font-bold leading-tight uppercase tracking-wider">{step.warnings}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Sidebar: Technical Intel */}
      <aside className="w-full lg:w-[380px] space-y-8 flex-shrink-0 animate-in fade-in slide-in-from-right-8 duration-1000">
        {/* Insumos Card */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-[2.5rem] overflow-hidden ring-1 ring-white/5">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-black font-display uppercase tracking-widest text-primary">
              <Droplets className="h-5 w-5" />
              Material Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            <div className="space-y-4">
              {sheet.ink_specifications && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Fluid Specs</Label>
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-sm font-bold text-primary/80 italic">
                    {sheet.ink_specifications}
                  </div>
                </div>
              )}
              {sheet.tooling_specifications && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Tooling Specs</Label>
                  <div className="p-4 rounded-2xl bg-muted/20 border border-border/20 text-sm font-bold text-muted-foreground italic">
                    {sheet.tooling_specifications}
                  </div>
                </div>
              )}
            </div>

            {sheetMaterials.length > 0 && (
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 block mb-2">Consumables List</Label>
                <div className="space-y-3">
                  {sheetMaterials.map((m) => (
                    <div key={m.id} className="group p-4 rounded-2xl bg-background/30 border border-border/10 hover:border-primary/20 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black uppercase tracking-tight text-foreground/80">{m.name}</span>
                        <Badge variant="outline" className="text-[8px] font-black">{m.quantity}</Badge>
                      </div>
                      {m.specification && <p className="text-[10px] font-bold text-muted-foreground/60 leading-none">{m.specification}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quality Matrix */}
        {sheet.quality_checklist && sheet.quality_checklist.length > 0 && (
          <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-xl rounded-[2.5rem] overflow-hidden ring-1 ring-white/5 border-l-4 border-l-emerald-500/50">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-black font-display uppercase tracking-widest text-emerald-500">
                <ShieldCheck className="h-5 w-5" />
                Quality Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-3">
                {sheet.quality_checklist.map((item: any) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold leading-tight uppercase tracking-tight text-emerald-900/70">{item.description}</p>
                      {item.required && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 text-[8px] font-black h-4 px-1.5 border-none uppercase tracking-tighter">Required</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Knowledge Tips */}
        {tips.length > 0 && (
          <div className="space-y-4">
            <h4 className="px-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">Base Intelligence</h4>
            <div className="space-y-4 px-2">
              {tips.map((tip) => (
                <div key={tip.id} className={cn(
                  "p-6 rounded-[2.5rem] border backdrop-blur-md transition-all",
                  tip.tip_type === 'warning' ? "bg-rose-500/5 border-rose-500/10" : 
                  tip.tip_type === 'important' ? "bg-blue-500/5 border-blue-500/10" : "bg-primary/5 border-primary/10"
                )}>
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-2 rounded-xl",
                      tip.tip_type === 'warning' ? "text-rose-500 bg-rose-500/10" : 
                      tip.tip_type === 'important' ? "text-blue-500 bg-blue-500/10" : "text-primary bg-primary/10"
                    )}>
                      {tip.tip_type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
                    </div>
                    <p className="text-xs font-bold leading-relaxed tracking-wide text-foreground/70 uppercase">
                      {tip.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {showQR && (
        <div className="absolute top-24 right-8 z-50 animate-in fade-in zoom-in-95 shadow-2xl rounded-3xl overflow-hidden ring-4 ring-primary/20">
          <KnowledgeSheetQRCode 
            sheetId={sheetId}
            title={sheet.title}
          />
        </div>
      )}
    </div>
  );
};
