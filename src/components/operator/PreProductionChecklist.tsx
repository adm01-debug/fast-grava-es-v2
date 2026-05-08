import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardCheck, CheckCircle2, AlertTriangle, Settings2, Package, Beaker } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { TechnicalSheet } from '@/hooks/useTechnicalSheets';

interface PreProductionChecklistProps {
  jobId: string;
  onComplete?: () => void;
  onSkip?: () => void;
}

interface ChecklistState {
  material_verified: boolean;
  color_verified: boolean;
  machine_clean: boolean;
  tools_ready: boolean;
  squeegee_passes: string;
  pressure: string;
  speed: string;
  temperature: string;
  notes: string;
  consumables_confirmed: Array<{ name: string; confirmed: boolean }>;
}

const checklistItems = [
  { key: 'material_verified' as const, label: 'Material correto verificado', description: 'Confirme que o material está de acordo com a ficha técnica' },
  { key: 'color_verified' as const, label: 'Cor/gravura verificada', description: 'Confirme a cor, arte e posicionamento da gravação' },
  { key: 'machine_clean' as const, label: 'Máquina limpa e preparada', description: 'Equipamento higienizado e pronto para produção' },
  { key: 'tools_ready' as const, label: 'Ferramentas e insumos prontos', description: 'Todos os acessórios e insumos necessários à mão' },
];

