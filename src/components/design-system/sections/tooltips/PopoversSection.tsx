import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodeBlock } from '@/components/ui/code-block';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar, Copy, Edit, Filter, Layers, MoreHorizontal, Plus, Share2, Trash2 } from 'lucide-react';

export function PopoversSection() {
  const [popoverDate, setPopoverDate] = useState<Date | undefined>(new Date());

  return (
    <Card className="card-interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-primary" />Popovers</CardTitle>
        <CardDescription>Painéis flutuantes com conteúdo interativo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Posições</h4>
            <div className="flex flex-wrap gap-4">
              {(['top', 'bottom', 'left', 'right'] as const).map(side => (
                <Popover key={side}><PopoverTrigger asChild><Button variant="outline">Popover {side === 'top' ? 'Topo' : side === 'bottom' ? 'Inferior' : side === 'left' ? 'Esquerda' : 'Direita'}</Button></PopoverTrigger><PopoverContent side={side} className="w-80"><div className="space-y-2"><h4 className="font-medium">Popover {side}</h4><p className="text-sm text-muted-foreground">Este popover abre {side === 'top' ? 'acima' : side === 'bottom' ? 'abaixo' : side === 'left' ? 'à esquerda' : 'à direita'} do trigger.</p></div></PopoverContent></Popover>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Com Formulário</h4>
            <div className="flex flex-wrap gap-4">
              <Popover><PopoverTrigger asChild><Button variant="gradient"><Plus className="h-4 w-4 mr-2" />Adicionar Tag</Button></PopoverTrigger>
                <PopoverContent className="w-80"><div className="space-y-4"><div className="space-y-2"><h4 className="font-medium">Nova Tag</h4><p className="text-sm text-muted-foreground">Adicione uma tag ao item selecionado.</p></div><div className="space-y-2"><Label htmlFor="tag-name">Nome da Tag</Label><Input id="tag-name" placeholder="Digite o nome..." /></div><div className="space-y-2"><Label>Cor</Label><div className="flex gap-2">{['bg-primary', 'bg-secondary', 'bg-[hsl(var(--success))]', 'bg-[hsl(var(--warning))]', 'bg-destructive'].map((color) => (<button key={color} className={`w-6 h-6 rounded-full ${color} hover:ring-2 ring-offset-2 ring-offset-background ring-ring transition-all`} />))}</div></div><Button variant="gradient" className="w-full">Criar Tag</Button></div></PopoverContent>
              </Popover>
              <Popover><PopoverTrigger asChild><Button variant="outline"><Calendar className="h-4 w-4 mr-2" />Selecionar Data</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><CalendarComponent mode="single" selected={popoverDate} onSelect={setPopoverDate} initialFocus className="pointer-events-auto" /></PopoverContent></Popover>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Com Ações</h4>
            <div className="flex flex-wrap gap-4">
              <Popover><PopoverTrigger asChild><Button variant="outline" size="icon"><MoreHorizontal className="h-5 w-5" /></Button></PopoverTrigger>
                <PopoverContent className="w-48 p-1"><div className="space-y-1"><Button variant="ghost" className="w-full justify-start gap-2 h-9"><Edit className="h-4 w-4" /> Editar</Button><Button variant="ghost" className="w-full justify-start gap-2 h-9"><Copy className="h-4 w-4" /> Duplicar</Button><Button variant="ghost" className="w-full justify-start gap-2 h-9"><Share2 className="h-4 w-4" /> Compartilhar</Button><div className="h-px bg-border my-1" /><Button variant="ghost" className="w-full justify-start gap-2 h-9 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /> Excluir</Button></div></PopoverContent>
              </Popover>
              <Popover><PopoverTrigger asChild><Button variant="secondary"><Filter className="h-4 w-4 mr-2" />Filtros</Button></PopoverTrigger>
                <PopoverContent className="w-72"><div className="space-y-4"><h4 className="font-medium">Filtrar por</h4><div className="space-y-3"><div className="space-y-2"><Label>Status</Label><Select><SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="active">Ativos</SelectItem><SelectItem value="completed">Concluídos</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Técnica</Label><Select><SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="silk">Silk</SelectItem><SelectItem value="laser">Laser</SelectItem></SelectContent></Select></div></div><div className="flex gap-2"><Button variant="outline" className="flex-1">Limpar</Button><Button variant="gradient" className="flex-1">Aplicar</Button></div></div></PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <div className="space-y-4 pt-4 border-t"><h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4><CodeBlock label="Popover" code={`<Popover>\n  <PopoverTrigger asChild>\n    <Button>Abrir</Button>\n  </PopoverTrigger>\n  <PopoverContent className="w-80">\n    Conteúdo\n  </PopoverContent>\n</Popover>`} /></div>
        <div className="space-y-4 pt-4 border-t"><h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4><CodeBlock label="HoverCard" code={`<HoverCard>\n  <HoverCardTrigger asChild>\n    <span>@username</span>\n  </HoverCardTrigger>\n  <HoverCardContent className="w-80">\n    Conteúdo\n  </HoverCardContent>\n</HoverCard>`} /></div>
      </CardContent>
    </Card>
  );
}
