import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, HelpCircle, Info, Layers, User, Zap } from 'lucide-react';

export function HoverCardsSection() {
  return (
    <>
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" />Hover Cards</CardTitle>
          <CardDescription>Cards com informações detalhadas que aparecem ao passar o mouse</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Perfil de Usuário</h4>
              <div className="flex flex-wrap gap-6">
                <HoverCard><HoverCardTrigger asChild><div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"><Avatar><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>JD</AvatarFallback></Avatar><span className="text-sm font-medium underline underline-offset-4">@joao_silva</span></div></HoverCardTrigger>
                  <HoverCardContent className="w-80"><div className="flex justify-between space-x-4"><Avatar className="h-12 w-12"><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>JD</AvatarFallback></Avatar><div className="space-y-1 flex-1"><h4 className="text-sm font-semibold">João da Silva</h4><p className="text-sm text-muted-foreground">@joao_silva</p><p className="text-sm">Operador de Silk Têxtil com 5 anos de experiência.</p><div className="flex items-center pt-2"><Calendar className="mr-2 h-4 w-4 opacity-70" /><span className="text-xs text-muted-foreground">Entrou em Março de 2020</span></div></div></div></HoverCardContent>
                </HoverCard>
                <HoverCard><HoverCardTrigger asChild><div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"><Avatar><AvatarFallback className="bg-primary text-primary-foreground">MC</AvatarFallback></Avatar><span className="text-sm font-medium underline underline-offset-4">@maria_coord</span></div></HoverCardTrigger>
                  <HoverCardContent className="w-80"><div className="flex justify-between space-x-4"><Avatar className="h-12 w-12"><AvatarFallback className="bg-primary text-primary-foreground">MC</AvatarFallback></Avatar><div className="space-y-1 flex-1"><h4 className="text-sm font-semibold">Maria Costa</h4><p className="text-sm text-muted-foreground">@maria_coord</p><Badge variant="secondary" className="mt-1">Coordenadora</Badge><p className="text-sm mt-2">Coordenadora de Gravação responsável pelo setor de Laser.</p><div className="flex items-center pt-2"><Calendar className="mr-2 h-4 w-4 opacity-70" /><span className="text-xs text-muted-foreground">Entrou em Janeiro de 2019</span></div></div></div></HoverCardContent>
                </HoverCard>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Informações de Trabalho</h4>
              <div className="flex flex-wrap gap-4">
                <HoverCard><HoverCardTrigger asChild><Badge variant="outline" className="cursor-pointer hover:border-primary transition-colors">#ORD-2024-001</Badge></HoverCardTrigger>
                  <HoverCardContent className="w-80"><div className="space-y-3"><div className="flex items-center justify-between"><h4 className="text-sm font-semibold">Pedido #ORD-2024-001</h4><StatusBadge status="production" /></div><div className="grid grid-cols-2 gap-2 text-sm"><div><p className="text-muted-foreground">Cliente</p><p className="font-medium">Empresa ABC</p></div><div><p className="text-muted-foreground">Técnica</p><p className="font-medium">Silk Têxtil</p></div><div><p className="text-muted-foreground">Quantidade</p><p className="font-medium">500 peças</p></div><div><p className="text-muted-foreground">Prazo</p><p className="font-medium">15/12/2024</p></div></div><Progress value={65} variant="xp" className="h-2" /><p className="text-xs text-muted-foreground">65% concluído</p></div></HoverCardContent>
                </HoverCard>
                <HoverCard><HoverCardTrigger asChild><Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors"><Zap className="h-3 w-3 mr-1" />Fiber Laser</Badge></HoverCardTrigger>
                  <HoverCardContent className="w-72"><div className="space-y-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center"><Zap className="h-4 w-4 text-destructive" /></div><div><h4 className="text-sm font-semibold">Fiber Laser</h4><p className="text-xs text-muted-foreground">Técnica de Gravação</p></div></div><p className="text-sm text-muted-foreground">Gravação a laser de alta precisão em metais e plásticos.</p><div className="flex gap-2"><Badge variant="outline">4 máquinas</Badge><Badge variant="outline">~5min setup</Badge></div></div></HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary" />Guia de Uso</CardTitle>
          <CardDescription>Quando usar cada componente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 rounded-lg bg-muted/50"><h4 className="font-semibold flex items-center gap-2"><Info className="h-4 w-4 text-primary" />Tooltip</h4><p className="text-sm text-muted-foreground">Use para informações breves e não interativas. Aparece instantaneamente ao passar o mouse.</p></div>
            <div className="space-y-2 p-4 rounded-lg bg-muted/50"><h4 className="font-semibold flex items-center gap-2"><Layers className="h-4 w-4 text-secondary" />Popover</h4><p className="text-sm text-muted-foreground">Use para conteúdo interativo como formulários, menus de ações ou filtros.</p></div>
            <div className="space-y-2 p-4 rounded-lg bg-muted/50"><h4 className="font-semibold flex items-center gap-2"><User className="h-4 w-4 text-accent" />Hover Card</h4><p className="text-sm text-muted-foreground">Use para previews de conteúdo como perfis de usuário ou detalhes de itens.</p></div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
