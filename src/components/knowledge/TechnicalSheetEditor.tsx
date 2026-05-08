import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Save, X } from 'lucide-react';
import { useTechnicalSheetDetails, useTechnicalSheetMutations, ProductCategory, Material } from '@/hooks/useTechnicalSheets';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EditorBasicInfo } from './editor/EditorBasicInfo';
import { EditorStepsSection } from './editor/EditorStepsSection';
import { EditorMaterialsSection } from './editor/EditorMaterialsSection';
import { EditorTipsSection } from './editor/EditorTipsSection';

interface TechnicalSheetEditorProps {
  sheetId?: string;
  techniques: Array<{ id: string; name: string; color: string; short_name: string }>;
  categories: ProductCategory[];
  materials: Material[];
  onClose: () => void;
}

export const TechnicalSheetEditor = ({ sheetId, techniques, categories, materials, onClose }: TechnicalSheetEditorProps) => {
  const isNew = !sheetId;
  const { sheet, steps, sheetMaterials, tips, isLoading } = useTechnicalSheetDetails(sheetId || null);
  const { createSheet, updateSheet, addStep, deleteStep, addMaterial, deleteMaterial, addTip, deleteTip } = useTechnicalSheetMutations();

  const [formData, setFormData] = useState({
    technique_id: '', product_category_id: '', material_id: '',
    title: '', description: '', estimated_time_minutes: '', recommended_machine_id: '',
    ink_specifications: '', tooling_specifications: '',
    squeegee_passes: '', pressure: '', speed: '', temperature: ''
  });

  const { data: machines = [] } = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const { data, error } = await supabase.from('machines').select('*').eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (sheet) {
      setFormData({
        technique_id: sheet.technique_id,
        product_category_id: sheet.product_category_id || '',
        material_id: sheet.material_id || '',
        title: sheet.title,
        description: sheet.description || '',
        estimated_time_minutes: sheet.estimated_time_minutes?.toString() || '',
        recommended_machine_id: sheet.recommended_machine_id || '',
        ink_specifications: sheet.ink_specifications || '',
        tooling_specifications: sheet.tooling_specifications || '',
        squeegee_passes: (sheet.machine_settings as any)?.squeegee_passes || '',
        pressure: (sheet.machine_settings as any)?.pressure || '',
        speed: (sheet.machine_settings as any)?.speed || '',
        temperature: (sheet.machine_settings as any)?.temperature || '',
      });
    }
  }, [sheet]);

  const handleSave = async () => {
    if (!formData.technique_id || !formData.title) { toast.error('Preencha a técnica e o título'); return; }
    const payload = {
      technique_id: formData.technique_id, title: formData.title,
      description: formData.description || undefined,
      product_category_id: formData.product_category_id || undefined,
      material_id: formData.material_id || undefined,
      estimated_time_minutes: formData.estimated_time_minutes ? parseInt(formData.estimated_time_minutes) : undefined,
      recommended_machine_id: formData.recommended_machine_id || undefined,
      ink_specifications: formData.ink_specifications || undefined,
      tooling_specifications: formData.tooling_specifications || undefined,
      machine_settings: {
        squeegee_passes: formData.squeegee_passes,
        pressure: formData.pressure,
        speed: formData.speed,
        temperature: formData.temperature,
      }
    };
    if (isNew) { await createSheet.mutateAsync(payload); onClose(); }
    else { await updateSheet.mutateAsync({ id: sheetId!, ...payload }); toast.success('Ficha atualizada!'); }
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
          <CardTitle className="text-lg">{isNew ? 'Nova Ficha Técnica' : 'Editar Ficha Técnica'}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}><X className="h-4 w-4 mr-1" />Cancelar</Button>
            <Button size="sm" onClick={handleSave} disabled={createSheet.isPending || updateSheet.isPending}><Save className="h-4 w-4 mr-1" />Salvar</Button>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <EditorBasicInfo formData={formData} setFormData={setFormData} techniques={techniques} categories={categories} materials={materials} machines={machines} />

            {!isNew && sheetId && (
              <>
                <Separator />
                <EditorStepsSection steps={steps} sheetId={sheetId} onAddStep={(s) => addStep.mutateAsync(s)} onDeleteStep={(id) => deleteStep.mutate(id)} isAdding={addStep.isPending} />
                <Separator />
                <EditorMaterialsSection materials={sheetMaterials} sheetId={sheetId} onAdd={(m) => addMaterial.mutateAsync(m)} onDelete={(id) => deleteMaterial.mutate(id)} isAdding={addMaterial.isPending} />
                <Separator />
                <EditorTipsSection tips={tips} sheetId={sheetId} onAdd={(t) => addTip.mutateAsync(t)} onDelete={(id) => deleteTip.mutate(id)} isAdding={addTip.isPending} />
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
