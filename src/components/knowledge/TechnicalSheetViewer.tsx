import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Edit, 
  Clock, 
  Wrench, 
  ListOrdered, 
  Package, 
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useTechnicalSheetDetails } from '@/hooks/useTechnicalSheets';

interface TechnicalSheetViewerProps {
  sheetId: string;
  onEdit?: () => void;
}

export const TechnicalSheetViewer = ({ sheetId, onEdit }: TechnicalSheetViewerProps) => {
  const { sheet, steps, sheetMaterials, tips, isLoading } = useTechnicalSheetDetails(sheetId);

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
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'important':
        return <Info className="h-4 w-4 text-blue-400" />;
      default:
        return <Lightbulb className="h-4 w-4 text-green-400" />;
    }
  };

  const getTipBgColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'important':
        return 'bg-blue-500/10 border-blue-500/30';
      default:
        return 'bg-green-500/10 border-green-500/30';
    }
  };

  return (
    <Card className="glass-card border-border/50 h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
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
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          )}
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 mt-4">
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
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Materials/Supplies */}
            {sheetMaterials.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Package className="h-4 w-4 text-cyan-400" />
                  Materiais e Insumos
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {sheetMaterials.map(material => (
                    <div 
                      key={material.id}
                      className="p-3 rounded-lg bg-muted/20 border border-border/30"
                    >
                      <div className="font-medium text-sm">{material.name}</div>
                      {material.specification && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {material.specification}
                        </div>
                      )}
                      {material.quantity && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {material.quantity}
                        </Badge>
                      )}
                      {material.notes && (
                        <div className="text-xs text-muted-foreground mt-2 italic">
                          {material.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Steps */}
            {steps.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <ListOrdered className="h-4 w-4 text-primary" />
                  Passo a Passo
                </h3>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div 
                      key={step.id}
                      className="relative pl-8 pb-4 border-l-2 border-primary/30 last:border-l-0"
                    >
                      <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {step.step_number}
                      </div>
                      <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
                        <h4 className="font-medium text-sm">{step.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {step.description}
                        </p>
                        {step.tips && (
                          <div className="mt-3 p-2 rounded bg-green-500/10 border border-green-500/30 flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-green-300">{step.tips}</span>
                          </div>
                        )}
                        {step.warnings && (
                          <div className="mt-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-yellow-300">{step.warnings}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {tips.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Lightbulb className="h-4 w-4 text-yellow-400" />
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

            {/* Empty state */}
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
  );
};
