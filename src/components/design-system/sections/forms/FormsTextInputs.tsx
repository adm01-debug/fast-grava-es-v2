import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CodeBlock } from '@/components/ui/code-block';
import { Search, Type, FileText } from 'lucide-react';

export function FormsTextInputs() {
  return (
    <>
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5 text-primary" />Inputs de Texto</CardTitle>
          <CardDescription>Campos de entrada de texto em diferentes estados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2"><Label htmlFor="input-default">Input Padrão</Label><Input id="input-default" placeholder="Digite algo..." /><p className="text-xs text-muted-foreground">Estado padrão</p></div>
            <div className="space-y-2"><Label htmlFor="input-disabled">Input Desabilitado</Label><Input id="input-disabled" placeholder="Desabilitado" disabled /><p className="text-xs text-muted-foreground">disabled</p></div>
            <div className="space-y-2"><Label htmlFor="input-value">Com Valor</Label><Input id="input-value" defaultValue="Valor preenchido" /><p className="text-xs text-muted-foreground">defaultValue</p></div>
            <div className="space-y-2"><Label htmlFor="input-email">Email</Label><Input id="input-email" type="email" placeholder="email@exemplo.com" /><p className="text-xs text-muted-foreground">type="email"</p></div>
            <div className="space-y-2"><Label htmlFor="input-password">Senha</Label><Input id="input-password" type="password" placeholder="••••••••" /><p className="text-xs text-muted-foreground">type="password"</p></div>
            <div className="space-y-2"><Label htmlFor="input-number">Número</Label><Input id="input-number" type="number" placeholder="0" /><p className="text-xs text-muted-foreground">type="number"</p></div>
            <div className="space-y-2"><Label htmlFor="input-search">Busca</Label><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="input-search" placeholder="Buscar..." className="pl-10" /></div><p className="text-xs text-muted-foreground">Com ícone</p></div>
            <div className="space-y-2"><Label htmlFor="input-date">Data</Label><Input id="input-date" type="date" /><p className="text-xs text-muted-foreground">type="date"</p></div>
            <div className="space-y-2"><Label htmlFor="input-time">Hora</Label><Input id="input-time" type="time" /><p className="text-xs text-muted-foreground">type="time"</p></div>
          </div>
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CodeBlock label="Input Padrão" code={`<Input placeholder="Digite algo..." />`} />
              <CodeBlock label="Input Desabilitado" code={`<Input placeholder="Desabilitado" disabled />`} />
              <CodeBlock label="Input com Ícone" code={`<div className="relative">\n  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />\n  <Input placeholder="Buscar..." className="pl-10" />\n</div>`} />
              <CodeBlock label="Input de Data/Hora" code={`<Input type="date" />\n<Input type="time" />`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Textarea</CardTitle>
          <CardDescription>Campos de texto multilinha</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label htmlFor="textarea-default">Textarea Padrão</Label><Textarea id="textarea-default" placeholder="Digite sua mensagem..." /><p className="text-xs text-muted-foreground">Componente Textarea padrão</p></div>
            <div className="space-y-2"><Label htmlFor="textarea-disabled">Textarea Desabilitado</Label><Textarea id="textarea-disabled" placeholder="Desabilitado" disabled /><p className="text-xs text-muted-foreground">disabled</p></div>
          </div>
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock label="Textarea" code={`<Textarea placeholder="Digite sua mensagem..." />\n\n{/* Desabilitado */}\n<Textarea placeholder="Desabilitado" disabled />\n\n{/* Com linhas definidas */}\n<Textarea placeholder="..." rows={4} />`} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
