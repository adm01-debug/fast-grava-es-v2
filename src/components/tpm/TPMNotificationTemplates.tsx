import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Save, Mail, MessageCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface Template {
  id: string;
  channel: 'email' | 'whatsapp' | 'push';
  severity: 'upcoming' | 'due' | 'overdue' | 'critical';
  subject: string | null;
  template_body: string;
}

export function TPMNotificationTemplates() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>('email');

  const { data: templates, isLoading } = useQuery({
    queryKey: ['tpm-notification-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tpm_notification_templates')
        .select('*');
      if (error) throw error;
      return data as Template[];
    }
  });

  const updateTemplate = useMutation({
    mutationFn: async (template: Partial<Template> & { id: string }) => {
      const { error } = await supabase
        .from('tpm_notification_templates')
        .update(template)
        .eq('id', template.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tpm-notification-templates'] });
      toast.success('Template atualizado com sucesso');
    }
  });

  if (isLoading) return <div>Carregando templates...</div>;

  const renderTemplateEditor = (severity: Template['severity']) => {
    const template = templates?.find(t => t.channel === activeTab && t.severity === severity);
    if (!template) return null;

    return (
      <div className="space-y-4 p-4 border rounded-lg bg-secondary/5 mb-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="capitalize">{severity}</Badge>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => {
              const subject = (document.getElementById(`subject-${template.id}`) as HTMLInputElement)?.value;
              const body = (document.getElementById(`body-${template.id}`) as HTMLTextAreaElement)?.value;
              updateTemplate.mutate({ id: template.id, subject, template_body: body });
            }}
          >
            <Save className="h-4 w-4 mr-2" /> Salvar
          </Button>
        </div>
        
        {activeTab === 'email' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Assunto</label>
            <Input 
              id={`subject-${template.id}`}
              defaultValue={template.subject || ''} 
              placeholder="Assunto do e-mail"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Corpo do Template</label>
          <Textarea 
            id={`body-${template.id}`}
            defaultValue={template.template_body}
            rows={4}
            className="font-mono text-sm"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-3 bg-blue-500/10 text-blue-500 rounded-lg text-sm border border-blue-500/20">
        <Info className="h-4 w-4 shrink-0" />
        <p>Variáveis disponíveis: <code>{"{{machine_name}}"}</code>, <code>{"{{machine_code}}"}</code>, <code>{"{{due_date}}"}</code>, <code>{"{{days}}"}</code>, <code>{"{{message}}"}</code></p>
      </div>

      <Tabs defaultValue="email" onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> E-mail
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-4">
          {renderTemplateEditor('upcoming')}
          {renderTemplateEditor('due')}
          {renderTemplateEditor('overdue')}
          {renderTemplateEditor('critical')}
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-4">
          {renderTemplateEditor('upcoming')}
          {renderTemplateEditor('due')}
          {renderTemplateEditor('overdue')}
          {renderTemplateEditor('critical')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
