import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  ListOrdered, 
  Package, 
  Lightbulb
} from 'lucide-react';
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
  useTechnicalSheetDetails, 
  useTechnicalSheetMutations,
  ProductCategory,
  Material
} from '@/hooks/useTechnicalSheets';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TechnicalSheetEditorProps {
  sheetId?: string;
  techniques: Array<{ id: string; name: string; color: string; short_name: string }>;
  categories: ProductCategory[];
  materials: Material[];
  onClose: () => void;
}

export const TechnicalSheetEditor = ({ 
  sheetId, 
  techniques, 
  categories, 
  materials, 
  onClose 
}: TechnicalSheetEditorProps) => {
  const isNew = !sheetId;
  const { sheet, steps, sheetMaterials, tips, isLoading } = useTechnicalSheetDetails(sheetId || null);
  const { 
    createSheet, 
    updateSheet, 
    addStep, 
    updateStep, 
    deleteStep,
    addMaterial,
    deleteMaterial,
    addTip,
    deleteTip
  } = useTechnicalSheetMutations();

  // Form state
  const [formData, setFormData] = useState({
    technique_id: '',
    product_category_id: '',
    material_id: '',
    title: '',
    description: '',
    estimated_time_minutes: '',
    recommended_machine_id: ''
  });

  // New items state
  const [newStep, setNewStep] = useState({ title: '', description: '', tips: '', warnings: '' });
  const [newMaterial, setNewMaterial] = useState({ name: '', specification: '', quantity: '', notes: '' });
  const [newTip, setNewTip] = useState({ tip_type: 'tip' as 'tip' | 'warning' | 'important', content: '' });

  // Fetch machines
  const { data: machines = [] } = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const { data, error } = await supabase.from('machines').select('*').eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  // Load existing data
  useEffect(() => {
    if (sheet) {
      setFormData({
        technique_id: sheet.technique_id,
        product_category_id: sheet.product_category_id || '',
        material_id: sheet.material_id || '',
        title: sheet.title,
        description: sheet.description || '',
        estimated_time_minutes: sheet.estimated_time_minutes?.toString() || '',
        recommended_machine_id: sheet.recommended_machine_id || ''
      });
    }
  }, [sheet]);

  const handleSave = async () => {
    if (!formData.technique_id || !formData.title) {
      toast.error('Preencha a técnica e o título');
      return;
    }

    const payload = {
      technique_id: formData.technique_id,
      title: formData.title,
      description: formData.description || undefined,
      product_category_id: formData.product_category_id || undefined,
      material_id: formData.material_id || undefined,
      estimated_time_minutes: formData.estimated_time_minutes ? parseInt(formData.estimated_time_minutes) : undefined,
      recommended_machine_id: formData.recommended_machine_id || undefined
    };

    if (isNew) {
      await createSheet.mutateAsync(payload);
      onClose();
    } else {
      await updateSheet.mutateAsync({ id: sheetId!, ...payload });
      toast.success('Ficha atualizada!');
    }
  };

  const handleAddStep = async () => {
    if (!sheetId || !newStep.title || !newStep.description) {
      toast.error('Preencha título e descrição do passo');
      return;
    }

    await addStep.mutateAsync({
      technical_sheet_id: sheetId,
      step_number: steps.length + 1,
      title: newStep.title,
      description: newStep.description,
      tips: newStep.tips || undefined,
      warnings: newStep.warnings || undefined
    });

    setNewStep({ title: '', description: '', tips: '', warnings: '' });
  };

  const handleAddMaterial = async () => {
    if (!sheetId || !newMaterial.name) {
      toast.error('Preencha o nome do material');
      return;
    }

    await addMaterial.mutateAsync({
      technical_sheet_id: sheetId,
      name: newMaterial.name,
      specification: newMaterial.specification || undefined,
      quantity: newMaterial.quantity || undefined,
      notes: newMaterial.notes || undefined
    });

    setNewMaterial({ name: '', specification: '', quantity: '', notes: '' });
  };

  const handleAddTip = async () => {
    if (!sheetId || !newTip.content) {
      toast.error('Preencha o conteúdo da dica');
      return;
    }

    await addTip.mutateAsync({
      technical_sheet_id: sheetId,
      tip_type: newTip.tip_type,
      content: newTip.content
    });

    setNewTip({ tip_type: 'tip', content: '' });
  };

  if (isLoading && !isNew) {
    return (
      <Card className="glass-card border-border/50 h-full flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/50 h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {isNew ? 'Nova Ficha Técnica' : 'Editar Ficha Técnica'}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={createSheet.isPending || updateSheet.isPending}>
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Informações Básicas</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Técnica *</Label>
                  <Select 
                    value={formData.technique_id} 
                    onValueChange={(v) => setFormData({...formData, technique_id: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a técnica" />
                    </SelectTrigger>
                    <SelectContent>
                      {techniques.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                            {t.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Categoria de Produto</Label>
                  <Select 
                    value={formData.product_category_id} 
                    onValueChange={(v) => setFormData({...formData, product_category_id: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Material</Label>
                  <Select 
                    value={formData.material_id} 
                    onValueChange={(v) => setFormData({...formData, material_id: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Máquina Recomendada</Label>
                  <Select 
                    value={formData.recommended_machine_id} 
                    onValueChange={(v) => setFormData({...formData, recommended_machine_id: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a máquina" />
                    </SelectTrigger>
                    <SelectContent>
                      {machines.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name} ({m.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título *</Label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Serigrafia em Camiseta 100% Algodão"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descrição geral do processo..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Tempo Estimado (minutos)</Label>
                <Input 
                  type="number"
                  value={formData.estimated_time_minutes}
                  onChange={(e) => setFormData({...formData, estimated_time_minutes: e.target.value})}
                  placeholder="Ex: 30"
                />
              </div>
            </div>

            {/* Steps, Materials, Tips - only show for existing sheets */}
            {!isNew && sheetId && (
              <>
                <Separator />

                {/* Steps */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <ListOrdered className="h-4 w-4 text-primary" />
                    Passos do Processo ({steps.length})
                  </h3>

                  {steps.map((step, idx) => (
                    <div key={step.id} className="p-3 rounded-lg bg-muted/20 border border-border/30 flex items-start gap-2">
                      <Badge className="mt-1">{step.step_number}</Badge>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{step.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover passo?</AlertDialogTitle>
                            <AlertDialogDescription>
                              O passo "{step.title}" será removido permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteStep.mutate(step.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}

                  <div className="p-4 rounded-lg border border-dashed border-border/50 space-y-3">
                    <p className="text-xs text-muted-foreground">Adicionar novo passo:</p>
                    <Input 
                      placeholder="Título do passo"
                      value={newStep.title}
                      onChange={(e) => setNewStep({...newStep, title: e.target.value})}
                    />
                    <Textarea 
                      placeholder="Descrição detalhada..."
                      value={newStep.description}
                      onChange={(e) => setNewStep({...newStep, description: e.target.value})}
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        placeholder="Dica (opcional)"
                        value={newStep.tips}
                        onChange={(e) => setNewStep({...newStep, tips: e.target.value})}
                      />
                      <Input 
                        placeholder="Aviso (opcional)"
                        value={newStep.warnings}
                        onChange={(e) => setNewStep({...newStep, warnings: e.target.value})}
                      />
                    </div>
                    <Button size="sm" onClick={handleAddStep} disabled={addStep.isPending}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Passo
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Materials */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4 text-cyan-400" />
                    Materiais e Insumos ({sheetMaterials.length})
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {sheetMaterials.map(m => (
                      <Badge key={m.id} variant="secondary" className="gap-1">
                        {m.name}
                        {m.quantity && <span className="text-muted-foreground">({m.quantity})</span>}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="ml-1 hover:text-destructive">
                              <X className="h-3 w-3" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover material?</AlertDialogTitle>
                              <AlertDialogDescription>
                                O material "{m.name}" será removido da ficha.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMaterial.mutate(m.id)}>
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </Badge>
                    ))}
                  </div>

                  <div className="p-4 rounded-lg border border-dashed border-border/50 space-y-3">
                    <p className="text-xs text-muted-foreground">Adicionar material:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        placeholder="Nome do material"
                        value={newMaterial.name}
                        onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                      />
                      <Input 
                        placeholder="Quantidade"
                        value={newMaterial.quantity}
                        onChange={(e) => setNewMaterial({...newMaterial, quantity: e.target.value})}
                      />
                    </div>
                    <Button size="sm" onClick={handleAddMaterial} disabled={addMaterial.isPending}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Material
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Tips */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-accent-foreground" />
                    Dicas e Observações ({tips.length})
                  </h3>

                  <div className="space-y-2">
                    {tips.map(tip => (
                      <div key={tip.id} className="p-2 rounded bg-muted/20 flex items-center justify-between gap-2">
                        <Badge variant={tip.tip_type === 'warning' ? 'destructive' : tip.tip_type === 'important' ? 'default' : 'secondary'}>
                          {tip.tip_type}
                        </Badge>
                        <span className="text-sm flex-1">{tip.content}</span>
                        <button onClick={() => deleteTip.mutate(tip.id)} className="hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-lg border border-dashed border-border/50 space-y-3">
                    <p className="text-xs text-muted-foreground">Adicionar dica:</p>
                    <div className="flex gap-2">
                      <Select 
                        value={newTip.tip_type} 
                        onValueChange={(v: 'tip' | 'warning' | 'important') => setNewTip({...newTip, tip_type: v})}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tip">Dica</SelectItem>
                          <SelectItem value="warning">Aviso</SelectItem>
                          <SelectItem value="important">Importante</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input 
                        className="flex-1"
                        placeholder="Conteúdo da dica..."
                        value={newTip.content}
                        onChange={(e) => setNewTip({...newTip, content: e.target.value})}
                      />
                      <Button size="sm" onClick={handleAddTip} disabled={addTip.isPending}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {isNew && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                <p>Salve a ficha para adicionar passos, materiais e dicas.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
