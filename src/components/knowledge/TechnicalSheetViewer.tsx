import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Edit, Clock, Wrench, ListOrdered, Package, Lightbulb,
  AlertTriangle, Info, CheckCircle2, FileDown, Copy,
  QrCode, Zap, Droplets, MoveHorizontal, Thermometer,
  CheckSquare, History, ShieldCheck, Activity, Settings2, Beaker
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
  const [showQR, setShowQR] = useState(false);

  const handleExportPDF = async () => {
    if (!sheet) return;
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(30, 30, 30);
      doc.text('FICHA TÉCNICA DE PRODUÇÃO', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`v${sheet.version || 1} • EMITIDO EM: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 28, { align: 'center' });

      // Basic Info
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('1. INFORMAÇÕES GERAIS', 15, 45);
      doc.setFontSize(11);
      doc.text(`TÍTULO: ${sheet.title}`, 15, 55);
      doc.text(`TÉCNICA: ${sheet.techniques?.name || '---'}`, 15, 62);
      doc.text(`CATEGORIA: ${sheet.product_categories?.name || '---'}`, 15, 69);
      doc.text(`MÁQUINA RECOMENDADA: ${sheet.machines?.name || '---'}`, 15, 76);
      doc.text(`TEMPO ESTIMADO: ${sheet.estimated_time_minutes} min`, 15, 83);

      // Regulation
      doc.setFontSize(14);
      doc.text('2. PARÂMETROS DE REGULAGEM', 15, 100);
      const settings = (sheet.machine_settings as any) || {};
      const ranges = (sheet.settings_ranges as any) || {};
      
      doc.setFontSize(10);
      let y = 110;
      const fields = [
        { label: 'PASSADAS RODO', key: 'squeegee_passes' },
        { label: 'PRESSÃO', key: 'pressure' },
        { label: 'VELOCIDADE', key: 'speed' },
        { label: 'TEMPERATURA', key: 'temperature' }
      ];

      fields.forEach(f => {
        const val = settings[f.key] || '---';
        const range = ranges[f.key] ? `(Faixa: ${ranges[f.key].min || '0'} - ${ranges[f.key].max || '∞'})` : '';
        doc.text(`${f.label}: ${val} ${range}`, 20, y);
        y += 7;
      });

      // Consumables
      doc.setFontSize(14);
      doc.text('3. INSUMOS E CONSUMÍVEIS', 15, y + 10);
      y += 20;
      const consumables = (sheet.consumables as any[]) || [];
      if (consumables.length > 0) {
        consumables.forEach(c => {
          doc.text(`• ${c.name} - Qtd: ${c.quantity}${c.alternative ? ` (Alt: ${c.alternative})` : ''}`, 20, y);
          y += 7;
        });
      } else {
        doc.text('Nenhum insumo específico listado.', 20, y);
        y += 7;
      }

      // Steps
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.text('4. PASSOS DE PREPARAÇÃO / SETUP', 15, y + 10);
      y += 20;
      doc.setFontSize(10);
      const setupLines = doc.splitTextToSize(sheet.setup_instructions || 'Nenhuma instrução de setup fornecida.', 170);
      doc.text(setupLines, 20, y);
      y += setupLines.length * 5 + 5;

      // Quality
      doc.setFontSize(14);
      doc.text('5. CRITÉRIOS DE QUALIDADE', 15, y + 10);
      y += 20;
      const quality = (sheet.quality_checklist as any[]) || [];
      if (quality.length > 0) {
        quality.forEach(q => {
          doc.text(`[ ] ${q.description}${q.required ? ' (OBRIGATÓRIO)' : ''}`, 20, y);
          y += 7;
        });
      }

      doc.save(`ficha-tecnica-${sheet.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      toast.success('Ficha Técnica exportada com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar PDF');
    }
  };

  if (isLoading) return null;
  if (!sheet) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in slide-in-from-right-4 duration-700 relative">
      <Card className="flex-1 flex flex-col border-border/40 bg-card/40 backdrop-blur-md shadow-2xl rounded-[2.5rem] overflow-hidden ring-1 ring-white/5">
        <CardHeader className="p-8 pb-6 border-b border-border/20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="h-7 px-3 rounded-lg border font-black uppercase tracking-widest text-[10px] bg-primary/10 text-primary border-primary/20 shadow-glow-primary/10">
                  VERSION {sheet.version || '1'}
                </Badge>
                {sheet.techniques && (
                  <Badge variant="outline" className="h-7 border-primary/20 bg-primary/5 text-[10px] font-black tracking-widest uppercase">
                    {sheet.techniques.name}
                  </Badge>
                )}
                {sheet.product_categories && (
                  <Badge variant="secondary" className="h-7 bg-muted/50 text-[10px] font-bold uppercase">
                    {sheet.product_categories.name}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-4xl font-black font-display tracking-tight text-foreground/90 uppercase leading-none">
                {sheet.title}
              </CardTitle>
              {sheet.description && (
                <p className="text-muted-foreground text-sm font-medium italic line-clamp-2 max-w-2xl">
                  {sheet.description}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => setShowQR(!showQR)}>
                <QrCode className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 font-bold uppercase tracking-widest text-[10px] border-primary/20 hover:bg-primary/5" onClick={handleExportPDF}>
                <FileDown className="h-4 w-4 mr-2" /> PDF
              </Button>
              {onEdit && (
                <Button size="sm" className="rounded-xl h-10 px-4 font-bold uppercase tracking-widest text-[10px] gradient-primary shadow-glow-primary/20" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-hidden flex-1">
          <ScrollArea className="h-full">
            <div className="p-8 space-y-12">
              {/* Stats & Key Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-[2rem] bg-background/40 border border-border/20 shadow-sm">
                  <div className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Cycle Time</div>
                  <div className="text-2xl font-black flex items-baseline gap-1">
                    {sheet.estimated_time_minutes} <span className="text-sm font-bold text-muted-foreground">MIN</span>
                  </div>
                </div>
                <div className="p-6 rounded-[2rem] bg-background/40 border border-border/20 shadow-sm">
                  <div className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Workstation</div>
                  <div className="text-xl font-black truncate">{sheet.machines?.name || 'Standard'}</div>
                </div>
                <div className="p-6 rounded-[2rem] bg-background/40 border border-border/20 shadow-sm">
                  <div className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Material</div>
                  <div className="text-xl font-black truncate">{sheet.materials?.name || 'All'}</div>
                </div>
                <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 shadow-glow-primary/5">
                  <div className="text-[10px] font-black uppercase text-primary mb-1 tracking-widest">Security</div>
                  <div className="text-xl font-black text-primary flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" /> VALID
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Parameters Section */}
                <section className="space-y-6">
                  <h3 className="text-lg font-black font-display uppercase tracking-widest flex items-center gap-2 border-l-4 border-primary pl-4">
                    <Settings2 className="h-5 w-5 text-primary" /> Technical Parameters
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Squeegee Passes', key: 'squeegee_passes', icon: Activity },
                      { label: 'Pressure', key: 'pressure', icon: Zap },
                      { label: 'Speed', key: 'speed', icon: MoveHorizontal },
                      { label: 'Temperature', key: 'temperature', icon: Thermometer },
                    ].map((param) => {
                      const val = (sheet.machine_settings as any)?.[param.key];
                      const range = (sheet.settings_ranges as any)?.[param.key];
                      return (
                        <div key={param.key} className="p-5 rounded-2xl bg-card border border-border/20 shadow-sm space-y-3">
                          <div className="flex items-center justify-between">
                            <param.icon className="h-4 w-4 text-primary opacity-60" />
                            <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{param.label}</div>
                          </div>
                          <div className="text-2xl font-black">{val || '---'}</div>
                          {range && (range.min || range.max) && (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-primary/60 uppercase">
                              <Info className="h-3 w-3" />
                              Range: {range.min || '0'} - {range.max || '∞'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="p-5 rounded-2xl bg-muted/30 border border-border/20 space-y-2">
                      <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Ink & Chemicals</div>
                      <div className="text-sm font-bold">{sheet.ink_specifications || 'Standard ink specification'}</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-muted/30 border border-border/20 space-y-2">
                      <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tooling & Matrix</div>
                      <div className="text-sm font-bold">{sheet.tooling_specifications || 'Standard tooling required'}</div>
                    </div>
                  </div>
                </section>

                {/* Setup & Preparation */}
                <section className="space-y-6">
                  <h3 className="text-lg font-black font-display uppercase tracking-widest flex items-center gap-2 border-l-4 border-amber-500 pl-4">
                    <Wrench className="h-5 w-5 text-amber-500" /> Setup Instructions
                  </h3>
                  <div className="p-6 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 space-y-4">
                    <div className="text-sm font-medium leading-relaxed text-foreground/80 whitespace-pre-line">
                      {sheet.setup_instructions || 'Please follow standard workstation preparation protocols.'}
                    </div>
                    {(sheet.gap_specifications || sheet.challenges_notes) && (
                      <div className="pt-4 border-t border-amber-500/10 space-y-3">
                        {sheet.gap_specifications && (
                          <div className="flex items-start gap-2 text-xs">
                            <Badge variant="outline" className="text-[9px] h-5 border-amber-500/30 text-amber-600">GAPS</Badge>
                            <span className="font-bold">{sheet.gap_specifications}</span>
                          </div>
                        )}
                        {sheet.challenges_notes && (
                          <div className="flex items-start gap-2 text-xs">
                            <Badge variant="outline" className="text-[9px] h-5 border-amber-500/30 text-amber-600">RISKS</Badge>
                            <span className="font-bold">{sheet.challenges_notes}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Failure Scenarios */}
                  {sheet.failure_scenarios && (
                    <div className="p-6 rounded-[2.5rem] bg-destructive/5 border border-destructive/10 space-y-3">
                      <h4 className="text-[10px] font-black uppercase text-destructive tracking-widest flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Potential Failures & Mitigations
                      </h4>
                      <div className="text-sm font-medium text-destructive/80 italic">
                        {sheet.failure_scenarios}
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <Separator className="opacity-20" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Steps Section */}
                <section className="space-y-6">
                  <h3 className="text-lg font-black font-display uppercase tracking-widest flex items-center gap-2 border-l-4 border-primary pl-4">
                    <ListOrdered className="h-5 w-5 text-primary" /> Execution Workflow
                  </h3>
                  <div className="space-y-4">
                    {steps.length === 0 ? (
                      <div className="text-center p-8 border border-dashed rounded-3xl opacity-50 italic text-sm">No workflow steps defined.</div>
                    ) : (
                      steps.map((step, idx) => (
                        <div key={step.id} className="group p-6 rounded-[2rem] bg-card border border-border/20 flex gap-5 transition-all hover:border-primary/30 hover:shadow-lg">
                          <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-xl group-hover:scale-110 transition-transform">
                            {idx + 1}
                          </div>
                          <div className="space-y-1">
                            <div className="font-black uppercase tracking-tight text-sm">{step.title}</div>
                            <div className="text-sm text-muted-foreground font-medium leading-relaxed">{step.description}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Quality Checklist */}
                <section className="space-y-6">
                  <h3 className="text-lg font-black font-display uppercase tracking-widest flex items-center gap-2 border-l-4 border-emerald-500 pl-4">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" /> Quality Assurance
                  </h3>
                  <div className="space-y-4">
                    {(sheet.quality_checklist as any[])?.length === 0 ? (
                      <div className="text-center p-8 border border-dashed rounded-3xl opacity-50 italic text-sm">No quality criteria defined.</div>
                    ) : (
                      (sheet.quality_checklist as any[])?.map((item, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                          <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="flex-1 text-sm font-bold uppercase tracking-tight">{item.description}</div>
                          {item.required && (
                            <Badge className="bg-emerald-600 text-[8px] font-black tracking-widest uppercase">Required</Badge>
                          )}
                        </div>
                      ))
                    )}
                    {sheet.quality_requirements && (
                      <div className="p-5 rounded-2xl bg-muted/30 border border-border/20 text-xs font-medium italic opacity-70">
                        Note: {sheet.quality_requirements}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <aside className="w-full lg:w-[380px] flex flex-col gap-8 shrink-0">
        {/* Consumables Card */}
        <Card className="p-8 rounded-[2.5rem] bg-card/40 border-border/40 backdrop-blur-md shadow-xl flex flex-col">
          <CardTitle className="text-lg font-black uppercase tracking-widest mb-8 flex items-center gap-2 border-b border-border/20 pb-4">
            <Beaker className="h-5 w-5 text-primary" /> Required Supplies
          </CardTitle>
          <div className="space-y-4 flex-1">
            {(sheet.consumables as any[])?.length === 0 ? (
              <div className="text-center p-6 border border-dashed rounded-2xl opacity-50 italic text-[10px] uppercase">No supplies listed.</div>
            ) : (
              (sheet.consumables as any[])?.map((c, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-background/50 border border-border/20 flex flex-col gap-2 transition-all hover:ring-1 hover:ring-primary/30">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs uppercase tracking-tight">{c.name}</span>
                    <Badge variant="secondary" className="font-black text-[10px]">{c.quantity}</Badge>
                  </div>
                  {c.alternative && (
                    <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mt-1">
                      <MoveHorizontal className="h-3 w-3" /> ALT: {c.alternative}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Tips Section */}
        <Card className="p-8 rounded-[2.5rem] bg-primary/5 border-primary/20 shadow-glow-primary/5">
          <CardTitle className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" /> Pro Tips
          </CardTitle>
          <div className="space-y-4">
            {tips.length === 0 ? (
              <div className="text-xs opacity-50 italic">No expert tips available for this protocol.</div>
            ) : (
              tips.map(tip => (
                <div key={tip.id} className="p-4 rounded-xl bg-background/40 border border-primary/10 text-xs font-medium leading-relaxed italic border-l-4 border-l-primary">
                  "{tip.content}"
                </div>
              ))
            )}
          </div>
        </Card>
      </aside>

      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in zoom-in-95" onClick={() => setShowQR(false)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <KnowledgeSheetQRCode sheetId={sheetId} title={sheet.title} />
          </div>
        </div>
      )}
    </div>
  );
};