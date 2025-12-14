import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function NewJobPage() {
  const navigate = useNavigate();
  const { techniques, machines, getMachinesByTechnique, refetchJobs } = useSchedulingData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    order_number: '',
    client: '',
    product: '',
    quantity: '',
    technique_id: '',
    machine_id: '',
    start_time: '',
    end_time: '',
    notes: '',
    priority: 'medium',
    gravure_color: '',
  });

  const availableMachines = formData.technique_id 
    ? getMachinesByTechnique(formData.technique_id)
    : [];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset machine when technique changes
    if (field === 'technique_id') {
      setFormData(prev => ({ ...prev, machine_id: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.order_number || !formData.client || !formData.product || !formData.quantity || !formData.technique_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('jobs').insert({
        order_number: formData.order_number,
        client: formData.client,
        product: formData.product,
        quantity: parseInt(formData.quantity),
        technique_id: formData.technique_id,
        machine_id: formData.machine_id || null,
        scheduled_date: date ? format(date, 'yyyy-MM-dd') : null,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        notes: formData.notes || null,
        priority: formData.priority,
        gravure_color: formData.gravure_color || null,
        status: 'queue',
      });

      if (error) throw error;

      toast.success('Job criado com sucesso!');
      refetchJobs();
      navigate('/');
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Erro ao criar job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold gradient-text">Novo Agendamento</h1>
            <p className="text-muted-foreground">Cadastre um novo job de produção</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Informações do Job</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order_number">Número da OS *</Label>
                  <Input
                    id="order_number"
                    placeholder="Ex: OS-2024-001"
                    value={formData.order_number}
                    onChange={(e) => handleChange('order_number', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente *</Label>
                  <Input
                    id="client"
                    placeholder="Nome do cliente"
                    value={formData.client}
                    onChange={(e) => handleChange('client', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Produto *</Label>
                  <Input
                    id="product"
                    placeholder="Descrição do produto"
                    value={formData.product}
                    onChange={(e) => handleChange('product', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 3 - Technique & Machine */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Técnica *</Label>
                  <Select value={formData.technique_id} onValueChange={(v) => handleChange('technique_id', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a técnica" />
                    </SelectTrigger>
                    <SelectContent>
                      {techniques.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Máquina</Label>
                  <Select 
                    value={formData.machine_id} 
                    onValueChange={(v) => handleChange('machine_id', v)}
                    disabled={!formData.technique_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.technique_id ? "Selecione a máquina" : "Selecione uma técnica primeiro"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMachines.map((machine) => (
                        <SelectItem key={machine.id} value={machine.id}>
                          {machine.code} - {machine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4 - Date & Times */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Data Agendada</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time">Hora Início</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleChange('start_time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Hora Fim</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleChange('end_time', e.target.value)}
                  />
                </div>
              </div>

              {/* Row 5 - Priority & Color */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gravure_color">Cor da Gravação</Label>
                  <Input
                    id="gravure_color"
                    placeholder="Ex: Preto, Branco, CMYK"
                    value={formData.gravure_color}
                    onChange={(e) => handleChange('gravure_color', e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações adicionais sobre o job..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancelar
                </Button>
                <Button type="submit" className="gradient-primary" disabled={isSubmitting}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Criando...' : 'Criar Job'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}
