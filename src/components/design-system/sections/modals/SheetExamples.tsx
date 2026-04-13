import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodeBlock } from '@/components/ui/code-block';
import { Bell, FileText, Layers, Plus, Scan, Zap } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function SheetExamples() {
  return (
    <>
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-primary" />Sheet (Drawer)</CardTitle>
          <CardDescription>Painéis deslizantes para conteúdo secundário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Sheet>
              <SheetTrigger asChild><Button variant="outline">Sheet Direita</Button></SheetTrigger>
              <SheetContent side="right">
                <SheetHeader><SheetTitle>Configurações</SheetTitle><SheetDescription>Ajuste as configurações da sua conta aqui.</SheetDescription></SheetHeader>
                <div className="space-y-6 py-6">
                  <div className="space-y-2"><Label htmlFor="sheet-name">Nome</Label><Input id="sheet-name" placeholder="Seu nome" /></div>
                  <div className="space-y-2"><Label htmlFor="sheet-email">Email</Label><Input id="sheet-email" type="email" placeholder="email@exemplo.com" /></div>
                  <div className="flex items-center justify-between"><Label htmlFor="sheet-notifications">Notificações</Label><Switch id="sheet-notifications" /></div>
                  <div className="flex items-center justify-between"><Label htmlFor="sheet-dark">Modo Escuro</Label><Switch id="sheet-dark" defaultChecked /></div>
                </div>
                <div className="flex gap-3"><Button variant="gradient" className="flex-1">Salvar</Button></div>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild><Button variant="outline">Sheet Esquerda</Button></SheetTrigger>
              <SheetContent side="left">
                <SheetHeader><SheetTitle>Menu de Navegação</SheetTitle><SheetDescription>Acesse rapidamente as principais seções.</SheetDescription></SheetHeader>
                <div className="space-y-2 py-6">
                  {['Dashboard', 'Produção', 'Kanban', 'Calendário', 'Alertas', 'KPIs'].map((item) => (
                    <Button key={item} variant="ghost" className="w-full justify-start gap-2"><Zap className="h-4 w-4" />{item}</Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild><Button variant="outline">Sheet Topo</Button></SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <SheetHeader><SheetTitle>Notificação</SheetTitle><SheetDescription>Você tem novas atualizações disponíveis.</SheetDescription></SheetHeader>
                <div className="flex gap-3 py-4"><Button variant="gradient">Ver Atualizações</Button><Button variant="outline">Mais Tarde</Button></div>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild><Button variant="outline">Sheet Inferior</Button></SheetTrigger>
              <SheetContent side="bottom" className="h-auto">
                <SheetHeader><SheetTitle>Ações Rápidas</SheetTitle><SheetDescription>Escolha uma ação para executar.</SheetDescription></SheetHeader>
                <div className="grid grid-cols-3 gap-3 py-6">
                  <Button variant="outline" className="flex-col h-auto py-4 gap-2"><Plus className="h-6 w-6" /><span className="text-xs">Novo Job</span></Button>
                  <Button variant="outline" className="flex-col h-auto py-4 gap-2"><Scan className="h-6 w-6" /><span className="text-xs">Escanear QR</span></Button>
                  <Button variant="outline" className="flex-col h-auto py-4 gap-2"><Bell className="h-6 w-6" /><span className="text-xs">Alertas</span></Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock label="Sheet" code={`<Sheet>
  <SheetTrigger asChild><Button>Abrir Sheet</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Título</SheetTitle>
      <SheetDescription>Descrição aqui.</SheetDescription>
    </SheetHeader>
    <div className="py-6">{/* Conteúdo */}</div>
  </SheetContent>
</Sheet>`} />
          </div>
        </CardContent>
      </Card>

      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Sheet com Formulário</CardTitle>
          <CardDescription>Exemplo de sheet com formulário completo</CardDescription>
        </CardHeader>
        <CardContent>
          <Sheet>
            <SheetTrigger asChild><Button variant="gradient">Adicionar Novo Trabalho</Button></SheetTrigger>
            <SheetContent side="right" className="sm:max-w-lg">
              <SheetHeader><SheetTitle>Novo Trabalho</SheetTitle><SheetDescription>Preencha os dados para criar um novo trabalho de produção.</SheetDescription></SheetHeader>
              <div className="space-y-4 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Número do Pedido</Label><Input placeholder="ORD-2024-XXX" /></div>
                  <div className="space-y-2"><Label>Prioridade</Label><Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="urgent">Urgente</SelectItem></SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label>Cliente</Label><Input placeholder="Nome do cliente" /></div>
                <div className="space-y-2"><Label>Produto</Label><Input placeholder="Descrição do produto" /></div>
                <div className="space-y-2"><Label>Técnica</Label><Select><SelectTrigger><SelectValue placeholder="Selecione a técnica" /></SelectTrigger><SelectContent><SelectItem value="silk">Silk Têxtil</SelectItem><SelectItem value="laser">Fiber Laser</SelectItem><SelectItem value="tampo">Tampografia</SelectItem><SelectItem value="sublimacao">Sublimação</SelectItem></SelectContent></Select></div>
                <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Quantidade</Label><Input type="number" placeholder="0" /></div><div className="space-y-2"><Label>Duração (min)</Label><Input type="number" placeholder="60" /></div></div>
                <div className="space-y-2"><Label>Observações</Label><Textarea placeholder="Notas adicionais..." /></div>
              </div>
              <div className="flex gap-3"><Button variant="outline" className="flex-1">Cancelar</Button><Button variant="gradient" className="flex-1">Criar Trabalho</Button></div>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>
    </>
  );
}
