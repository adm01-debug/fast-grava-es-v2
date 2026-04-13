import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/ui/code-block';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export function ModalsSection() {
  return (
    <div className="space-y-6">
      {/* Dialog */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Dialog
          </CardTitle>
          <CardDescription>Modal padrão para conteúdo e formulários</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Basic Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Dialog Básico</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog Básico</DialogTitle>
                  <DialogDescription>
                    Este é um exemplo de dialog básico com título e descrição.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    O conteúdo do dialog vai aqui. Pode incluir texto, imagens, formulários ou qualquer outro elemento.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancelar</Button>
                  <Button variant="gradient">Confirmar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog with Form */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="gradient">Dialog com Formulário</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Editar Perfil</DialogTitle>
                  <DialogDescription>
                    Atualize suas informações de perfil aqui.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="modal-name">Nome</Label>
                    <Input id="modal-name" placeholder="Seu nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal-email">Email</Label>
                    <Input id="modal-email" type="email" placeholder="email@exemplo.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal-bio">Bio</Label>
                    <Textarea id="modal-bio" placeholder="Conte um pouco sobre você..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancelar</Button>
                  <Button variant="gradient">Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Large Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Dialog Grande</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Detalhes do Trabalho</DialogTitle>
                  <DialogDescription>
                    Informações completas sobre o trabalho de produção.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Número do Pedido</p>
                      <p className="text-sm text-muted-foreground">#ORD-2024-001</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Cliente</p>
                      <p className="text-sm text-muted-foreground">Empresa ABC Ltda</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Técnica</p>
                      <Badge variant="secondary">Silk Têxtil</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Status</p>
                      <StatusBadge status="production" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Observações</p>
                    <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted">
                      Cliente solicitou entrega expressa. Verificar qualidade da impressão antes de finalizar.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Fechar</Button>
                  <Button variant="gradient">Editar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Dialog"
              code={`<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Abrir Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título do Dialog</DialogTitle>
      <DialogDescription>
        Descrição do dialog aqui.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* Conteúdo */}
    </div>
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button variant="gradient">Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Dialog com largura customizada */}
<DialogContent className="sm:max-w-md">
  ...
</DialogContent>

<DialogContent className="sm:max-w-2xl">
  ...
</DialogContent>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alert Dialog */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Alert Dialog
          </CardTitle>
          <CardDescription>Diálogos de confirmação para ações importantes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Delete Confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Excluir Item</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O item será permanentemente removido do sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Confirm Action */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Confirmar Ação</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar finalização</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você está prestes a finalizar este trabalho. Certifique-se de que todas as verificações foram feitas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction className="gradient-primary text-white">
                    Finalizar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Warning */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-[hsl(var(--warning))] text-[hsl(var(--warning))]">
                  Ação com Aviso
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
                    Atenção
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação pode afetar outros trabalhos em andamento. Deseja continuar mesmo assim?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Não, cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] hover:bg-[hsl(var(--warning))]/90">
                    Sim, continuar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Alert Dialog"
              code={`<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Excluir</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
        Excluir
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

{/* Estilo success/warning */}
<AlertDialogAction className="gradient-primary text-white">
  Confirmar
</AlertDialogAction>

<AlertDialogAction className="bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]">
  Continuar
</AlertDialogAction>`}
            />
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Sheet"
              code={`<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Abrir Sheet</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Título</SheetTitle>
      <SheetDescription>Descrição aqui.</SheetDescription>
    </SheetHeader>
    <div className="py-6">
      {/* Conteúdo */}
    </div>
  </SheetContent>
</Sheet>

{/* Posições */}
<SheetContent side="right">...</SheetContent>
<SheetContent side="left">...</SheetContent>
<SheetContent side="top" className="h-auto">...</SheetContent>
<SheetContent side="bottom" className="h-auto">...</SheetContent>

{/* Com largura customizada */}
<SheetContent side="right" className="sm:max-w-lg">
  ...
</SheetContent>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sheet */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Sheet (Drawer)
          </CardTitle>
          <CardDescription>Painéis deslizantes para conteúdo secundário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Right Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Sheet Direita</Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Configurações</SheetTitle>
                  <SheetDescription>
                    Ajuste as configurações da sua conta aqui.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="sheet-name">Nome</Label>
                    <Input id="sheet-name" placeholder="Seu nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sheet-email">Email</Label>
                    <Input id="sheet-email" type="email" placeholder="email@exemplo.com" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sheet-notifications">Notificações</Label>
                    <Switch id="sheet-notifications" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sheet-dark">Modo Escuro</Label>
                    <Switch id="sheet-dark" defaultChecked />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="gradient" className="flex-1">Salvar</Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Left Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Sheet Esquerda</Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu de Navegação</SheetTitle>
                  <SheetDescription>
                    Acesse rapidamente as principais seções.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-2 py-6">
                  {['Dashboard', 'Produção', 'Kanban', 'Calendário', 'Alertas', 'KPIs'].map((item) => (
                    <Button key={item} variant="ghost" className="w-full justify-start gap-2">
                      <Zap className="h-4 w-4" />
                      {item}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Top Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Sheet Topo</Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <SheetHeader>
                  <SheetTitle>Notificação</SheetTitle>
                  <SheetDescription>
                    Você tem novas atualizações disponíveis.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex gap-3 py-4">
                  <Button variant="gradient">Ver Atualizações</Button>
                  <Button variant="outline">Mais Tarde</Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Bottom Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Sheet Inferior</Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto">
                <SheetHeader>
                  <SheetTitle>Ações Rápidas</SheetTitle>
                  <SheetDescription>
                    Escolha uma ação para executar.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid grid-cols-3 gap-3 py-6">
                  <Button variant="outline" className="flex-col h-auto py-4 gap-2">
                    <Plus className="h-6 w-6" />
                    <span className="text-xs">Novo Job</span>
                  </Button>
                  <Button variant="outline" className="flex-col h-auto py-4 gap-2">
                    <Scan className="h-6 w-6" />
                    <span className="text-xs">Escanear QR</span>
                  </Button>
                  <Button variant="outline" className="flex-col h-auto py-4 gap-2">
                    <Bell className="h-6 w-6" />
                    <span className="text-xs">Alertas</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {/* Sheet with Form */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Sheet com Formulário
          </CardTitle>
          <CardDescription>Exemplo de sheet com formulário completo</CardDescription>
        </CardHeader>
        <CardContent>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="gradient">Adicionar Novo Trabalho</Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Novo Trabalho</SheetTitle>
                <SheetDescription>
                  Preencha os dados para criar um novo trabalho de produção.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Número do Pedido</Label>
                    <Input placeholder="ORD-2024-XXX" />
                  </div>
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Input placeholder="Nome do cliente" />
                </div>
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <Input placeholder="Descrição do produto" />
                </div>
                <div className="space-y-2">
                  <Label>Técnica</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a técnica" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="silk">Silk Têxtil</SelectItem>
                      <SelectItem value="laser">Fiber Laser</SelectItem>
                      <SelectItem value="tampo">Tampografia</SelectItem>
                      <SelectItem value="sublimacao">Sublimação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Duração (min)</Label>
                    <Input type="number" placeholder="60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea placeholder="Notas adicionais..." />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">Cancelar</Button>
                <Button variant="gradient" className="flex-1">Criar Trabalho</Button>
              </div>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>

      {/* Usage Notes */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Guia de Uso
          </CardTitle>
          <CardDescription>Quando usar cada tipo de modal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Dialog
              </h4>
              <p className="text-sm text-muted-foreground">
                Use para formulários curtos, confirmações e conteúdo que requer atenção focada. Ideal para ações que não precisam de muito espaço.
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
                Alert Dialog
              </h4>
              <p className="text-sm text-muted-foreground">
                Use para ações destrutivas ou irreversíveis que precisam de confirmação explícita do usuário antes de prosseguir.
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-secondary" />
                Sheet
              </h4>
              <p className="text-sm text-muted-foreground">
                Use para formulários longos, configurações, navegação secundária ou conteúdo que precisa de mais espaço vertical.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
