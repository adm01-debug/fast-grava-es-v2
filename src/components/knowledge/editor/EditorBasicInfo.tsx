import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductCategory, Material } from '@/hooks/useTechnicalSheets';

interface EditorBasicInfoProps {
  formData: {
    technique_id: string;
    product_category_id: string;
    material_id: string;
    title: string;
    description: string;
    estimated_time_minutes: string;
    recommended_machine_id: string;
    ink_specifications: string;
    tooling_specifications: string;
    squeegee_passes: string;
    pressure: string;
    speed: string;
    temperature: string;
  };
  setFormData: (data: any) => void;
  techniques: Array<{ id: string; name: string; color: string; short_name: string }>;
  categories: ProductCategory[];
  materials: Material[];
  machines: Array<{ id: string; name: string; code: string }>;
}

export function EditorBasicInfo({ formData, setFormData, techniques, categories, materials, machines }: EditorBasicInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Informações Básicas</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Técnica *</Label>
          <Select value={formData.technique_id} onValueChange={(v) => setFormData({...formData, technique_id: v})}>
            <SelectTrigger><SelectValue placeholder="Selecione a técnica" /></SelectTrigger>
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
          <Select value={formData.product_category_id} onValueChange={(v) => setFormData({...formData, product_category_id: v})}>
            <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Material</Label>
          <Select value={formData.material_id} onValueChange={(v) => setFormData({...formData, material_id: v})}>
            <SelectTrigger><SelectValue placeholder="Selecione o material" /></SelectTrigger>
            <SelectContent>
              {materials.map(m => (<SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Máquina Recomendada</Label>
          <Select value={formData.recommended_machine_id} onValueChange={(v) => setFormData({...formData, recommended_machine_id: v})}>
            <SelectTrigger><SelectValue placeholder="Selecione a máquina" /></SelectTrigger>
            <SelectContent>
              {machines.map(m => (<SelectItem key={m.id} value={m.id}>{m.name} ({m.code})</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Título *</Label>
        <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Ex: Serigrafia em Camiseta 100% Algodão" />
      </div>
      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Descrição geral do processo..." rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Tempo Estimado (minutos)</Label>
        <Input type="number" value={formData.estimated_time_minutes} onChange={(e) => setFormData({...formData, estimated_time_minutes: e.target.value})} placeholder="Ex: 30" />
      </div>
    </div>
  );
}