export function PreProductionChecklist({ jobId, onComplete, onSkip }: PreProductionChecklistProps) {
  const { user, profile } = useAuth();
  const [state, setState] = useState<ChecklistState>({
    material_verified: false,
    color_verified: false,
    machine_clean: false,
    tools_ready: false,
    squeegee_passes: '',
    pressure: '',
    speed: '',
    temperature: '',
    notes: '',
    consumables_confirmed: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingChecklist, setExistingChecklist] = useState<boolean>(false);

  // Fetch job and technical sheet
  const { data: job } = useQuery({
    queryKey: ['job-details', jobId],
    queryFn: async () => {
      const { data, error } = await supabase.from('jobs').select('*').eq('id', jobId).single();
      if (error) throw error;
      return data;
    }
  });

  const { data: technicalSheet } = useQuery({
    queryKey: ['technical-sheet-link', job?.technique_id, job?.product_category_id],
    queryFn: async () => {
      if (!job?.technique_id) return null;
      let query = supabase.from('technical_sheets')
        .select('*')
        .eq('technique_id', job.technique_id)
        .eq('is_active', true);
      
      if (job.product_category_id) {
        query = query.eq('product_category_id', job.product_category_id);
      }

      const { data, error } = await query.maybeSingle();
      if (error) return null;
      return data as unknown as TechnicalSheet;
    },
    enabled: !!job
  });

  // Check if checklist already exists
  useEffect(() => {
    async function check() {
      const { data } = await supabase
        .from('pre_production_checklists')
        .select('id')
        .eq('job_id', jobId)
        .maybeSingle();
      if (data) setExistingChecklist(true);
    }
    check();
  }, [jobId]);

  // Initialize consumables when sheet is loaded
  useEffect(() => {
    if (technicalSheet?.consumables && state.consumables_confirmed.length === 0) {
      const consumables = (technicalSheet.consumables as any[]).map(c => ({
        name: c.name,
        confirmed: false
      }));
      setState(prev => ({ ...prev, consumables_confirmed: consumables }));
    }
  }, [technicalSheet]);

  const allChecklistItemsChecked = checklistItems.every(item => state[item.key]);
  const regulationFieldsFilled = state.squeegee_passes && state.pressure && state.speed && state.temperature;
  const consumablesConfirmed = state.consumables_confirmed.length === 0 || state.consumables_confirmed.every(c => c.confirmed);
  const allChecked = allChecklistItemsChecked && regulationFieldsFilled && consumablesConfirmed;

  const validateRanges = () => {
    if (!technicalSheet?.settings_ranges) return true;
    const ranges = technicalSheet.settings_ranges as any;
    const warnings: string[] = [];

    const checkValue = (val: string, range: { min: string; max: string }, label: string) => {
      if (!range) return;
      const numericVal = parseFloat(val);
      const min = parseFloat(range.min);
      const max = parseFloat(range.max);
      if (!isNaN(numericVal) && !isNaN(min) && numericVal < min) warnings.push(`${label} abaixo do recomendado (${min})`);
      if (!isNaN(numericVal) && !isNaN(max) && numericVal > max) warnings.push(`${label} acima do recomendado (${max})`);
    };

    if (state.squeegee_passes) checkValue(state.squeegee_passes, ranges.squeegee_passes, 'Passadas de rodo');
    if (state.pressure) checkValue(state.pressure, ranges.pressure, 'Pressão');
    if (state.speed) checkValue(state.speed, ranges.speed, 'Velocidade');
    if (state.temperature) checkValue(state.temperature, ranges.temperature, 'Temperatura');

    if (warnings.length > 0) {
      warnings.forEach(w => toast.warning(w));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    // Validate ranges but allow submission with confirmation or log as warning
    validateRanges();

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('pre_production_checklists')
        .insert({
          job_id: jobId,
          checked_by: user.id,
          checked_by_name: profile?.full_name || 'Operador',
          material_verified: state.material_verified,
          color_verified: state.color_verified,
          machine_clean: state.machine_clean,
          tools_ready: state.tools_ready,
          squeegee_passes: state.squeegee_passes,
          pressure: state.pressure,
          speed: state.speed,
          temperature: state.temperature,
          technical_sheet_version: technicalSheet?.version || 1,
          consumables_confirmed: state.consumables_confirmed,
          notes: state.notes,
          completed_at: allChecked ? new Date().toISOString() : null,
        });
      if (error) throw error;
      toast.success('Checklist salvo com sucesso!');
      onComplete?.();
    } catch (err) {
      toast.error('Erro ao salvar checklist');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingChecklist) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <span className="text-sm text-success">Checklist pré-produção concluído</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* Basic Checks */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            Verificações Iniciais
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          {checklistItems.map(item => (
            <label
              key={item.key}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                state[item.key] 
                  ? 'bg-success/5 border-success/30' 
                  : 'bg-background/50 border-border hover:border-primary/30'
              )}
            >
              <Checkbox
                checked={state[item.key]}
                onCheckedChange={(checked) => setState(prev => ({ ...prev, [item.key]: !!checked }))}
                className="mt-0.5"
              />
              <div>
                <p className={cn('text-xs font-bold uppercase tracking-tight', state[item.key] && 'text-success')}>
                  {item.label}
                </p>
                <p className="text-[10px] text-muted-foreground">{item.description}</p>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Regulation Parameters */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
            <Settings2 className="h-4 w-4 text-primary" />
            Parâmetros de Regulagem
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {technicalSheet && (
            <div className="mb-4 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-600 font-medium">
              Ficha Técnica: <span className="font-bold">{technicalSheet.title} (v{technicalSheet.version})</span> vinculada.
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Passadas Rodo</Label>
              <Input 
                value={state.squeegee_passes} 
                onChange={e => setState(s => ({...s, squeegee_passes: e.target.value}))}
                placeholder={technicalSheet?.machine_settings ? (technicalSheet.machine_settings as any).squeegee_passes : "Ex: 2"}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Pressão</Label>
              <Input 
                value={state.pressure} 
                onChange={e => setState(s => ({...s, pressure: e.target.value}))}
                placeholder={technicalSheet?.machine_settings ? (technicalSheet.machine_settings as any).pressure : "Ex: 3.5 bar"}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Velocidade</Label>
              <Input 
                value={state.speed} 
                onChange={e => setState(s => ({...s, speed: e.target.value}))}
                placeholder={technicalSheet?.machine_settings ? (technicalSheet.machine_settings as any).speed : "Ex: 80%"}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Temperatura</Label>
              <Input 
                value={state.temperature} 
                onChange={e => setState(s => ({...s, temperature: e.target.value}))}
                placeholder={technicalSheet?.machine_settings ? (technicalSheet.machine_settings as any).temperature : "Ex: 160°C"}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consumables */}
      {state.consumables_confirmed.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
              <Beaker className="h-4 w-4 text-primary" />
              Insumos e Consumíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {state.consumables_confirmed.map((c, idx) => (
              <label key={idx} className="flex items-center gap-2 p-2 rounded border border-border/50 bg-background/50 cursor-pointer">
                <Checkbox 
                  checked={c.confirmed} 
                  onCheckedChange={checked => {
                    const newConsumables = [...state.consumables_confirmed];
                    newConsumables[idx].confirmed = !!checked;
                    setState(s => ({...s, consumables_confirmed: newConsumables}));
                  }}
                />
                <span className="text-[11px] font-medium uppercase">{c.name}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      <Textarea
        placeholder="Observações (opcional)..."
        value={state.notes}
        onChange={(e) => setState(prev => ({ ...prev, notes: e.target.value }))}
        className="h-16 text-sm bg-background/50"
      />

      <div className="flex gap-2 sticky bottom-0 bg-background pt-2">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={cn("flex-1 font-bold uppercase tracking-wider", allChecked ? "gradient-primary" : "bg-muted text-muted-foreground")}
        >
          <ClipboardCheck className="h-4 w-4 mr-2" />
          {allChecked ? 'Confirmar Checklist' : 'Preencher Campos Obrigatórios'}
        </Button>
        {onSkip && (
          <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
            Pular
          </Button>
        )}
      </div>
    </div>
  );
}