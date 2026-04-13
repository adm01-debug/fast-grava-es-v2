import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CodeBlock } from '@/components/ui/code-block';
import { AlertCircle, AlertTriangle, XCircle, RefreshCw, Copy, MinusCircle } from 'lucide-react';

export function InlineErrorStates() {
  return (
    <Card className="card-interactive card-shine">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-primary" />Erros Inline</CardTitle>
        <CardDescription>Estados de erro dentro de componentes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Campo com Erro</h4>
            <div className="space-y-2">
              <Label htmlFor="error-input" className="text-destructive">Email</Label>
              <Input id="error-input" placeholder="seu@email.com" className="border-destructive focus-visible:ring-destructive" defaultValue="email-invalido" />
              <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />Por favor, insira um email válido</p>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Card com Erro</h4>
            <div className="border border-destructive/50 rounded-lg p-4 bg-destructive/5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0"><XCircle className="h-4 w-4 text-destructive" /></div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Falha ao carregar dados</h4>
                  <p className="text-xs text-muted-foreground">Não foi possível conectar ao servidor. Verifique sua conexão.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full"><RefreshCw className="h-3 w-3" />Tentar Novamente</Button>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Requisição Falhou</h4>
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm font-medium">GET /api/jobs</span><Badge variant="destructive">500</Badge></div>
              <div className="bg-destructive/10 rounded p-3"><code className="text-xs text-destructive">Error: Internal Server Error - Database connection failed</code></div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><RefreshCw className="h-3 w-3" />Retry</Button>
                <Button variant="ghost" size="sm"><Copy className="h-3 w-3" />Copy Error</Button>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Resumo de Validação</h4>
            <div className="border border-destructive/50 rounded-lg p-4 bg-destructive/5">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-destructive">Corrija os erros abaixo</h4>
                  <p className="text-xs text-muted-foreground">3 campos precisam de atenção</p>
                </div>
              </div>
              <ul className="space-y-1 text-xs text-destructive">
                <li className="flex items-center gap-2"><MinusCircle className="h-3 w-3" />Nome é obrigatório</li>
                <li className="flex items-center gap-2"><MinusCircle className="h-3 w-3" />Email inválido</li>
                <li className="flex items-center gap-2"><MinusCircle className="h-3 w-3" />Senha deve ter no mínimo 8 caracteres</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CodeBlock code={`<Input className="border-destructive" />
<p className="text-xs text-destructive">
  <AlertCircle /> Email inválido
</p>`} label="Campo com Erro" />
            <CodeBlock code={`<div className="border border-destructive/50 
  rounded-lg p-4 bg-destructive/5">
  <XCircle /> Falha ao carregar dados
  <Button>Tentar Novamente</Button>
</div>`} label="Card com Erro" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
