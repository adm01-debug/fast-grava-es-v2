import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/ui/code-block';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export function ErrorStatesSection() {
  return (
    <div className="space-y-6">
      {/* HTTP Error Pages */}
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
            {/* 404 Not Found */}
            <div className="border rounded-xl p-8 bg-gradient-to-br from-warning/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="text-8xl font-display font-bold text-warning/20">404</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="h-12 w-12 text-warning" />
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-xl font-semibold">Página não encontrada</h3>
                <p className="text-sm text-muted-foreground">
                  A página que você está procurando não existe ou foi movida.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="gradient">
                  <Home className="h-4 w-4" />
                  Ir para Início
                </Button>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </div>
            </div>

            {/* 500 Server Error */}
            <div className="border rounded-xl p-8 bg-gradient-to-br from-destructive/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="text-8xl font-display font-bold text-destructive/20">500</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Server className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-xl font-semibold">Erro no Servidor</h3>
                <p className="text-sm text-muted-foreground">
                  Algo deu errado em nossos servidores. Estamos trabalhando para resolver.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </Button>
                <Button variant="ghost">
                  <HelpCircle className="h-4 w-4" />
                  Suporte
                </Button>
              </div>
            </div>

            {/* 403 Forbidden */}
            <div className="border rounded-xl p-8 bg-gradient-to-br from-orange-500/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="text-8xl font-display font-bold text-orange-500/20">403</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="h-12 w-12 text-orange-500" />
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-xl font-semibold">Acesso Negado</h3>
                <p className="text-sm text-muted-foreground">
                  Você não tem permissão para acessar este recurso.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="gradient">
                  <Key className="h-4 w-4" />
                  Fazer Login
                </Button>
                <Button variant="outline">
                  <Home className="h-4 w-4" />
                  Ir para Início
                </Button>
              </div>
            </div>

            {/* 503 Service Unavailable */}
            <div className="border rounded-xl p-8 bg-gradient-to-br from-info/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="text-8xl font-display font-bold text-info/20">503</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="h-12 w-12 text-info" />
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-xl font-semibold">Em Manutenção</h3>
                <p className="text-sm text-muted-foreground">
                  O sistema está temporariamente indisponível para manutenção programada.
                </p>
              </div>
              <Button variant="outline">
                <Clock className="h-4 w-4" />
                Verificar Status
              </Button>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`{/* Erro 404 */}
<div className="border rounded-xl p-8 
  bg-gradient-to-br from-warning/5 to-transparent 
  flex flex-col items-center text-center space-y-6">
  <div className="relative">
    <div className="text-8xl font-display font-bold 
      text-warning/20">404</div>
    <div className="absolute inset-0 flex items-center 
      justify-center">
      <Search className="h-12 w-12 text-warning" />
    </div>
  </div>
  <div className="space-y-2 max-w-xs">
    <h3 className="text-xl font-semibold">
      Página não encontrada
    </h3>
    <p className="text-sm text-muted-foreground">
      A página não existe ou foi movida.
    </p>
  </div>
  <div className="flex gap-2">
    <Button variant="gradient">
      <Home className="h-4 w-4" /> Início
    </Button>
    <Button variant="outline">
      <ArrowLeft className="h-4 w-4" /> Voltar
    </Button>
  </div>
</div>`} 
                label="Erro 404"
              />
              <CodeBlock 
                code={`{/* Erro 500 */}
<div className="border rounded-xl p-8 
  bg-gradient-to-br from-destructive/5 to-transparent 
  flex flex-col items-center text-center space-y-6">
  <div className="relative">
    <div className="text-8xl font-display font-bold 
      text-destructive/20">500</div>
    <div className="absolute inset-0 flex items-center 
      justify-center">
      <Server className="h-12 w-12 text-destructive" />
    </div>
  </div>
  <div className="space-y-2 max-w-xs">
    <h3 className="text-xl font-semibold">
      Erro no Servidor
    </h3>
    <p className="text-sm text-muted-foreground">
      Algo deu errado. Estamos resolvendo.
    </p>
  </div>
  <Button variant="outline">
    <RefreshCw className="h-4 w-4" /> Tentar Novamente
  </Button>
</div>`} 
                label="Erro 500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inline Error States */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Erros Inline
          </CardTitle>
          <CardDescription>Estados de erro dentro de componentes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Form Field Error */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Campo com Erro</h4>
              <div className="space-y-2">
                <Label htmlFor="error-input" className="text-destructive">Email</Label>
                <Input 
                  id="error-input" 
                  placeholder="seu@email.com" 
                  className="border-destructive focus-visible:ring-destructive"
                  defaultValue="email-invalido"
                />
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Por favor, insira um email válido
                </p>
              </div>
            </div>

            {/* Card with Error */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Card com Erro</h4>
              <div className="border border-destructive/50 rounded-lg p-4 bg-destructive/5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <XCircle className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Falha ao carregar dados</h4>
                    <p className="text-xs text-muted-foreground">
                      Não foi possível conectar ao servidor. Verifique sua conexão.
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCw className="h-3 w-3" />
                  Tentar Novamente
                </Button>
              </div>
            </div>

            {/* Failed API Request */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Requisição Falhou</h4>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">GET /api/jobs</span>
                  <Badge variant="destructive">500</Badge>
                </div>
                <div className="bg-destructive/10 rounded p-3">
                  <code className="text-xs text-destructive">
                    Error: Internal Server Error - Database connection failed
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-3 w-3" />
                    Copy Error
                  </Button>
                </div>
              </div>
            </div>

            {/* Validation Summary */}
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
                  <li className="flex items-center gap-2">
                    <MinusCircle className="h-3 w-3" />
                    Nome é obrigatório
                  </li>
                  <li className="flex items-center gap-2">
                    <MinusCircle className="h-3 w-3" />
                    Email inválido
                  </li>
                  <li className="flex items-center gap-2">
                    <MinusCircle className="h-3 w-3" />
                    Senha deve ter no mínimo 8 caracteres
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`{/* Campo com Erro */}
<div className="space-y-2">
  <Label className="text-destructive">Email</Label>
  <Input 
    className="border-destructive 
      focus-visible:ring-destructive"
    defaultValue="email-invalido"
  />
  <p className="text-xs text-destructive 
    flex items-center gap-1">
    <AlertCircle className="h-3 w-3" />
    Por favor, insira um email válido
  </p>
</div>`} 
                label="Campo com Erro"
              />
              <CodeBlock 
                code={`{/* Card com Erro */}
<div className="border border-destructive/50 
  rounded-lg p-4 bg-destructive/5 space-y-3">
  <div className="flex items-start gap-3">
    <div className="h-8 w-8 rounded-full bg-destructive/10 
      flex items-center justify-center flex-shrink-0">
      <XCircle className="h-4 w-4 text-destructive" />
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-medium">
        Falha ao carregar dados
      </h4>
      <p className="text-xs text-muted-foreground">
        Não foi possível conectar ao servidor.
      </p>
    </div>
  </div>
  <Button variant="outline" size="sm" className="w-full">
    <RefreshCw className="h-3 w-3" /> Tentar Novamente
  </Button>
</div>`} 
                label="Card com Erro"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`{/* Requisição Falhou */}
<div className="border rounded-lg p-4 space-y-3">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">
      GET /api/jobs
    </span>
    <Badge variant="destructive">500</Badge>
  </div>
  <div className="bg-destructive/10 rounded p-3">
    <code className="text-xs text-destructive">
      Error: Internal Server Error
    </code>
  </div>
  <div className="flex gap-2">
    <Button variant="outline" size="sm">
      <RefreshCw className="h-3 w-3" /> Retry
    </Button>
    <Button variant="ghost" size="sm">
      <Copy className="h-3 w-3" /> Copy Error
    </Button>
  </div>
</div>`} 
                label="Requisição Falhou"
              />
              <CodeBlock 
                code={`{/* Resumo de Validação */}
<div className="border border-destructive/50 
  rounded-lg p-4 bg-destructive/5">
  <div className="flex items-start gap-3 mb-3">
    <AlertTriangle className="h-5 w-5 text-destructive 
      flex-shrink-0" />
    <div>
      <h4 className="text-sm font-medium text-destructive">
        Corrija os erros abaixo
      </h4>
      <p className="text-xs text-muted-foreground">
        3 campos precisam de atenção
      </p>
    </div>
  </div>
  <ul className="space-y-1 text-xs text-destructive">
    <li className="flex items-center gap-2">
      <MinusCircle className="h-3 w-3" />
      Nome é obrigatório
    </li>
    <li className="flex items-center gap-2">
      <MinusCircle className="h-3 w-3" />
      Email inválido
    </li>
  </ul>
</div>`} 
                label="Resumo de Validação"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Error States */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Estados Críticos
          </CardTitle>
          <CardDescription>Erros que requerem atenção imediata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Session Expired */}
            <div className="border rounded-xl p-6 bg-gradient-to-br from-warning/10 to-transparent flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-warning/20 flex items-center justify-center">
                <Clock className="h-8 w-8 text-warning" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Sessão Expirada</h3>
                <p className="text-sm text-muted-foreground">
                  Sua sessão expirou por inatividade. Faça login novamente.
                </p>
              </div>
              <Button variant="gradient">
                <Key className="h-4 w-4" />
                Fazer Login
              </Button>
            </div>

            {/* Connection Lost */}
            <div className="border rounded-xl p-6 bg-gradient-to-br from-destructive/10 to-transparent flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
                <WifiOff className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Conexão Perdida</h3>
                <p className="text-sm text-muted-foreground">
                  Conexão com o servidor foi interrompida. Reconectando...
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Tentando reconectar...
              </div>
            </div>

            {/* Unsaved Changes */}
            <div className="border rounded-xl p-6 bg-gradient-to-br from-info/10 to-transparent flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-info/20 flex items-center justify-center">
                <Save className="h-8 w-8 text-info" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Alterações não salvas</h3>
                <p className="text-sm text-muted-foreground">
                  Você tem alterações que não foram salvas. Deseja continuar?
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="gradient-success" size="sm">
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                  Descartar
                </Button>
              </div>
            </div>

            {/* Rate Limited */}
            <div className="border rounded-xl p-6 bg-gradient-to-br from-orange-500/10 to-transparent flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Limite Atingido</h3>
                <p className="text-sm text-muted-foreground">
                  Muitas requisições. Aguarde antes de tentar novamente.
                </p>
              </div>
              <div className="text-2xl font-mono font-bold text-orange-500">
                00:42
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`{/* Sessão Expirada */}
<div className="border rounded-xl p-6 
  bg-gradient-to-br from-warning/10 to-transparent 
  flex flex-col items-center text-center space-y-4">
  <div className="h-16 w-16 rounded-full bg-warning/20 
    flex items-center justify-center">
    <Clock className="h-8 w-8 text-warning" />
  </div>
  <div className="space-y-1">
    <h3 className="font-semibold">Sessão Expirada</h3>
    <p className="text-sm text-muted-foreground">
      Sua sessão expirou. Faça login novamente.
    </p>
  </div>
  <Button variant="gradient">
    <Key className="h-4 w-4" /> Fazer Login
  </Button>
</div>`} 
                label="Sessão Expirada"
              />
              <CodeBlock 
                code={`{/* Conexão Perdida */}
<div className="border rounded-xl p-6 
  bg-gradient-to-br from-destructive/10 to-transparent 
  flex flex-col items-center text-center space-y-4">
  <div className="h-16 w-16 rounded-full bg-destructive/20 
    flex items-center justify-center animate-pulse">
    <WifiOff className="h-8 w-8 text-destructive" />
  </div>
  <div className="space-y-1">
    <h3 className="font-semibold">Conexão Perdida</h3>
    <p className="text-sm text-muted-foreground">
      Conexão interrompida. Reconectando...
    </p>
  </div>
  <div className="flex items-center gap-2 text-xs 
    text-muted-foreground">
    <Loader2 className="h-3 w-3 animate-spin" />
    Tentando reconectar...
  </div>
</div>`} 
                label="Conexão Perdida"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`{/* Alterações não salvas */}
<div className="border rounded-xl p-6 
  bg-gradient-to-br from-info/10 to-transparent 
  flex flex-col items-center text-center space-y-4">
  <div className="h-16 w-16 rounded-full bg-info/20 
    flex items-center justify-center">
    <Save className="h-8 w-8 text-info" />
  </div>
  <div className="space-y-1">
    <h3 className="font-semibold">Alterações não salvas</h3>
    <p className="text-sm text-muted-foreground">
      Deseja continuar sem salvar?
    </p>
  </div>
  <div className="flex gap-2">
    <Button variant="gradient-success" size="sm">
      <Save className="h-4 w-4" /> Salvar
    </Button>
    <Button variant="destructive" size="sm">
      <Trash2 className="h-4 w-4" /> Descartar
    </Button>
  </div>
</div>`} 
                label="Alterações não salvas"
              />
              <CodeBlock 
                code={`{/* Rate Limited */}
<div className="border rounded-xl p-6 
  bg-gradient-to-br from-orange-500/10 to-transparent 
  flex flex-col items-center text-center space-y-4">
  <div className="h-16 w-16 rounded-full bg-orange-500/20 
    flex items-center justify-center">
    <Shield className="h-8 w-8 text-orange-500" />
  </div>
  <div className="space-y-1">
    <h3 className="font-semibold">Limite Atingido</h3>
    <p className="text-sm text-muted-foreground">
      Muitas requisições. Aguarde.
    </p>
  </div>
  <div className="text-2xl font-mono font-bold 
    text-orange-500">
    00:42
  </div>
</div>`} 
                label="Rate Limited"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
