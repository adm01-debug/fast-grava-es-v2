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
  Edit, Clock, Wrench, ListOrdered, Package, Lightbulb,
  AlertTriangle, Info, CheckCircle2, FileDown, Copy,
  QrCode, Zap, Droplets, MoveHorizontal, Thermometer,
  CheckSquare, History, ShieldCheck, Activity, Settings2
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

  const progress = steps.length > 0 ? Math.round((completedSteps.size / steps.length) * 100) : 0;

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
      doc.setFontSize(22);
      doc.text('ORDEM DE SERVIÇO TÉCNICA', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`DATA: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 15, 30);
      doc.text(`TÍTULO: ${sheet.title}`, 15, 40);
      doc.save(`os-${sheet.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      toast.success('PDF exportado!');
    } catch {
      toast.error('Erro ao gerar PDF');
    }
  };

  if (isLoading) return null;
  if (!sheet) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in slide-in-from-right-4 duration-700 relative">
      <Card className="flex-1 flex flex-col border-border/40 bg-card/40 backdrop-blur-md shadow-2xl rounded-[2.5rem] overflow-hidden ring-1 ring-white/5">
        <CardHeader className="p-8 pb-6 border-b border-border/20">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="h-7 px-3 rounded-lg border font-black uppercase tracking-widest text-[10px] bg-primary/10 text-primary border-primary/20">
                  v{sheet.version || '1'}
                </Badge>
                {sheet.techniques && <Badge variant="outline" className="h-7">{sheet.techniques.short_name}</Badge>}
              </div>
              <CardTitle className="text-3xl font-black font-display tracking-tight text-foreground/90 uppercase">{sheet.title}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowQR(!showQR)}><QrCode /></Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}><FileDown className="mr-2" /> PDF</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden flex-1">
          <ScrollArea className="h-full">
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-[2rem] bg-background/40 border border-border/20">
                  <div className="text-[10px] font-black uppercase text-muted-foreground">Cycle Time</div>
                  <div className="text-2xl font-black">{sheet.estimated_time_minutes} min</div>
                </div>
                <div className="p-6 rounded-[2rem] bg-background/40 border border-border/20">
                  <div className="text-[10px] font-black uppercase text-muted-foreground">Workstation</div>
                  <div className="text-2xl font-black truncate">{sheet.machines?.name || '---'}</div>
                </div>
              </div>
              
              <section className="space-y-6">
                <h3 className="text-lg font-black font-display uppercase tracking-widest flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" /> Parameters
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {(sheet.machine_settings as any) && Object.entries(sheet.machine_settings as any).map(([k, v]: [string, any]) => (
                    <div key={k} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <div className="text-[10px] uppercase font-bold text-amber-600/70">{k}</div>
                      <div className="text-lg font-bold">{v}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-lg font-black font-display uppercase tracking-widest flex items-center gap-2">
                  <ListOrdered className="h-5 w-5 text-primary" /> Steps
                </h3>
                {steps.map((step, idx) => (
                  <div key={step.id} className="p-6 rounded-2xl bg-card/50 border border-border/20 flex gap-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">{idx + 1}</div>
                    <div className="flex-1">
                      <div className="font-bold">{step.title}</div>
                      <div className="text-sm text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <aside className="w-[380px] space-y-8">
        <Card className="p-8 rounded-[2.5rem] bg-card/40 border-border/40">
          <CardTitle className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <Droplets className="h-5 w-5 text-primary" /> Material Matrix
          </CardTitle>
          <div className="space-y-4">
            {sheetMaterials.map(m => (
              <div key={m.id} className="p-4 rounded-xl bg-background/50 border border-border/20 flex justify-between">
                <span className="font-bold text-sm">{m.name}</span>
                <Badge variant="secondary">{m.quantity}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </aside>

      {showQR && (
        <div className="absolute top-24 right-8 z-50">
          <KnowledgeSheetQRCode sheetId={sheetId} title={sheet.title} />
        </div>
      )}
    </div>
  );
};