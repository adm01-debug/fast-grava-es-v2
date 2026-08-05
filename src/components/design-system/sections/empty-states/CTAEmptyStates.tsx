import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import { Calendar, Plus, MessageSquare, Bell, Settings, MousePointer2 } from 'lucide-react';

export function CTAEmptyStates() {
  return (
    <Card className="card-interactive card-shine">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MousePointer2 className="h-5 w-5 text-primary" />Com Call-to-Action</CardTitle>
        <CardDescription>Estados vazios que incentivam ação do usuário</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-6 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center"><Calendar className="h-7 w-7 text-primary" /></div>
            <div className="space-y-1"><h3 className="font-medium">Nenhum job agendado</h3><p className="text-sm text-muted-foreground">Comece criando seu primeiro job.</p></div>
            <Button variant="gradient" size="sm"><Plus className="h-4 w-4" />Criar Job</Button>
          </div>
          <div className="border rounded-lg p-6 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-info/10 flex items-center justify-center"><MessageSquare className="h-7 w-7 text-info" /></div>
            <div className="space-y-1"><h3 className="font-medium">Sem conversas</h3><p className="text-sm text-muted-foreground">Inicie uma conversa com o assistente.</p></div>
            <Button variant="outline" size="sm"><MessageSquare className="h-4 w-4" />Nova Conversa</Button>
          </div>
          <div className="border rounded-lg p-6 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center"><Bell className="h-7 w-7 text-success" /></div>
            <div className="space-y-1"><h3 className="font-medium">Tudo em dia!</h3><p className="text-sm text-muted-foreground">Você não tem notificações pendentes.</p></div>
            <Button variant="ghost" size="sm"><Settings className="h-4 w-4" />Configurar</Button>
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
          <CodeBlock code={`<div className="border rounded-lg p-6 bg-background/50 flex flex-col items-center text-center space-y-4">
  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
    <Calendar className="h-7 w-7 text-primary" />
  </div>
  <div className="space-y-1">
    <h3 className="font-medium">Nenhum job</h3>
    <p className="text-sm text-muted-foreground">Comece criando seu primeiro job.</p>
  </div>
  <Button variant="gradient" size="sm"><Plus className="h-4 w-4" />Criar Job</Button>
</div>`} label="Com Botão Primário" />
        </div>
      </CardContent>
    </Card>
  );
}
