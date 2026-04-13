import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, CheckCircle, XCircle, AlertTriangle, ClipboardCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductionLot, useTraceabilityMutations } from '@/hooks/useTraceability';

const INSPECTION_RESULTS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  approved: { label: 'Aprovado', variant: 'default' },
  rejected: { label: 'Rejeitado', variant: 'destructive' },
  conditional: { label: 'Condicional', variant: 'secondary' },
};

interface LotInspectionsTabProps {
  lot: ProductionLot;
  inspections: any[] | undefined;
}

export function LotInspectionsTab({ lot, inspections }: LotInspectionsTabProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newInspection, setNewInspection] = useState({ inspection_type: '', result: 'approved', inspector_name: '', sample_size: 0, defects_found: 0, notes: '' });
  const { addInspection } = useTraceabilityMutations();

  const handleAdd = () => {
    addInspection.mutate({
      lot_id: lot.id, inspection_type: newInspection.inspection_type, result: newInspection.result,
      inspector_name: newInspection.inspector_name || undefined, sample_size: newInspection.sample_size || undefined,
      defects_found: newInspection.defects_found || undefined, notes: newInspection.notes || undefined
    }, { onSuccess: () => { setShowAdd(false); setNewInspection({ inspection_type: '', result: 'approved', inspector_name: '', sample_size: 0, defects_found: 0, notes: '' }); } });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Inspeções de Qualidade</h4>
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-1" />Nova Inspeção</Button>
      </div>
      {showAdd && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tipo de Inspeção *</Label><Input value={newInspection.inspection_type} onChange={(e) => setNewInspection(p => ({ ...p, inspection_type: e.target.value }))} placeholder="Ex: Visual, Dimensional" /></div>
              <div className="space-y-2"><Label>Resultado *</Label>
                <Select value={newInspection.result} onValueChange={(v) => setNewInspection(p => ({ ...p, result: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(INSPECTION_RESULTS).map(([key, config]) => (<SelectItem key={key} value={key}>{config.label}</SelectItem>))}</SelectContent></Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Inspetor</Label><Input value={newInspection.inspector_name} onChange={(e) => setNewInspection(p => ({ ...p, inspector_name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Amostragem</Label><Input type="number" value={newInspection.sample_size} onChange={(e) => setNewInspection(p => ({ ...p, sample_size: parseInt(e.target.value) || 0 }))} /></div>
              <div className="space-y-2"><Label>Defeitos</Label><Input type="number" value={newInspection.defects_found} onChange={(e) => setNewInspection(p => ({ ...p, defects_found: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div className="space-y-2"><Label>Notas</Label><Textarea value={newInspection.notes} onChange={(e) => setNewInspection(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => setShowAdd(false)}>Cancelar</Button><Button onClick={handleAdd} disabled={addInspection.isPending}>Registrar</Button></div>
          </CardContent>
        </Card>
      )}
      {inspections && inspections.length > 0 ? (
        <div className="space-y-3">
          {inspections.map((insp) => {
            const resultConfig = INSPECTION_RESULTS[insp.result];
            const ResultIcon = insp.result === 'approved' ? CheckCircle : insp.result === 'rejected' ? XCircle : AlertTriangle;
            return (
              <div key={insp.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <ResultIcon className={`h-5 w-5 mt-0.5 ${insp.result === 'approved' ? 'text-green-500' : insp.result === 'rejected' ? 'text-destructive' : 'text-warning'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2"><span className="font-medium text-sm">{insp.inspection_type}</span><Badge variant={resultConfig?.variant || 'default'}>{resultConfig?.label}</Badge></div>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>📅 {format(new Date(insp.inspected_at), 'dd/MM/yyyy HH:mm')}</span>
                    {insp.inspector_name && <span>👤 {insp.inspector_name}</span>}
                    {insp.sample_size && <span>📊 Amostra: {insp.sample_size}</span>}
                    {insp.defects_found > 0 && <span className="text-destructive">⚠ {insp.defects_found} defeitos</span>}
                  </div>
                  {insp.notes && <p className="text-sm text-muted-foreground mt-1">{insp.notes}</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : !showAdd && (
        <div className="text-center py-8 text-muted-foreground"><ClipboardCheck className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>Nenhuma inspeção registrada</p></div>
      )}
    </div>
  );
}
