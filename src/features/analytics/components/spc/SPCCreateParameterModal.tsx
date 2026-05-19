import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MEASUREMENT_TYPES = [
  { value: 'dimensional', label: 'Dimensional' },
  { value: 'weight', label: 'Peso' },
  { value: 'temperature', label: 'Temperatura' },
  { value: 'pressure', label: 'Pressão' },
  { value: 'visual', label: 'Visual' }
];

interface SPCCreateParameterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newParam: {
    name: string; measurement_type: string; unit: string; target_value: number;
    upper_spec_limit: number; lower_spec_limit: number; sample_size: number;
    frequency_minutes: number; product_name: string;
  };
  onParamChange: (updater: (prev: ParamType) => ParamType) => void;
  onSubmit: () => void;
  isPending: boolean;
}

type ParamType = SPCCreateParameterModalProps['newParam'];

export function SPCCreateParameterModal({ open, onOpenChange, newParam, onParamChange, onSubmit, isPending }: SPCCreateParameterModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Parâmetro de Controle</DialogTitle>
          <DialogDescription>Configure um novo parâmetro para monitoramento SPC</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={newParam.name} onChange={(e) => onParamChange((p: ParamType) => ({ ...p, name: e.target.value }))} placeholder="Ex: Diâmetro Externo" />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Medição</Label>
              <Select value={newParam.measurement_type} onValueChange={(v) => onParamChange((p: ParamType) => ({ ...p, measurement_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MEASUREMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Valor Alvo *</Label>
              <Input type="number" step="0.001" value={newParam.target_value} onChange={(e) => onParamChange((p: ParamType) => ({ ...p, target_value: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>LSL *</Label>
              <Input type="number" step="0.001" value={newParam.lower_spec_limit} onChange={(e) => onParamChange((p: ParamType) => ({ ...p, lower_spec_limit: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>USL *</Label>
              <Input type="number" step="0.001" value={newParam.upper_spec_limit} onChange={(e) => onParamChange((p: ParamType) => ({ ...p, upper_spec_limit: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Input value={newParam.unit} onChange={(e) => onParamChange((p: ParamType) => ({ ...p, unit: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Tamanho Amostra</Label>
              <Input type="number" value={newParam.sample_size} onChange={(e) => onParamChange((p: ParamType) => ({ ...p, sample_size: parseInt(e.target.value) || 5 }))} />
            </div>
            <div className="space-y-2">
              <Label>Frequência (min)</Label>
              <Input type="number" value={newParam.frequency_minutes} onChange={(e) => onParamChange((p: ParamType) => ({ ...p, frequency_minutes: parseInt(e.target.value) || 60 }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={onSubmit} disabled={isPending}>Criar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
