import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Wrench, CheckCircle2, Camera, AlertTriangle, Clock, Plus, Trash2, PenTool, Zap, MoveHorizontal, Thermometer } from 'lucide-react';
import { MaintenanceSchedule, MaintenanceChecklist, MaintenanceChecklistItem } from '@/hooks/tpm/types';
import { useTPM } from '@/hooks/useTPM';
import { useTechnicalSheets } from '@/hooks/useTechnicalSheets';
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
    parts: any[];
    signature?: string;
    checklist_version?: number;
    checklist_snapshot?: any;
    technical_sheet_id?: string;
    technical_sheet_version?: number;
    adjustment_parameters?: any;
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
  const { sheets: technicalSheets } = useTechnicalSheets();
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [adjustmentParams, setAdjustmentParams] = useState({
    squeegee_passes: '',
    pressure: '',
    speed: '',
    temperature: ''
  });
  const [parameterAlerts, setParameterAlerts] = useState<string[]>([]);
  
  const [notes, setNotes] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [downtime, setDowntime] = useState(0);
  const [responses, setResponses] = useState<Record<string, {
    is_checked: boolean;
    measurement_value?: number;
    notes?: string;
    photo_url?: string;
  }>>({});
  const [parts, setParts] = useState<Array<{ name: string; code: string; quantity: number }>>([]);
  const [signature, setSignature] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const checklist = useMemo(() => {
    if (!schedule) return null;
    // Tenta encontrar checklist específico para a técnica/tipo da máquina
    const techChecklist = checklists.find(c => 
      c.maintenance_type_id === schedule.maintenance_type_id && 
      c.technique_id === schedule.machine?.technique_id &&
      c.is_active
    );
    if (techChecklist) return techChecklist;

    // Fallback para checklist global do tipo de manutenção
    return checklists.find(c => 
      c.maintenance_type_id === schedule.maintenance_type_id && 
      !c.technique_id &&
      c.is_active
    );
  }, [schedule, checklists]);

  useEffect(() => {
    if (selectedSheetId) {
      const sheet = technicalSheets.find(s => s.id === selectedSheetId);
      if (sheet?.machine_settings) {
        const settings = sheet.machine_settings as any;
        setAdjustmentParams({
          squeegee_passes: settings.squeegee_passes || '',
          pressure: settings.pressure || '',
          speed: settings.speed || '',
          temperature: settings.temperature || ''
        });
      }
    }
  }, [selectedSheetId, technicalSheets]);

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

  const handleAddPart = () => {
    setParts([...parts, { name: '', code: '', quantity: 1 }]);
  };

  const handleRemovePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleUpdatePart = (index: number, field: string, value: any) => {
    const newParts = [...parts];
    newParts[index] = { ...newParts[index], [field]: value };
    setParts(newParts);
  };

  const handleFileUpload = async (itemId: string, file: File) => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `execution-evidences/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tpm-evidences')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tpm-evidences')
        .getPublicUrl(filePath);

      handleResponseUpdate(itemId, { photo_url: publicUrl });
      toast.success('Foto enviada com sucesso');
    } catch (error) {
      toast.error('Erro ao enviar foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleComplete = () => {
    if (checklist?.items) {
      const missingCritical = checklist.items.filter(item => 
        item.is_critical && !responses[item.id]?.is_checked
      );
      
      if (missingCritical.length > 0) {
        toast.error(`Existem itens críticos não marcados: ${missingCritical.map(i => i.description).join(', ')}`);
        return;
      }
    }

    // Validação de parâmetros de regulagem
    if (selectedSheetId) {
      const sheet = technicalSheets.find(s => s.id === selectedSheetId);
      const settings = sheet?.machine_settings as any;
      const ranges = (sheet?.settings_ranges as any) || {};
      const alerts: string[] = [];

      const validateRange = (name: string, value: string, range: { min?: string; max?: string }) => {
        if (!range || (!range.min && !range.max)) return;
        const val = parseFloat(value.replace(/[^0-9.]/g, ''));
        const min = range.min ? parseFloat(range.min.replace(/[^0-9.]/g, '')) : -Infinity;
        const max = range.max ? parseFloat(range.max.replace(/[^0-9.]/g, '')) : Infinity;
        
        if (!isNaN(val)) {
          if (val < min || val > max) {
            alerts.push(`${name}: Informado ${value}, Recomendado entre ${range.min || '-'} e ${range.max || '-'}`);
            return true;
          }
        }
        return false;
      };

      validateRange('Passadas de Rodo', adjustmentParams.squeegee_passes, ranges.squeegee_passes);
      validateRange('Pressão', adjustmentParams.pressure, ranges.pressure);
      validateRange('Velocidade', adjustmentParams.speed, ranges.speed);
      validateRange('Temperatura', adjustmentParams.temperature, ranges.temperature);

      if (alerts.length > 0) {
        toast.warning("Parâmetros fora do intervalo recomendado", {
          description: alerts.join('\n')
        });
        
        // Log alerts to database
        alerts.forEach(alertMsg => {
          supabase.from('tpm_parameter_alerts').insert({
            execution_id: recordId, // This might be null if creating new, we'll need to handle it after save
            parameter_name: alertMsg.split(':')[0],
            recorded_value: adjustmentParams[alertMsg.split(':')[0].toLowerCase().replace(/ /g, '_') as keyof typeof adjustmentParams] || '',
            recommended_range: JSON.stringify(ranges[alertMsg.split(':')[0].toLowerCase().replace(/ /g, '_')]),
            severity: 'warning'
          }).then();
        });
      }
    }

    onComplete({
      notes,
      total_cost: totalCost,
      downtime_minutes: downtime,
      responses: Object.entries(responses).map(([itemId, resp]) => ({
        checklist_item_id: itemId,
        ...resp
      })),
      parts,
      signature,
      checklist_version: checklist?.version,
      checklist_snapshot: checklist,
      technical_sheet_id: selectedSheetId || undefined,
      technical_sheet_version: selectedSheetId ? (technicalSheets.find(s => s.id === selectedSheetId)?.version) : undefined,
      adjustment_parameters: {
        ...adjustmentParams,
        recommended: selectedSheetId ? (technicalSheets.find(s => s.id === selectedSheetId)?.machine_settings) : null,
        ranges: selectedSheetId ? (technicalSheets.find(s => s.id === selectedSheetId)?.settings_ranges) : null
      }
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
                          <div className="flex items-center gap-2">
                            {responses[item.id]?.photo_url ? (
                              <Badge variant="outline" className="text-emerald-500 gap-1 h-8">
                                <CheckCircle2 className="h-3 w-3" /> Foto OK
                              </Badge>
                            ) : (
                              <div className="relative">
                                <Input 
                                  type="file" 
                                  className="hidden" 
                                  id={`photo-${item.id}`}
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(item.id, file);
                                  }}
                                  disabled={isUploading}
                                />
                                <Label 
                                  htmlFor={`photo-${item.id}`}
                                  className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 cursor-pointer gap-1"
                                >
                                  <Camera className="h-3 w-3" /> Foto
                                </Label>
                              </div>
                            )}
                          </div>
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

            {/* Technical Sheet & Adjustments */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Regulagem Técnica
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Vincular Ficha Técnica (Opcional)</Label>
                  <Select 
                    value={selectedSheetId || ""} 
                    onValueChange={(value) => setSelectedSheetId(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma ficha técnica..." />
                    </SelectTrigger>
                    <SelectContent>
                      {technicalSheets.filter(s => s.recommended_machine_id === schedule.machine_id).map(sheet => (
                        <SelectItem key={sheet.id} value={sheet.id}>{sheet.title}</SelectItem>
                      ))}
                      {technicalSheets.filter(s => s.recommended_machine_id !== schedule.machine_id).length > 0 && (
                        <>
                          <Separator className="my-2" />
                          {technicalSheets.filter(s => s.recommended_machine_id !== schedule.machine_id).map(sheet => (
                            <SelectItem key={sheet.id} value={sheet.id}>{sheet.title} (Outra Máquina)</SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-xs">
                      <MoveHorizontal className="h-3 w-3" /> Passadas
                    </Label>
                    <Input 
                      placeholder="Ex: 2"
                      value={adjustmentParams.squeegee_passes}
                      onChange={(e) => setAdjustmentParams(prev => ({ ...prev, squeegee_passes: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Pressão</Label>
                    <Input 
                      placeholder="Ex: 4 bar"
                      value={adjustmentParams.pressure}
                      onChange={(e) => setAdjustmentParams(prev => ({ ...prev, pressure: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Velocidade</Label>
                    <Input 
                      placeholder="Ex: 50%"
                      value={adjustmentParams.speed}
                      onChange={(e) => setAdjustmentParams(prev => ({ ...prev, speed: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-xs">
                      <Thermometer className="h-3 w-3" /> Temp.
                    </Label>
                    <Input 
                      placeholder="Ex: 180°C"
                      value={adjustmentParams.temperature}
                      onChange={(e) => setAdjustmentParams(prev => ({ ...prev, temperature: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

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
                  className="min-h-[80px]"
                />
              </div>

              {/* Parts Replacement */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Peças Trocadas
                  </h3>
                  <Button variant="outline" size="sm" onClick={handleAddPart}>
                    <Plus className="h-4 w-4 mr-1" /> Adicionar Peça
                  </Button>
                </div>
                <div className="space-y-3">
                  {parts.map((part, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 border rounded-lg bg-secondary/10">
                      <Input 
                        placeholder="Nome da Peça" 
                        value={part.name} 
                        onChange={(e) => handleUpdatePart(index, 'name', e.target.value)}
                        className="sm:col-span-2"
                      />
                      <Input 
                        type="number" 
                        placeholder="Qtd" 
                        value={part.quantity} 
                        onChange={(e) => handleUpdatePart(index, 'quantity', parseFloat(e.target.value) || 1)}
                      />
                      <Button variant="ghost" size="icon" className="text-destructive self-end" onClick={() => handleRemovePart(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {parts.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Nenhuma peça registrada.</p>
                  )}
                </div>
              </div>

              {/* Signature */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-primary" />
                  Assinatura Digital
                </h3>
                <div className="p-4 border border-dashed rounded-lg bg-muted/20 text-center">
                  <Input 
                    placeholder="Assine aqui (Nome Completo)" 
                    value={signature} 
                    onChange={(e) => setSignature(e.target.value)}
                    className="max-w-md mx-auto text-center font-serif italic text-lg"
                  />
                  <p className="text-[10px] text-muted-foreground mt-2">Esta assinatura declara a veracidade dos dados informados.</p>
                </div>
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
