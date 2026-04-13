import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/ui/code-block';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Layers } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function DialogExamples() {
  return (
    <Card className="card-interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-primary" />Dialog</CardTitle>
        <CardDescription>Modal padrão para conteúdo e formulários</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild><Button variant="outline">Dialog Básico</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Dialog Básico</DialogTitle><DialogDescription>Este é um exemplo de dialog básico com título e descrição.</DialogDescription></DialogHeader>
              <div className="py-4"><p className="text-sm text-muted-foreground">O conteúdo do dialog vai aqui. Pode incluir texto, imagens, formulários ou qualquer outro elemento.</p></div>
              <DialogFooter><Button variant="outline">Cancelar</Button><Button variant="gradient">Confirmar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild><Button variant="gradient">Dialog com Formulário</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Editar Perfil</DialogTitle><DialogDescription>Atualize suas informações de perfil aqui.</DialogDescription></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2"><Label htmlFor="modal-name">Nome</Label><Input id="modal-name" placeholder="Seu nome" /></div>
                <div className="space-y-2"><Label htmlFor="modal-email">Email</Label><Input id="modal-email" type="email" placeholder="email@exemplo.com" /></div>
                <div className="space-y-2"><Label htmlFor="modal-bio">Bio</Label><Textarea id="modal-bio" placeholder="Conte um pouco sobre você..." /></div>
              </div>
              <DialogFooter><Button variant="outline">Cancelar</Button><Button variant="gradient">Salvar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild><Button variant="secondary">Dialog Grande</Button></DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader><DialogTitle>Detalhes do Trabalho</DialogTitle><DialogDescription>Informações completas sobre o trabalho de produção.</DialogDescription></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><p className="text-sm font-medium">Número do Pedido</p><p className="text-sm text-muted-foreground">#ORD-2024-001</p></div>
                  <div className="space-y-1"><p className="text-sm font-medium">Cliente</p><p className="text-sm text-muted-foreground">Empresa ABC Ltda</p></div>
                  <div className="space-y-1"><p className="text-sm font-medium">Técnica</p><Badge variant="secondary">Silk Têxtil</Badge></div>
                  <div className="space-y-1"><p className="text-sm font-medium">Status</p><StatusBadge status="production" /></div>
                </div>
                <div className="space-y-2"><p className="text-sm font-medium">Observações</p><p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted">Cliente solicitou entrega expressa. Verificar qualidade da impressão antes de finalizar.</p></div>
              </div>
              <DialogFooter><Button variant="outline">Fechar</Button><Button variant="gradient">Editar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
          <CodeBlock label="Dialog" code={`<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Abrir Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título do Dialog</DialogTitle>
      <DialogDescription>Descrição do dialog aqui.</DialogDescription>
    </DialogHeader>
    <div className="py-4">{/* Conteúdo */}</div>
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button variant="gradient">Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`} />
        </div>
      </CardContent>
    </Card>
  );
}
