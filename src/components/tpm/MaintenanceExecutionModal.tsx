import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wrench, CheckCircle2, Camera, AlertTriangle, Clock } from 'lucide-react';
import { MaintenanceSchedule, MaintenanceChecklist, MaintenanceChecklistItem } from '@/hooks/tpm/types';
import { useTPM } from '@/hooks/useTPM';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MaintenanceExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: MaintenanceSchedule | null;
  recordId: string | null;
  onComplete: (data: {
    notes: string;
    total_cost: number;
    downtime_minutes: number;
    responses: any[];
  }) => void;
}

export function MaintenanceExecutionModal({
  isOpen,
  onClose,
  schedule,
  recordId,
  onComplete,
}: MaintenanceExecutionModalProps) {
  const { checklists } = useTPM();
  const [notes, setNotes] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [downtime, setDowntime] = useState(0);
  const [responses, setResponses] = useState<Record<string, {
    is_checked: boolean;
    measurement_value?: number;
    notes?: string;
    photo_url?: string;
  }>>({});

  const checklist = schedule ? checklists.find(c => c.maintenance_type_id === schedule.maintenance_type_id) : null;

  useEffect(() => {
    if (checklist?.items) {
      const initialResponses: Record<string, any> = {};
      checklist.items.forEach(item => {
        initialResponses[item.id] = {
          is_checked: false,
          measurement_value: undefined,
          notes: '',
        };
      });
      setResponses(initialResponses);
    }
  }, [checklist]);

  const handleResponseUpdate = (itemId: string, updates: any) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], ...updates }
    }));
  };

  const handleComplete = () => {
    // Validation
    if (checklist?.items) {
      const missingCritical = checklist.items.filter(item => 
        item.is_critical && !responses[item.id]?.is_checked
      );
      
      if (missingCritical.length > 0) {
        toast.error(`Existem itens críticos não marcados: ${missingCritical.map(i => i.description).join(', ')}`);
        return;
      }
    }

    onComplete({
      notes,
      total_cost: totalCost,
      downtime_minutes: downtime,
      responses: Object.entries(responses).map(([itemId, resp]) => ({
        checklist_item_id: itemId,
        ...resp
      }))
    });
  };

  if (!schedule) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wrench className="h-6 w-6 text-primary" />
            Executar Manutenção: {schedule.name}
          </DialogTitle>
          <DialogDescription>
            Máquina: {schedule.machine?.name} ({schedule.machine?.code})
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-6 py-4">
            {/* Checklist Items */}
            {checklist ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Checklist Obrigatório
                </h3>
                <div className="space-y-3">
                  {checklist.items?.map((item) => (
                    <div key={item.id} className="p-4 rounded-lg bg-secondary/20 border border-border/50 space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          id={`item-${item.id}`}
                          checked={responses[item.id]?.is_checked}
                          onCheckedChange={(checked) => handleResponseUpdate(item.id, { is_checked: !!checked })}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={`item-${item.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {item.description}
                            {item.is_critical && <span className="text-destructive ml-1">*</span>}
                          </Label>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 pl-8">
                        {item.requires_measurement && (
                          <div className="flex items-center gap-2">
                            <Label className="text-xs whitespace-nowrap">Medição ({item.measurement_unit}):</Label>
                            <Input 
                              type="number"
                              size={1}
                              className="h-8 w-24"
                              placeholder="Valor"
                              value={responses[item.id]?.measurement_value || ''}
                              onChange={(e) => handleResponseUpdate(item.id, { measurement_value: parseFloat(e.target.value) })}
                            />
                            {(item.min_value !== null || item.max_value !== null) && (
                              <span className="text-[10px] text-muted-foreground">
                                Limites: {item.min_value ?? '-'} a {item.max_value ?? '-'}
                              </span>
                            )}
                          </div>
                        )}
                        {item.requires_photo && (
                          <Button variant="outline" size="sm" className="h-8 gap-1">
                            <Camera className="h-3 w-3" /> Foto
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
                <p className="text-sm">Nenhum checklist configurado para este tipo de manutenção.</p>
              </div>
            )}

            {/* General Info */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="text-lg font-semibold">Informações Gerais</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Tempo de Máquina Parada (min)
                  </Label>
                  <Input 
                    type="number" 
                    value={downtime} 
                    onChange={(e) => setDowntime(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custo Total (Opcional)</Label>
                  <Input 
                    type="number" 
                    placeholder="R$ 0,00"
                    value={totalCost} 
                    onChange={(e) => setTotalCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações Adicionais</Label>
                <Textarea 
                  placeholder="Relate problemas encontrados, peças trocadas, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleComplete} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Concluir Manutenção
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
