import { Plus, X, GripVertical, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface TemplateItem {
  description: string;
  order: number;
}

export interface TemplateFormData {
  name: string;
  description: string;
  technique_id: string;
  items: TemplateItem[];
  is_active: boolean;
}

interface TemplateFormProps {
  formData: TemplateFormData;
  setFormData: React.Dispatch<React.SetStateAction<TemplateFormData>>;
  techniques: Array<{ id: string; name: string }> | undefined;
  isEditing: boolean;
  isPending: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function TemplateForm({
  formData,
  setFormData,
  techniques,
  isEditing,
  isPending,
  onSubmit,
  onCancel,
}: TemplateFormProps) {
  const [newItemText, setNewItemText] = useState('');

  const handleAddItem = () => {
    if (newItemText.trim()) {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { description: newItemText.trim(), order: prev.items.length }]
      }));
      setNewItemText('');
    }
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i }))
    }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome do Template *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Checklist Serigrafia"
          />
        </div>
        <div className="space-y-2">
          <Label>Técnica (opcional)</Label>
          <Select 
            value={formData.technique_id}
            onValueChange={(v) => setFormData(prev => ({ ...prev, technique_id: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a técnica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhuma (Geral)</SelectItem>
              {techniques?.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descrição do template..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Itens do Checklist</Label>
        <div className="border rounded-lg p-3 space-y-2 max-h-[250px] overflow-y-auto">
          {formData.items.map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 p-2 bg-muted/50 rounded-md group"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm">{item.description || '(vazio)'}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveItem(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Novo item do checklist..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={handleAddItem}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label>Template ativo</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSubmit} disabled={isPending}>
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Atualizar' : 'Criar'} Template
        </Button>
      </div>
    </div>
  );
}

import { useState } from 'react';
