import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical, 
  X, 
  ClipboardList,
  Save,
  Copy
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChecklistTemplate } from '@/hooks/useShiftHandover';

interface TemplateItem {
  description: string;
  order: number;
}

interface TemplateFormData {
  name: string;
  description: string;
  technique_id: string;
  items: TemplateItem[];
  is_active: boolean;
}

const TECHNIQUE_LABELS: Record<string, string> = {
  serigrafia: 'Serigrafia',
  tampografia: 'Tampografia',
  laser: 'Laser',
  transfer: 'Transfer',
  bordado: 'Bordado',
  sublimacao: 'Sublimação',
  gravacao: 'Gravação'
};

export default function ChecklistTemplatesManager() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    technique_id: '',
    items: [{ description: '', order: 0 }],
    is_active: true
  });
  const [newItemText, setNewItemText] = useState('');

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['checklist-templates-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_checklist_templates')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as ChecklistTemplate[];
    }
  });

  // Fetch techniques
  const { data: techniques } = useQuery({
    queryKey: ['techniques'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('techniques')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Create template mutation
  const createTemplate = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const itemsJson = data.items.filter(i => i.description.trim()).map(i => ({
        description: i.description,
        order: i.order
      }));
      
      const { error } = await supabase
        .from('shift_checklist_templates')
        .insert({
          name: data.name,
          description: data.description || null,
          technique_id: data.technique_id || null,
          items: itemsJson as unknown as import('@/integrations/supabase/types').Json,
          is_active: data.is_active
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      queryClient.invalidateQueries({ queryKey: ['checklist-templates-all'] });
      toast.success('Template criado com sucesso');
      setShowAddModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Erro ao criar template: ' + error.message);
    }
  });

  // Update template mutation
  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...data }: TemplateFormData & { id: string }) => {
      const itemsJson = data.items.filter(i => i.description.trim()).map(i => ({
        description: i.description,
        order: i.order
      }));
      
      const { error } = await supabase
        .from('shift_checklist_templates')
        .update({
          name: data.name,
          description: data.description || null,
          technique_id: data.technique_id || null,
          items: itemsJson as unknown as import('@/integrations/supabase/types').Json,
          is_active: data.is_active
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      queryClient.invalidateQueries({ queryKey: ['checklist-templates-all'] });
      toast.success('Template atualizado');
      setEditingTemplate(null);
      resetForm();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    }
  });

  // Delete template mutation
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shift_checklist_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      queryClient.invalidateQueries({ queryKey: ['checklist-templates-all'] });
      toast.success('Template removido');
      setDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error('Erro ao remover: ' + error.message);
    }
  });

  // Duplicate template mutation
  const duplicateTemplate = useMutation({
    mutationFn: async (template: ChecklistTemplate) => {
      const { error } = await supabase
        .from('shift_checklist_templates')
        .insert({
          name: `${template.name} (Cópia)`,
          description: template.description || null,
          technique_id: template.technique_id || null,
          items: template.items as unknown as import('@/integrations/supabase/types').Json,
          is_active: true
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      queryClient.invalidateQueries({ queryKey: ['checklist-templates-all'] });
      toast.success('Template duplicado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao duplicar template: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      technique_id: '',
      items: [{ description: '', order: 0 }],
      is_active: true
    });
    setNewItemText('');
  };

  const openEditModal = (template: ChecklistTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      technique_id: template.technique_id || '',
      items: template.items.length > 0 ? template.items : [{ description: '', order: 0 }],
      is_active: template.is_active
    });
  };

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

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Nome do template é obrigatório');
      return;
    }

    const validItems = formData.items.filter(i => i.description.trim());
    if (validItems.length === 0) {
      toast.error('Adicione pelo menos um item ao checklist');
      return;
    }

    if (editingTemplate) {
      updateTemplate.mutate({ ...formData, id: editingTemplate.id });
    } else {
      createTemplate.mutate(formData);
    }
  };

  const TemplateForm = () => (
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
        <Button 
          variant="outline" 
          onClick={() => {
            setShowAddModal(false);
            setEditingTemplate(null);
            resetForm();
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={createTemplate.isPending || updateTemplate.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {editingTemplate ? 'Atualizar' : 'Criar'} Template
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Templates de Checklist
            </CardTitle>
            <CardDescription>
              Gerencie os templates de checklist para passagem de turno
            </CardDescription>
          </div>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Template de Checklist</DialogTitle>
                <DialogDescription>
                  Crie um template de checklist para usar nas passagens de turno
                </DialogDescription>
              </DialogHeader>
              <TemplateForm />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : templates && templates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className={!template.is_active ? 'opacity-60' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      {template.description && (
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => duplicateTemplate.mutate(template)}
                        disabled={duplicateTemplate.isPending}
                        title="Duplicar template"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => openEditModal(template)}
                        title="Editar template"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteConfirm(template.id)}
                        title="Excluir template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {template.technique_id && (
                      <Badge variant="secondary">
                        {TECHNIQUE_LABELS[template.technique_id] || template.technique_id}
                      </Badge>
                    )}
                    {!template.is_active && (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                    <Badge variant="outline" className="ml-auto">
                      {template.items.length} itens
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1 max-h-[120px] overflow-y-auto">
                    {template.items.slice(0, 4).map((item, idx) => (
                      <p key={idx} className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <span className="truncate">{item.description}</span>
                      </p>
                    ))}
                    {template.items.length > 4 && (
                      <p className="text-xs text-muted-foreground">
                        +{template.items.length - 4} itens...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg">Nenhum template criado</h3>
            <p className="text-muted-foreground mb-4">
              Crie templates de checklist para agilizar as passagens de turno
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Template
            </Button>
          </div>
        )}
      </CardContent>

      {/* Edit Modal */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
            <DialogDescription>
              Modifique o template de checklist
            </DialogDescription>
          </DialogHeader>
          <TemplateForm />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteTemplate.mutate(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
