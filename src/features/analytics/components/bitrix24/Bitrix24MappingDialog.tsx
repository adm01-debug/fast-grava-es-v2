import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Save, Loader2 } from 'lucide-react';

interface FieldInfo {
  type: string; isRequired: boolean; isReadOnly: boolean; isImmutable: boolean; isMultiple: boolean; title: string; formLabel?: string; listLabel?: string;
}

const JOB_FIELDS = [
  { id: 'client', label: 'Cliente' }, { id: 'product', label: 'Produto' }, { id: 'quantity', label: 'Quantidade' },
  { id: 'technique_id', label: 'Técnica' }, { id: 'priority', label: 'Prioridade' }, { id: 'scheduled_date', label: 'Data Agendada' },
  { id: 'gravure_color', label: 'Cor da Gravura' }, { id: 'notes', label: 'Observações' }, { id: 'estimated_duration', label: 'Duração Estimada' },
];

const SYSTEM_TECHNIQUES = ['silk-textile', 'silk-vinyl-flat', 'silk-vinyl-rotative', 'silk-decal', 'fiber-laser', 'laser-co2', 'laser-uv', 'tampo', 'hot-stamp', 'thermal-press', 'sublimation-mug', 'decal-oven', 'dtf-textile', 'dtf-uv', 'dtf-uv-application', 'cut-media'];
const SYSTEM_PRIORITIES = ['urgent', 'high', 'medium', 'low'];
const SYSTEM_STATUSES = ['queue', 'ready', 'scheduled', 'production', 'finished', 'cancelled', 'delayed', 'paused', 'rework'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newMapping: { mapping_type: string; source_key: string; target_key: string; priority: number };
  setNewMapping: (m: { mapping_type: string; source_key: string; target_key: string; priority: number }) => void;
  onSave: () => void;
  isLoading: boolean;
  bitrixFields: Record<string, FieldInfo>;
}

export function Bitrix24MappingDialog({ open, onOpenChange, newMapping, setNewMapping, onSave, isLoading, bitrixFields }: Props) {
  const getTargetOptions = () => {
    switch (newMapping.mapping_type) {
      case 'field': return Object.keys(bitrixFields).length > 0 ? Object.keys(bitrixFields) : ['UF_CRM_...'];
      case 'technique': return SYSTEM_TECHNIQUES;
      case 'priority': return SYSTEM_PRIORITIES;
      case 'stage': return SYSTEM_STATUSES;
      default: return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Novo Mapeamento</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Adicionar Mapeamento</DialogTitle><DialogDescription>Configure um novo mapeamento entre Bitrix24 e o sistema</DialogDescription></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>Tipo de Mapeamento</Label><Select value={newMapping.mapping_type} onValueChange={(v) => setNewMapping({...newMapping, mapping_type: v, source_key: '', target_key: ''})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="field">Campo</SelectItem><SelectItem value="technique">Técnica</SelectItem><SelectItem value="priority">Prioridade</SelectItem><SelectItem value="stage">Status</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>{newMapping.mapping_type === 'field' ? 'Campo do Sistema' : 'Valor Bitrix24'}</Label>
            {newMapping.mapping_type === 'field' ? (<Select value={newMapping.source_key} onValueChange={(v) => setNewMapping({...newMapping, source_key: v})}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{JOB_FIELDS.map(f => (<SelectItem key={f.id} value={f.id}>{f.label} ({f.id})</SelectItem>))}</SelectContent></Select>) : (<Input value={newMapping.source_key} onChange={(e) => setNewMapping({...newMapping, source_key: e.target.value})} placeholder="Ex: valor_bitrix" />)}
          </div>
          <div className="space-y-2"><Label>{newMapping.mapping_type === 'field' ? 'Campo Bitrix24' : 'Valor do Sistema'}</Label>
            {newMapping.mapping_type === 'field' ? (<Input value={newMapping.target_key} onChange={(e) => setNewMapping({...newMapping, target_key: e.target.value})} placeholder="Ex: UF_CRM_..." />) : (<Select value={newMapping.target_key} onValueChange={(v) => setNewMapping({...newMapping, target_key: v})}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{getTargetOptions().map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent></Select>)}
          </div>
          {newMapping.mapping_type === 'field' && (<div className="space-y-2"><Label>Prioridade</Label><Input type="number" value={newMapping.priority} onChange={(e) => setNewMapping({...newMapping, priority: parseInt(e.target.value) || 0})} min={0} /><p className="text-xs text-muted-foreground">Campos com menor prioridade são verificados primeiro</p></div>)}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button onClick={onSave} disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Salvar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
