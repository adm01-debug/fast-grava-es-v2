import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductCategory, Material } from '@/hooks/useTechnicalSheets';
import { Info } from 'lucide-react';

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
    squeegee_passes_min: string;
    squeegee_passes_max: string;
    pressure_min: string;
    pressure_max: string;
    speed_min: string;
    speed_max: string;
    temperature_min: string;
    temperature_max: string;
    gap_specifications: string;
    challenges_notes: string;
    failure_scenarios: string;
    quality_requirements: string;
    version: string;
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 space-y-2">
          <Label>Título *</Label>
          <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Ex: Serigrafia em Camiseta 100% Algodão" />
        </div>
        <div className="space-y-2">
          <Label>Versão</Label>
          <Input value={formData.version} disabled className="bg-muted" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Descrição geral do processo..." rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Tempo Estimado (minutos)</Label>
        <Input type="number" value={formData.estimated_time_minutes} onChange={(e) => setFormData({...formData, estimated_time_minutes: e.target.value})} placeholder="Ex: 30" />
      </div>

      <Separator className="my-6" />
      
      <div className="space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          Configurações Técnicas e Regulagem
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Especificação de Tinta / Solventes</Label>
            <Input 
              value={formData.ink_specifications} 
              onChange={(e) => setFormData({...formData, ink_specifications: e.target.value})} 
              placeholder="Ex: Tinta Vinílica Branca + 10% Retardador" 
            />
          </div>
          <div className="space-y-2">
            <Label>Ferramental (Rodo, Lâmina, etc.)</Label>
            <Input 
              value={formData.tooling_specifications} 
              onChange={(e) => setFormData({...formData, tooling_specifications: e.target.value})} 
              placeholder="Ex: Rodo Poliuretano 70 shores" 
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Passadas (Rodo)</Label>
              <Input 
                value={formData.squeegee_passes} 
                onChange={(e) => setFormData({...formData, squeegee_passes: e.target.value})} 
                placeholder="Valor" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Mínimo</Label>
              <Input 
                value={formData.squeegee_passes_min} 
                onChange={(e) => setFormData({...formData, squeegee_passes_min: e.target.value})} 
                placeholder="Mín" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Máximo</Label>
              <Input 
                value={formData.squeegee_passes_max} 
                onChange={(e) => setFormData({...formData, squeegee_passes_max: e.target.value})} 
                placeholder="Máx" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Pressão</Label>
              <Input 
                value={formData.pressure} 
                onChange={(e) => setFormData({...formData, pressure: e.target.value})} 
                placeholder="Valor" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Mínimo</Label>
              <Input 
                value={formData.pressure_min} 
                onChange={(e) => setFormData({...formData, pressure_min: e.target.value})} 
                placeholder="Mín" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Máximo</Label>
              <Input 
                value={formData.pressure_max} 
                onChange={(e) => setFormData({...formData, pressure_max: e.target.value})} 
                placeholder="Máx" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Velocidade</Label>
              <Input 
                value={formData.speed} 
                onChange={(e) => setFormData({...formData, speed: e.target.value})} 
                placeholder="Valor" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Mínimo</Label>
              <Input 
                value={formData.speed_min} 
                onChange={(e) => setFormData({...formData, speed_min: e.target.value})} 
                placeholder="Mín" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Máximo</Label>
              <Input 
                value={formData.speed_max} 
                onChange={(e) => setFormData({...formData, speed_max: e.target.value})} 
                placeholder="Máx" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Temperatura</Label>
              <Input 
                value={formData.temperature} 
                onChange={(e) => setFormData({...formData, temperature: e.target.value})} 
                placeholder="Valor" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Mínimo</Label>
              <Input 
                value={formData.temperature_min} 
                onChange={(e) => setFormData({...formData, temperature_min: e.target.value})} 
                placeholder="Mín" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Máximo</Label>
              <Input 
                value={formData.temperature_max} 
                onChange={(e) => setFormData({...formData, temperature_max: e.target.value})} 
                placeholder="Máx" 
              />
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            Orientações de Produção e Qualidade
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>GAP / Distanciamento</Label>
              <Input 
                value={formData.gap_specifications} 
                onChange={(e) => setFormData({...formData, gap_specifications: e.target.value})} 
                placeholder="Ex: GAP de 3mm entre tela e substrato" 
              />
            </div>
            <div className="space-y-2">
              <Label>Requisitos de Qualidade</Label>
              <Input 
                value={formData.quality_requirements} 
                onChange={(e) => setFormData({...formData, quality_requirements: e.target.value})} 
                placeholder="Ex: Sem rebarbas, brilho uniforme" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Desafios e Pontos de Atenção</Label>
            <Textarea 
              value={formData.challenges_notes} 
              onChange={(e) => setFormData({...formData, challenges_notes: e.target.value})} 
              placeholder="Descreva os principais desafios técnicos deste trabalho..." 
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Cenários de Falha (O que evitar)</Label>
            <Textarea 
              value={formData.failure_scenarios} 
              onChange={(e) => setFormData({...formData, failure_scenarios: e.target.value})} 
              placeholder="Descreva situações que levam à perda de peças..." 
              rows={2}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

import { Separator } from '@/components/ui/separator';
