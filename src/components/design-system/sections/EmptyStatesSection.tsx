import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/ui/code-block';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export function EmptyStatesSection() {
  return (
    <div className="space-y-6">
      {/* Basic Empty States */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Estados Vazios Básicos
          </CardTitle>
          <CardDescription>Padrões para quando não há dados a exibir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* No Data */}
            <div className="border rounded-lg p-8 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Nenhum item encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Não há itens para exibir no momento.
                </p>
              </div>
            </div>

            {/* No Results */}
            <div className="border rounded-lg p-8 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Nenhum resultado</h3>
                <p className="text-sm text-muted-foreground">
                  Sua busca não retornou resultados. Tente outros termos.
                </p>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`<div className="border rounded-lg p-8 bg-background/50 
  flex flex-col items-center justify-center 
  text-center space-y-4">
  <div className="h-16 w-16 rounded-full bg-muted 
    flex items-center justify-center">
    <Package className="h-8 w-8 text-muted-foreground" />
  </div>
  <div className="space-y-1">
    <h3 className="font-medium">Nenhum item</h3>
    <p className="text-sm text-muted-foreground">
      Não há itens para exibir.
    </p>
  </div>
</div>`} 
                label="Sem Dados (Básico)"
              />
              <CodeBlock 
                code={`<div className="border rounded-lg p-8 bg-background/50 
  flex flex-col items-center justify-center 
  text-center space-y-4">
  <div className="h-16 w-16 rounded-full bg-muted 
    flex items-center justify-center">
    <Search className="h-8 w-8 text-muted-foreground" />
  </div>
  <div className="space-y-1">
    <h3 className="font-medium">Nenhum resultado</h3>
    <p className="text-sm text-muted-foreground">
      Tente outros termos.
    </p>
  </div>
</div>`} 
                label="Sem Resultados de Busca"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty States with CTA */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer2 className="h-5 w-5 text-primary" />
            Com Call-to-Action
          </CardTitle>
          <CardDescription>Estados vazios que incentivam ação do usuário</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* No Jobs */}
            <div className="border rounded-lg p-6 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Nenhum job agendado</h3>
                <p className="text-sm text-muted-foreground">
                  Comece criando seu primeiro job.
                </p>
              </div>
              <Button variant="gradient" size="sm">
                <Plus className="h-4 w-4" />
                Criar Job
              </Button>
            </div>

            {/* No Messages */}
            <div className="border rounded-lg p-6 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-info/10 flex items-center justify-center">
                <MessageSquare className="h-7 w-7 text-info" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Sem conversas</h3>
                <p className="text-sm text-muted-foreground">
                  Inicie uma conversa com o assistente.
                </p>
              </div>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4" />
                Nova Conversa
              </Button>
            </div>

            {/* No Notifications */}
            <div className="border rounded-lg p-6 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
                <Bell className="h-7 w-7 text-success" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Tudo em dia!</h3>
                <p className="text-sm text-muted-foreground">
                  Você não tem notificações pendentes.
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
                Configurar
              </Button>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <CodeBlock 
                code={`<div className="border rounded-lg p-6 bg-background/50 
  flex flex-col items-center text-center space-y-4">
  <div className="h-14 w-14 rounded-full bg-primary/10 
    flex items-center justify-center">
    <Calendar className="h-7 w-7 text-primary" />
  </div>
  <div className="space-y-1">
    <h3 className="font-medium">Nenhum job</h3>
    <p className="text-sm text-muted-foreground">
      Comece criando seu primeiro job.
    </p>
  </div>
  <Button variant="gradient" size="sm">
    <Plus className="h-4 w-4" />
    Criar Job
  </Button>
</div>`} 
                label="Com Botão Primário"
              />
              <CodeBlock 
                code={`<div className="border rounded-lg p-6 bg-background/50 
  flex flex-col items-center text-center space-y-4">
  <div className="h-14 w-14 rounded-full bg-info/10 
    flex items-center justify-center">
    <MessageSquare className="h-7 w-7 text-info" />
  </div>
  <div className="space-y-1">
    <h3 className="font-medium">Sem conversas</h3>
    <p className="text-sm text-muted-foreground">
      Inicie uma conversa.
    </p>
  </div>
  <Button variant="outline" size="sm">
    <MessageSquare className="h-4 w-4" />
    Nova Conversa
  </Button>
</div>`} 
                label="Com Botão Outline"
              />
              <CodeBlock 
                code={`<div className="border rounded-lg p-6 bg-background/50 
  flex flex-col items-center text-center space-y-4">
  <div className="h-14 w-14 rounded-full bg-success/10 
    flex items-center justify-center">
    <Bell className="h-7 w-7 text-success" />
  </div>
  <div className="space-y-1">
    <h3 className="font-medium">Tudo em dia!</h3>
    <p className="text-sm text-muted-foreground">
      Sem notificações pendentes.
    </p>
  </div>
  <Button variant="ghost" size="sm">
    <Settings className="h-4 w-4" />
    Configurar
  </Button>
</div>`} 
                label="Estado Positivo"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Illustrated Empty States */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Com Ilustrações Elaboradas
          </CardTitle>
          <CardDescription>Estados vazios com visual mais impactante</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Welcome State */}
            <div className="border rounded-xl p-8 bg-gradient-to-br from-primary/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Wand2 className="h-12 w-12 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-success flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-success-foreground" />
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-lg font-semibold">Bem-vindo ao Sistema!</h3>
                <p className="text-sm text-muted-foreground">
                  Estamos prontos para ajudá-lo a gerenciar sua produção de forma inteligente.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="gradient">
                  Começar Agora
                </Button>
                <Button variant="outline">
                  Ver Tutorial
                </Button>
              </div>
            </div>

            {/* Error/Offline State */}
            <div className="border rounded-xl p-8 bg-gradient-to-br from-destructive/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center">
                  <WifiOff className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-lg font-semibold">Sem Conexão</h3>
                <p className="text-sm text-muted-foreground">
                  Verifique sua conexão com a internet e tente novamente.
                </p>
              </div>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`<div className="border rounded-xl p-8 
  bg-gradient-to-br from-primary/5 to-transparent 
  flex flex-col items-center text-center space-y-6">
  <div className="relative">
    <div className="h-24 w-24 rounded-full 
      bg-gradient-to-br from-primary/20 to-primary/5 
      flex items-center justify-center">
      <Wand2 className="h-12 w-12 text-primary" />
    </div>
    <div className="absolute -top-1 -right-1 h-6 w-6 
      rounded-full bg-success flex items-center justify-center">
      <Sparkles className="h-3 w-3 text-success-foreground" />
    </div>
  </div>
  <div className="space-y-2 max-w-xs">
    <h3 className="text-lg font-semibold">Bem-vindo!</h3>
    <p className="text-sm text-muted-foreground">
      Descrição do estado.
    </p>
  </div>
  <div className="flex gap-2">
    <Button variant="gradient">Começar</Button>
    <Button variant="outline">Tutorial</Button>
  </div>
</div>`} 
                label="Welcome State"
              />
              <CodeBlock 
                code={`<div className="border rounded-xl p-8 
  bg-gradient-to-br from-destructive/5 to-transparent 
  flex flex-col items-center text-center space-y-6">
  <div className="h-24 w-24 rounded-full 
    bg-gradient-to-br from-destructive/20 to-destructive/5 
    flex items-center justify-center">
    <WifiOff className="h-12 w-12 text-destructive" />
  </div>
  <div className="space-y-2 max-w-xs">
    <h3 className="text-lg font-semibold">Sem Conexão</h3>
    <p className="text-sm text-muted-foreground">
      Verifique sua conexão.
    </p>
  </div>
  <Button variant="outline">
    <RefreshCw className="h-4 w-4" />
    Tentar Novamente
  </Button>
</div>`} 
                label="Offline State"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contextual Empty States */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Estados Contextuais
          </CardTitle>
          <CardDescription>Estados vazios específicos para diferentes contextos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Empty Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/30 p-3 border-b">
                <div className="flex gap-4">
                  <span className="text-xs font-medium text-muted-foreground w-20">ID</span>
                  <span className="text-xs font-medium text-muted-foreground flex-1">Nome</span>
                  <span className="text-xs font-medium text-muted-foreground w-24">Status</span>
                </div>
              </div>
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
                <TableIcon className="h-10 w-10 text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium">Tabela vazia</p>
                  <p className="text-xs text-muted-foreground">Nenhum registro encontrado</p>
                </div>
              </div>
            </div>

            {/* Empty List */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Alertas Recentes</h4>
                <Badge variant="secondary">0</Badge>
              </div>
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                <CheckCircle className="h-10 w-10 text-success/50" />
                <div>
                  <p className="text-sm font-medium">Nenhum alerta</p>
                  <p className="text-xs text-muted-foreground">Sistema funcionando normalmente</p>
                </div>
              </div>
            </div>

            {/* Empty Files */}
            <div className="border rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Arraste arquivos aqui</p>
                <p className="text-xs text-muted-foreground">ou clique para selecionar</p>
              </div>
              <Button variant="outline" size="sm">
                <FolderOpen className="h-4 w-4" />
                Procurar
              </Button>
            </div>

            {/* Empty Filter Results */}
            <div className="border rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Filter className="h-6 w-6 text-warning" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Filtros muito restritivos</p>
                <p className="text-xs text-muted-foreground">Tente ajustar os filtros aplicados</p>
              </div>
              <Button variant="ghost" size="sm">
                <X className="h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`{/* Tabela Vazia */}
<div className="border rounded-lg overflow-hidden">
  <div className="bg-muted/30 p-3 border-b">
    <div className="flex gap-4">
      <span className="text-xs font-medium 
        text-muted-foreground w-20">ID</span>
      <span className="text-xs font-medium 
        text-muted-foreground flex-1">Nome</span>
    </div>
  </div>
  <div className="p-12 flex flex-col items-center 
    justify-center text-center space-y-3">
    <TableIcon className="h-10 w-10 
      text-muted-foreground/50" />
    <div>
      <p className="text-sm font-medium">Tabela vazia</p>
      <p className="text-xs text-muted-foreground">
        Nenhum registro encontrado
      </p>
    </div>
  </div>
</div>`} 
                label="Tabela Vazia"
              />
              <CodeBlock 
                code={`{/* Upload Area */}
<div className="border rounded-lg p-6 
  flex flex-col items-center text-center space-y-4 
  border-dashed">
  <div className="h-12 w-12 rounded-lg bg-muted 
    flex items-center justify-center">
    <Upload className="h-6 w-6 text-muted-foreground" />
  </div>
  <div className="space-y-1">
    <p className="text-sm font-medium">
      Arraste arquivos aqui
    </p>
    <p className="text-xs text-muted-foreground">
      ou clique para selecionar
    </p>
  </div>
  <Button variant="outline" size="sm">
    <FolderOpen className="h-4 w-4" />
    Procurar
  </Button>
</div>`} 
                label="Upload Dropzone"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={`{/* Lista Vazia (Sucesso) */}
<div className="border rounded-lg p-4 space-y-3">
  <div className="flex items-center justify-between">
    <h4 className="text-sm font-medium">Alertas</h4>
    <Badge variant="secondary">0</Badge>
  </div>
  <div className="py-8 flex flex-col items-center 
    text-center space-y-2">
    <CheckCircle className="h-10 w-10 text-success/50" />
    <div>
      <p className="text-sm font-medium">Nenhum alerta</p>
      <p className="text-xs text-muted-foreground">
        Sistema funcionando normalmente
      </p>
    </div>
  </div>
</div>`} 
                label="Lista Vazia (Sucesso)"
              />
              <CodeBlock 
                code={`{/* Filtros Restritivos */}
<div className="border rounded-lg p-6 
  flex flex-col items-center text-center space-y-4">
  <div className="h-12 w-12 rounded-lg bg-warning/10 
    flex items-center justify-center">
    <Filter className="h-6 w-6 text-warning" />
  </div>
  <div className="space-y-1">
    <p className="text-sm font-medium">
      Filtros muito restritivos
    </p>
    <p className="text-xs text-muted-foreground">
      Tente ajustar os filtros
    </p>
  </div>
  <Button variant="ghost" size="sm">
    <X className="h-4 w-4" />
    Limpar Filtros
  </Button>
</div>`} 
                label="Filtros Restritivos"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
