import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import { XCircle, Search, Home, ArrowLeft, Server, RefreshCw, HelpCircle, Lock, Key, Clock, Cpu } from 'lucide-react';

export function HttpErrorStates() {
  return (
    <Card className="card-interactive card-shine">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-primary" />
          Páginas de Erro HTTP
        </CardTitle>
        <CardDescription>Estados para erros de navegação e servidor</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 404 */}
          <div className="border rounded-xl p-8 bg-gradient-to-br from-warning/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="text-8xl font-display font-bold text-warning/20">404</div>
              <div className="absolute inset-0 flex items-center justify-center"><Search className="h-12 w-12 text-warning" /></div>
            </div>
            <div className="space-y-2 max-w-xs">
              <h3 className="text-xl font-semibold">Página não encontrada</h3>
              <p className="text-sm text-muted-foreground">A página que você está procurando não existe ou foi movida.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="gradient"><Home className="h-4 w-4" />Ir para Início</Button>
              <Button variant="outline"><ArrowLeft className="h-4 w-4" />Voltar</Button>
            </div>
          </div>

          {/* 500 */}
          <div className="border rounded-xl p-8 bg-gradient-to-br from-destructive/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="text-8xl font-display font-bold text-destructive/20">500</div>
              <div className="absolute inset-0 flex items-center justify-center"><Server className="h-12 w-12 text-destructive" /></div>
            </div>
            <div className="space-y-2 max-w-xs">
              <h3 className="text-xl font-semibold">Erro no Servidor</h3>
              <p className="text-sm text-muted-foreground">Algo deu errado em nossos servidores. Estamos trabalhando para resolver.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline"><RefreshCw className="h-4 w-4" />Tentar Novamente</Button>
              <Button variant="ghost"><HelpCircle className="h-4 w-4" />Suporte</Button>
            </div>
          </div>

          {/* 403 */}
          <div className="border rounded-xl p-8 bg-gradient-to-br from-orange-500/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="text-8xl font-display font-bold text-orange-500/20">403</div>
              <div className="absolute inset-0 flex items-center justify-center"><Lock className="h-12 w-12 text-orange-500" /></div>
            </div>
            <div className="space-y-2 max-w-xs">
              <h3 className="text-xl font-semibold">Acesso Negado</h3>
              <p className="text-sm text-muted-foreground">Você não tem permissão para acessar este recurso.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="gradient"><Key className="h-4 w-4" />Fazer Login</Button>
              <Button variant="outline"><Home className="h-4 w-4" />Ir para Início</Button>
            </div>
          </div>

          {/* 503 */}
          <div className="border rounded-xl p-8 bg-gradient-to-br from-info/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="text-8xl font-display font-bold text-info/20">503</div>
              <div className="absolute inset-0 flex items-center justify-center"><Cpu className="h-12 w-12 text-info" /></div>
            </div>
            <div className="space-y-2 max-w-xs">
              <h3 className="text-xl font-semibold">Em Manutenção</h3>
              <p className="text-sm text-muted-foreground">O sistema está temporariamente indisponível para manutenção programada.</p>
            </div>
            <Button variant="outline"><Clock className="h-4 w-4" />Verificar Status</Button>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CodeBlock code={`<div className="border rounded-xl p-8
  bg-gradient-to-br from-warning/5 to-transparent">
  <div className="text-8xl font-bold text-warning/20">404</div>
  <Button variant="gradient">Ir para Início</Button>
</div>`} label="Erro 404" />
            <CodeBlock code={`<div className="border rounded-xl p-8
  bg-gradient-to-br from-destructive/5 to-transparent">
  <div className="text-8xl font-bold text-destructive/20">500</div>
  <Button variant="outline">Tentar Novamente</Button>
</div>`} label="Erro 500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
