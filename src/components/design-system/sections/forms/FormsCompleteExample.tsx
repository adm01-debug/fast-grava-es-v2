import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodeBlock } from '@/components/ui/code-block';
import { AlertCircle, AlertTriangle, Check, FileText, X } from 'lucide-react';

export function FormsCompleteExample() {
  return (
    <>
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Exemplo de Formulário Completo</CardTitle>
          <CardDescription>Demonstração de um formulário com validação visual</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="form-name">Nome Completo *</Label><Input id="form-name" placeholder="Seu nome" /></div>
              <div className="space-y-2"><Label htmlFor="form-email">Email *</Label><Input id="form-email" type="email" placeholder="email@exemplo.com" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="form-phone">Telefone</Label><Input id="form-phone" type="tel" placeholder="(00) 00000-0000" /></div>
              <div className="space-y-2"><Label>Departamento</Label><Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="producao">Produção</SelectItem><SelectItem value="design">Design</SelectItem><SelectItem value="vendas">Vendas</SelectItem><SelectItem value="admin">Administrativo</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label htmlFor="form-message">Mensagem</Label><Textarea id="form-message" placeholder="Digite sua mensagem..." rows={4} /></div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2"><Checkbox id="form-terms" /><Label htmlFor="form-terms" className="text-sm">Aceito os termos e condições</Label></div>
              <div className="flex items-center justify-between"><div className="flex items-center space-x-2"><Switch id="form-newsletter" /><Label htmlFor="form-newsletter" className="text-sm">Receber newsletter</Label></div></div>
            </div>
            <div className="flex gap-3"><Button type="button" variant="gradient">Enviar</Button><Button type="button" variant="outline">Cancelar</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-primary" />Estados de Validação</CardTitle>
          <CardDescription>Feedback visual para validação de formulários</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="input-success" className="text-[hsl(var(--success))]">Campo Válido</Label>
              <Input id="input-success" defaultValue="email@valido.com" className="border-[hsl(var(--success))] focus-visible:ring-[hsl(var(--success))]" />
              <p className="text-xs text-[hsl(var(--success))] flex items-center gap-1"><Check className="h-3 w-3" /> Email válido</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="input-error" className="text-destructive">Campo com Erro</Label>
              <Input id="input-error" defaultValue="email-invalido" className="border-destructive focus-visible:ring-destructive" />
              <p className="text-xs text-destructive flex items-center gap-1"><X className="h-3 w-3" /> Email inválido</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="input-warning" className="text-[hsl(var(--warning))]">Campo com Aviso</Label>
              <Input id="input-warning" defaultValue="senha123" className="border-[hsl(var(--warning))] focus-visible:ring-[hsl(var(--warning))]" />
              <p className="text-xs text-[hsl(var(--warning))] flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Senha fraca</p>
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t"><h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4><CodeBlock label="Estados de Validação" code={`{/* Sucesso */}\n<Input className="border-[hsl(var(--success))]" />\n\n{/* Erro */}\n<Input className="border-destructive" />\n\n{/* Aviso */}\n<Input className="border-[hsl(var(--warning))]" />`} /></div>
        </CardContent>
      </Card>
    </>
  );
}
