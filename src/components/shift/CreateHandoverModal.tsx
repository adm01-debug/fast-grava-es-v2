import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, GripVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useShiftHandoverMutations, useChecklistTemplates, SHIFT_TYPE_LABELS, getCurrentShiftType } from '@/hooks/useShiftHandover';

const formSchema = z.object({
  shift_type: z.enum(['morning', 'afternoon', 'night']),
  machine_id: z.string().optional(),
  general_notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machines: { id: string; name: string; code: string }[];
}

const DEFAULT_CHECKLIST = [
  'Verificar estado geral da máquina',
  'Checar níveis de óleo e lubrificantes',
  'Conferir materiais em uso',
  'Verificar jobs pendentes',
  'Registrar produção do turno',
  'Reportar problemas identificados',
  'Limpar área de trabalho'
];

export default function CreateHandoverModal({ open, onOpenChange, machines }: Props) {
  const { createHandover } = useShiftHandoverMutations();
  const { data: templates } = useChecklistTemplates();
  const [checklistItems, setChecklistItems] = useState<string[]>(DEFAULT_CHECKLIST);
  const [newItem, setNewItem] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shift_type: getCurrentShiftType(),
      machine_id: '',
      general_notes: ''
    }
  });

  const handleAddItem = () => {
    if (newItem.trim()) {
      setChecklistItems([...checklistItems, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      const items = template.items.map(i => i.description);
      setChecklistItems(items);
    }
  };

  const onSubmit = async (data: FormData) => {
    await createHandover.mutateAsync({
      shift_type: data.shift_type,
      machine_id: data.machine_id || null,
      general_notes: data.general_notes,
      checklist_items: checklistItems
    });
    
    onOpenChange(false);
    form.reset();
    setChecklistItems(DEFAULT_CHECKLIST);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Iniciar Passagem de Turno</DialogTitle>
          <DialogDescription>
            Preencha as informações para iniciar a passagem de turno
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shift_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turno</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o turno" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(SHIFT_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="machine_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máquina (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a máquina" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhuma (geral)</SelectItem>
                        {machines.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name} ({m.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="general_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações gerais</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Adicione observações importantes para a passagem..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Checklist Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Checklist de Passagem</FormLabel>
                {templates && templates.length > 0 && (
                  <Select onValueChange={handleApplyTemplate}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Usar template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="border rounded-lg p-4 space-y-2 max-h-[200px] overflow-y-auto">
                {checklistItems.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-2 bg-muted/50 rounded-md group"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{item}</span>
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
                  placeholder="Adicionar item ao checklist..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createHandover.isPending}>
                {createHandover.isPending ? 'Iniciando...' : 'Iniciar Passagem'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
