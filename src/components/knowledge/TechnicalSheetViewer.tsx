import { useState, useMemo } from 'react';
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
  QrCode, Maximize2, Zap, Droplets, MoveHorizontal, Thermometer
} from 'lucide-react';
import { useTechnicalSheetDetails } from '@/hooks/useTechnicalSheets';
import { KnowledgeSheetQRCode } from './KnowledgeSheetQRCode';
import { toast } from 'sonner';

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

      doc.setFontSize(18);
      doc.text(sheet.title, 14, y);
      y += 10;

      if (sheet.description) {
        doc.setFontSize(10);
        const descLines = doc.splitTextToSize(sheet.description, 180);
        doc.text(descLines, 14, y);
        y += descLines.length * 5 + 5;
      }

      if (sheet.techniques) {
        doc.setFontSize(9);
        doc.text(`Técnica: ${sheet.techniques.name}`, 14, y);
        y += 6;
      }
      if (sheet.machines) {
        doc.text(`Máquina: ${sheet.machines.name} (${sheet.machines.code})`, 14, y);
        y += 6;
      }
      if (sheet.estimated_time_minutes) {
        doc.text(`Tempo estimado: ${sheet.estimated_time_minutes} minutos`, 14, y);
        y += 10;
      }

      if (sheetMaterials.length > 0) {
        doc.setFontSize(12);
        doc.text('Materiais e Insumos', 14, y);
        y += 7;
        doc.setFontSize(9);
        sheetMaterials.forEach(m => {
          doc.text(`• ${m.name}${m.quantity ? ` (${m.quantity})` : ''}${m.specification ? ` - ${m.specification}` : ''}`, 18, y);
          y += 5;
          if (y > 270) { doc.addPage(); y = 20; }
        });
        y += 5;
      }

      if (steps.length > 0) {
        doc.setFontSize(12);
        doc.text('Passo a Passo', 14, y);
        y += 7;
        steps.forEach(step => {
          if (y > 250) { doc.addPage(); y = 20; }
          doc.setFontSize(10);
          doc.text(`${step.step_number}. ${step.title}`, 14, y);
          y += 6;
          doc.setFontSize(9);
          const stepLines = doc.splitTextToSize(step.description, 170);
          doc.text(stepLines, 18, y);
          y += stepLines.length * 5 + 3;
          if (step.tips) {
            doc.text(`💡 ${step.tips}`, 18, y);
            y += 5;
          }
          if (step.warnings) {
            doc.text(`⚠️ ${step.warnings}`, 18, y);
            y += 5;
          }
          y += 3;
        });
      }

      if (tips.length > 0) {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(12);
        doc.text('Dicas e Observações', 14, y);
        y += 7;
        doc.setFontSize(9);
        tips.forEach(tip => {
          const prefix = tip.tip_type === 'warning' ? '⚠️' : tip.tip_type === 'important' ? 'ℹ️' : '💡';
          const tipLines = doc.splitTextToSize(`${prefix} ${tip.content}`, 175);
          doc.text(tipLines, 18, y);
          y += tipLines.length * 5 + 3;
          if (y > 270) { doc.addPage(); y = 20; }
        });
      }

      doc.save(`ficha-${sheet.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      toast.success('PDF exportado com sucesso!');
    } catch {
      toast.error('Erro ao gerar PDF');
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card border-border/50 h-full flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </Card>
    );
  }

  if (!sheet) {
    return (
      <Card className="glass-card border-border/50 h-full flex items-center justify-center">
        <div className="text-muted-foreground">Ficha não encontrada</div>
      </Card>
    );
  }

  const getTipIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'important': return <Info className="h-4 w-4 text-primary" />;
      default: return <Lightbulb className="h-4 w-4 text-accent-foreground" />;
    }
  };

  const getTipBgColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-destructive/10 border-destructive/30';
      case 'important': return 'bg-primary/10 border-primary/30';
      default: return 'bg-accent/30 border-accent/50';
    }
  };

  const progress = steps.length > 0 ? Math.round((completedSteps.size / steps.length) * 100) : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      <Card className="glass-card border-border/50 flex-1 flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {sheet.techniques && (
                  <Badge
                    style={{ backgroundColor: `${sheet.techniques.color}20`, color: sheet.techniques.color, borderColor: `${sheet.techniques.color}50` }}
                    className="border"
                  >
                    {sheet.techniques.short_name}
                  </Badge>
                )}
                {sheet.product_categories && (
                  <Badge variant="outline">{sheet.product_categories.name}</Badge>
                )}
                {sheet.materials && (
                  <Badge variant="secondary">{sheet.materials.name}</Badge>
                )}
              </div>
              <CardTitle className="text-xl">{sheet.title}</CardTitle>
              {sheet.description && (
                <p className="text-sm text-muted-foreground mt-2">{sheet.description}</p>
              )}
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              {onDuplicate && (
                <Button variant="ghost" size="icon" onClick={onDuplicate} title="Duplicar ficha">
                  <Copy className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setShowQR(!showQR)} title="QR Code">
                <QrCode className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5">
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 flex-wrap">
            {sheet.estimated_time_minutes && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{sheet.estimated_time_minutes} minutos</span>
              </div>
            )}
            {sheet.machines && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wrench className="h-4 w-4" />
                <span>{sheet.machines.name} ({sheet.machines.code})</span>
              </div>
            )}
            {steps.length > 0 && (
              <Button
                variant={checklistMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setChecklistMode(!checklistMode);
                  if (checklistMode) setCompletedSteps(new Set());
                }}
                className="gap-1.5 ml-auto"
              >
                <CheckCircle2 className="h-4 w-4" />
                {checklistMode ? `${progress}%` : 'Checklist'}
              </Button>
            )}
          </div>

          {checklistMode && steps.length > 0 && (
            <div className="mt-3">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedSteps.size} de {steps.length} passos concluídos
              </p>
            </div>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-8">
              {/* Technical Settings Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(sheet.ink_specifications || sheet.tooling_specifications) && (
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <Droplets className="h-4 w-4" />
                      Insumos e Ferramental
                    </h3>
                    <div className="space-y-3">
                      {sheet.ink_specifications && (
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <Label className="text-[10px] text-muted-foreground uppercase">Tinta / Solventes</Label>
                          <p className="text-sm font-medium">{sheet.ink_specifications}</p>
                        </div>
                      )}
                      {sheet.tooling_specifications && (
                        <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
                          <Label className="text-[10px] text-muted-foreground uppercase">Ferramental (Rodo/Lâmina)</Label>
                          <p className="text-sm font-medium">{sheet.tooling_specifications}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {sheet.machine_settings && Object.values(sheet.machine_settings).some(v => v) && (
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-600">
                      <Zap className="h-4 w-4" />
                      Regulagem da Máquina
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(sheet.machine_settings as any).squeegee_passes && (
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <Label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                            <MoveHorizontal className="h-3 w-3" /> Passadas
                          </Label>
                          <p className="text-sm font-bold">{(sheet.machine_settings as any).squeegee_passes}</p>
                        </div>
                      )}
                      {(sheet.machine_settings as any).pressure && (
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <Label className="text-[10px] text-muted-foreground uppercase">Pressão</Label>
                          <p className="text-sm font-bold">{(sheet.machine_settings as any).pressure}</p>
                        </div>
                      )}
                      {(sheet.machine_settings as any).speed && (
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <Label className="text-[10px] text-muted-foreground uppercase">Velocidade</Label>
                          <p className="text-sm font-bold">{(sheet.machine_settings as any).speed}</p>
                        </div>
                      )}
                      {(sheet.machine_settings as any).temperature && (
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <Label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                            <Thermometer className="h-3 w-3" /> Temperatura
                          </Label>
                          <p className="text-sm font-bold">{(sheet.machine_settings as any).temperature}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {sheetMaterials.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Package className="h-4 w-4 text-primary" />
                    Materiais e Insumos
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {sheetMaterials.map(material => (
                      <div key={material.id} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                        <div className="font-medium text-sm">{material.name}</div>
                        {material.specification && (
                          <div className="text-xs text-muted-foreground mt-1">{material.specification}</div>
                        )}
                        {material.quantity && (
                          <Badge variant="outline" className="mt-2 text-xs">{material.quantity}</Badge>
                        )}
                        {material.notes && (
                          <div className="text-xs text-muted-foreground mt-2 italic">{material.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {steps.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <ListOrdered className="h-4 w-4 text-primary" />
                    Passo a Passo
                  </h3>
                  <div className="space-y-3">
                    {steps.map(step => (
                      <div
                        key={step.id}
                        className={`relative pl-8 pb-4 border-l-2 last:border-l-0 transition-opacity ${
                          checklistMode && completedSteps.has(step.id)
                            ? 'border-primary/50 opacity-60'
                            : 'border-primary/30'
                        }`}
                      >
                        {checklistMode ? (
                          <div className="absolute -left-3 top-0">
                            <Checkbox
                              checked={completedSteps.has(step.id)}
                              onCheckedChange={() => toggleStep(step.id)}
                              className="h-6 w-6 rounded-full"
                            />
                          </div>
                        ) : (
                          <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                            {step.step_number}
                          </div>
                        )}
                        <div className={`p-4 rounded-lg bg-muted/20 border border-border/30 ${
                          checklistMode && completedSteps.has(step.id) ? 'line-through decoration-muted-foreground/50' : ''
                        }`}>
                          <h4 className="font-medium text-sm">{step.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{step.description}</p>
                          {step.tips && (
                            <div className="mt-3 p-2 rounded bg-accent/30 border border-accent/50 flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-accent-foreground flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-accent-foreground">{step.tips}</span>
                            </div>
                          )}
                          {step.warnings && (
                            <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/30 flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-destructive">{step.warnings}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tips.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Lightbulb className="h-4 w-4 text-accent-foreground" />
                    Dicas e Observações
                  </h3>
                  <div className="space-y-2">
                    {tips.map(tip => (
                      <div
                        key={tip.id}
                        className={`p-3 rounded-lg border flex items-start gap-2 ${getTipBgColor(tip.tip_type)}`}
                      >
                        {getTipIcon(tip.tip_type)}
                        <span className="text-sm">{tip.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {steps.length === 0 && sheetMaterials.length === 0 && tips.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Esta ficha técnica ainda não possui conteúdo detalhado.</p>
                  {onEdit && (
                    <Button variant="link" onClick={onEdit} className="mt-2">
                      Adicionar conteúdo
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {showQR && (
        <div className="w-full lg:w-56 flex-shrink-0">
          <KnowledgeSheetQRCode sheetId={sheetId} title={sheet.title} />
        </div>
      )}
    </div>
  );
};
