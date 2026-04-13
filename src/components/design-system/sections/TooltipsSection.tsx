import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CodeBlock } from '@/components/ui/code-block';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bell, Calendar, Copy, Edit, Filter, HelpCircle, Info, Layers, MoreHorizontal, Plus, Settings, Share2, Trash2, User, Zap } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useState, useEffect } from 'react';

export function TooltipsSection() {
  const [popoverDate, setPopoverDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      {/* Tooltips */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Tooltips
          </CardTitle>
          <CardDescription>Dicas contextuais que aparecem ao passar o mouse</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="space-y-6">
              {/* Basic Tooltips */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Posições</h4>
                <div className="flex flex-wrap gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Tooltip Topo</Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Tooltip posicionado no topo</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Tooltip Inferior</Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Tooltip posicionado embaixo</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Tooltip Esquerda</Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Tooltip à esquerda</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Tooltip Direita</Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Tooltip à direita</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Icon Tooltips */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Em Ícones</h4>
                <div className="flex flex-wrap gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Configurações</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notificações</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Meu Perfil</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Excluir item</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Rich Tooltips */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tooltips com Conteúdo Rico</h4>
                <div className="flex flex-wrap gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="gradient">Com Atalho</Button>
                    </TooltipTrigger>
                    <TooltipContent className="flex items-center gap-2">
                      <p>Salvar alterações</p>
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                        ⌘S
                      </kbd>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-pointer">
                        <HelpCircle className="h-3 w-3 mr-1" />
                        Ajuda
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium">Precisa de ajuda?</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Clique aqui para acessar nossa base de conhecimento com tutoriais e FAQs.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </TooltipProvider>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Tooltip"
              code={`<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent side="top">
      <p>Tooltip no topo</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

{/* Posições: side="top" | "bottom" | "left" | "right" */}

{/* Com atalho de teclado */}
<TooltipContent className="flex items-center gap-2">
  <p>Salvar</p>
  <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px]">
    ⌘S
  </kbd>
</TooltipContent>

{/* Em ícones */}
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon">
      <Settings className="h-5 w-5" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>Configurações</p>
  </TooltipContent>
</Tooltip>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Popovers */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Popovers
          </CardTitle>
          <CardDescription>Painéis flutuantes com conteúdo interativo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Basic Popovers */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Posições</h4>
              <div className="flex flex-wrap gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Popover Topo</Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Popover no Topo</h4>
                      <p className="text-sm text-muted-foreground">
                        Este popover abre acima do elemento trigger.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Popover Inferior</Button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Popover Inferior</h4>
                      <p className="text-sm text-muted-foreground">
                        Este popover abre abaixo do elemento trigger.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Popover Esquerda</Button>
                  </PopoverTrigger>
                  <PopoverContent side="left" className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Popover Esquerda</h4>
                      <p className="text-sm text-muted-foreground">
                        Este popover abre à esquerda do elemento trigger.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Popover Direita</Button>
                  </PopoverTrigger>
                  <PopoverContent side="right" className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Popover Direita</h4>
                      <p className="text-sm text-muted-foreground">
                        Este popover abre à direita do elemento trigger.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Popover with Form */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Com Formulário</h4>
              <div className="flex flex-wrap gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="gradient">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Tag
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Nova Tag</h4>
                        <p className="text-sm text-muted-foreground">
                          Adicione uma tag ao item selecionado.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tag-name">Nome da Tag</Label>
                        <Input id="tag-name" placeholder="Digite o nome..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Cor</Label>
                        <div className="flex gap-2">
                          {['bg-primary', 'bg-secondary', 'bg-[hsl(var(--success))]', 'bg-[hsl(var(--warning))]', 'bg-destructive'].map((color) => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-full ${color} hover:ring-2 ring-offset-2 ring-offset-background ring-ring transition-all`}
                            />
                          ))}
                        </div>
                      </div>
                      <Button variant="gradient" className="w-full">Criar Tag</Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Selecionar Data
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={popoverDate}
                      onSelect={setPopoverDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Popover with Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Com Ações</h4>
              <div className="flex flex-wrap gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1">
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start gap-2 h-9">
                        <Edit className="h-4 w-4" /> Editar
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-2 h-9">
                        <Copy className="h-4 w-4" /> Duplicar
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-2 h-9">
                        <Share2 className="h-4 w-4" /> Compartilhar
                      </Button>
                      <div className="h-px bg-border my-1" />
                      <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" /> Excluir
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72">
                    <div className="space-y-4">
                      <h4 className="font-medium">Filtrar por</h4>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="active">Ativos</SelectItem>
                              <SelectItem value="completed">Concluídos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Técnica</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Todas" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todas</SelectItem>
                              <SelectItem value="silk">Silk</SelectItem>
                              <SelectItem value="laser">Laser</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">Limpar</Button>
                        <Button variant="gradient" className="flex-1">Aplicar</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Popover"
              code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Abrir Popover</Button>
  </PopoverTrigger>
  <PopoverContent side="bottom" className="w-80">
    <div className="space-y-2">
      <h4 className="font-medium">Título</h4>
      <p className="text-sm text-muted-foreground">
        Conteúdo do popover aqui.
      </p>
    </div>
  </PopoverContent>
</Popover>

{/* Posições: side="top" | "bottom" | "left" | "right" */}

{/* Com formulário */}
<PopoverContent className="w-80">
  <div className="space-y-4">
    <Label htmlFor="name">Nome</Label>
    <Input id="name" placeholder="Digite..." />
    <Button variant="gradient" className="w-full">Salvar</Button>
  </div>
</PopoverContent>

{/* Com Calendar (DatePicker) */}
<PopoverContent className="w-auto p-0" align="start">
  <Calendar
    mode="single"
    selected={date}
    onSelect={setDate}
    className="pointer-events-auto"
  />
</PopoverContent>

{/* Menu de ações */}
<PopoverContent className="w-48 p-1">
  <Button variant="ghost" className="w-full justify-start gap-2">
    <Edit className="h-4 w-4" /> Editar
  </Button>
  <Button variant="ghost" className="w-full justify-start gap-2 text-destructive">
    <Trash2 className="h-4 w-4" /> Excluir
  </Button>
</PopoverContent>`}
            />
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="HoverCard"
              code={`<HoverCard>
  <HoverCardTrigger asChild>
    <span className="cursor-pointer underline">@username</span>
  </HoverCardTrigger>
  <HoverCardContent className="w-80">
    <div className="flex space-x-4">
      <Avatar>
        <AvatarImage src="..." />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">Nome Completo</h4>
        <p className="text-sm text-muted-foreground">@username</p>
        <p className="text-sm">Bio do usuário aqui.</p>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>

{/* Com informações detalhadas */}
<HoverCardContent className="w-80">
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-semibold">Pedido #001</h4>
      <StatusBadge status="production" />
    </div>
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div>
        <p className="text-muted-foreground">Cliente</p>
        <p className="font-medium">Empresa ABC</p>
      </div>
      ...
    </div>
    <Progress value={65} variant="xp" className="h-2" />
  </div>
</HoverCardContent>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Hover Cards */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Hover Cards
          </CardTitle>
          <CardDescription>Cards com informações detalhadas que aparecem ao passar o mouse</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* User Hover Cards */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Perfil de Usuário</h4>
              <div className="flex flex-wrap gap-6">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium underline underline-offset-4">@joao_silva</span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-sm font-semibold">João da Silva</h4>
                        <p className="text-sm text-muted-foreground">@joao_silva</p>
                        <p className="text-sm">
                          Operador de Silk Têxtil com 5 anos de experiência.
                        </p>
                        <div className="flex items-center pt-2">
                          <Calendar className="mr-2 h-4 w-4 opacity-70" />
                          <span className="text-xs text-muted-foreground">
                            Entrou em Março de 2020
                          </span>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">MC</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium underline underline-offset-4">@maria_coord</span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">MC</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-sm font-semibold">Maria Costa</h4>
                        <p className="text-sm text-muted-foreground">@maria_coord</p>
                        <Badge variant="secondary" className="mt-1">Coordenadora</Badge>
                        <p className="text-sm mt-2">
                          Coordenadora de Gravação responsável pelo setor de Laser.
                        </p>
                        <div className="flex items-center pt-2">
                          <Calendar className="mr-2 h-4 w-4 opacity-70" />
                          <span className="text-xs text-muted-foreground">
                            Entrou em Janeiro de 2019
                          </span>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>

            {/* Product Hover Cards */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Informações de Trabalho</h4>
              <div className="flex flex-wrap gap-4">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Badge variant="outline" className="cursor-pointer hover:border-primary transition-colors">
                      #ORD-2024-001
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Pedido #ORD-2024-001</h4>
                        <StatusBadge status="production" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Cliente</p>
                          <p className="font-medium">Empresa ABC</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Técnica</p>
                          <p className="font-medium">Silk Têxtil</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quantidade</p>
                          <p className="font-medium">500 peças</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prazo</p>
                          <p className="font-medium">15/12/2024</p>
                        </div>
                      </div>
                      <Progress value={65} variant="xp" className="h-2" />
                      <p className="text-xs text-muted-foreground">65% concluído</p>
                    </div>
                  </HoverCardContent>
                </HoverCard>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors">
                      <Zap className="h-3 w-3 mr-1" />
                      Fiber Laser
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
                          <Zap className="h-4 w-4 text-destructive" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold">Fiber Laser</h4>
                          <p className="text-xs text-muted-foreground">Técnica de Gravação</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Gravação a laser de alta precisão em metais e plásticos. Ideal para marcações permanentes.
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline">4 máquinas</Badge>
                        <Badge variant="outline">~5min setup</Badge>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Guide */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Guia de Uso
          </CardTitle>
          <CardDescription>Quando usar cada componente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Tooltip
              </h4>
              <p className="text-sm text-muted-foreground">
                Use para informações breves e não interativas. Aparece instantaneamente ao passar o mouse. Ideal para descrever ícones e ações.
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-secondary" />
                Popover
              </h4>
              <p className="text-sm text-muted-foreground">
                Use para conteúdo interativo como formulários, menus de ações ou filtros. Permanece aberto até ser fechado explicitamente.
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-accent" />
                Hover Card
              </h4>
              <p className="text-sm text-muted-foreground">
                Use para previews de conteúdo como perfis de usuário ou detalhes de itens. Aparece com delay e fecha ao sair do hover.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
