import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import { AlertTriangle, Clock, Key, WifiOff, Save, Trash2, Shield, Loader2 } from 'lucide-react';

export function CriticalErrorStates() {
  return (
    <Card className="card-interactive card-shine">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-primary" />Estados Críticos</CardTitle>
        <CardDescription>Erros que requerem atenção imediata</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border rounded-xl p-6 bg-gradient-to-br from-warning/10 to-transparent flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-warning/20 flex items-center justify-center"><Clock className="h-8 w-8 text-warning" /></div>
            <div className="space-y-1"><h3 className="font-semibold">Sessão Expirada</h3><p className="text-sm text-muted-foreground">Sua sessão expirou por inatividade. Faça login novamente.</p></div>
            <Button variant="gradient"><Key className="h-4 w-4" />Fazer Login</Button>
          </div>
          <div className="border rounded-xl p-6 bg-gradient-to-br from-destructive/10 to-transparent flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse"><WifiOff className="h-8 w-8 text-destructive" /></div>
            <div className="space-y-1"><h3 className="font-semibold">Conexão Perdida</h3><p className="text-sm text-muted-foreground">Conexão com o servidor foi interrompida. Reconectando...</p></div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />Tentando reconectar...</div>
          </div>
          <div className="border rounded-xl p-6 bg-gradient-to-br from-info/10 to-transparent flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-info/20 flex items-center justify-center"><Save className="h-8 w-8 text-info" /></div>
            <div className="space-y-1"><h3 className="font-semibold">Alterações não salvas</h3><p className="text-sm text-muted-foreground">Você tem alterações que não foram salvas. Deseja continuar?</p></div>
            <div className="flex gap-2">
              <Button variant="gradient-success" size="sm"><Save className="h-4 w-4" />Salvar</Button>
              <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" />Descartar</Button>
            </div>
          </div>
          <div className="border rounded-xl p-6 bg-gradient-to-br from-orange-500/10 to-transparent flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-orange-500/20 flex items-center justify-center"><Shield className="h-8 w-8 text-orange-500" /></div>
            <div className="space-y-1"><h3 className="font-semibold">Limite Atingido</h3><p className="text-sm text-muted-foreground">Muitas requisições. Aguarde antes de tentar novamente.</p></div>
            <div className="text-2xl font-mono font-bold text-orange-500">00:42</div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CodeBlock code={`<div className="border rounded-xl p-6
  bg-gradient-to-br from-warning/10">
  <Clock className="h-8 w-8 text-warning" />
  <h3>Sessão Expirada</h3>
  <Button variant="gradient">Fazer Login</Button>
</div>`} label="Sessão Expirada" />
            <CodeBlock code={`<div className="border rounded-xl p-6
  bg-gradient-to-br from-destructive/10">
  <WifiOff className="animate-pulse" />
  <h3>Conexão Perdida</h3>
  <Loader2 className="animate-spin" />
</div>`} label="Conexão Perdida" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
