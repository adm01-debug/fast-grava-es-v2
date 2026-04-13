import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/ui/code-block';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bell, HelpCircle, Info, Settings, Trash2, User } from 'lucide-react';

export function TooltipsBasicSection() {
  return (
    <Card className="card-interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary" />Tooltips</CardTitle>
        <CardDescription>Dicas contextuais que aparecem ao passar o mouse</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Posições</h4>
              <div className="flex flex-wrap gap-4">
                {(['top', 'bottom', 'left', 'right'] as const).map(side => (
                  <Tooltip key={side}>
                    <TooltipTrigger asChild><Button variant="outline">Tooltip {side === 'top' ? 'Topo' : side === 'bottom' ? 'Inferior' : side === 'left' ? 'Esquerda' : 'Direita'}</Button></TooltipTrigger>
                    <TooltipContent side={side}><p>Tooltip posicionado {side === 'top' ? 'no topo' : side === 'bottom' ? 'embaixo' : side === 'left' ? 'à esquerda' : 'à direita'}</p></TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Em Ícones</h4>
              <div className="flex flex-wrap gap-4">
                {[{ icon: Settings, label: 'Configurações' }, { icon: Bell, label: 'Notificações' }, { icon: User, label: 'Meu Perfil' }].map(({ icon: Icon, label }) => (
                  <Tooltip key={label}><TooltipTrigger asChild><Button variant="ghost" size="icon"><Icon className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent><p>{label}</p></TooltipContent></Tooltip>
                ))}
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent><p>Excluir item</p></TooltipContent></Tooltip>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tooltips com Conteúdo Rico</h4>
              <div className="flex flex-wrap gap-4">
                <Tooltip><TooltipTrigger asChild><Button variant="gradient">Com Atalho</Button></TooltipTrigger><TooltipContent className="flex items-center gap-2"><p>Salvar alterações</p><kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">⌘S</kbd></TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Badge variant="secondary" className="cursor-pointer"><HelpCircle className="h-3 w-3 mr-1" />Ajuda</Badge></TooltipTrigger><TooltipContent className="max-w-xs"><p className="font-medium">Precisa de ajuda?</p><p className="text-xs text-muted-foreground mt-1">Clique aqui para acessar nossa base de conhecimento com tutoriais e FAQs.</p></TooltipContent></Tooltip>
              </div>
            </div>
          </div>
        </TooltipProvider>
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
          <CodeBlock label="Tooltip" code={`<TooltipProvider>\n  <Tooltip>\n    <TooltipTrigger asChild>\n      <Button variant="outline">Hover me</Button>\n    </TooltipTrigger>\n    <TooltipContent side="top">\n      <p>Tooltip no topo</p>\n    </TooltipContent>\n  </Tooltip>\n</TooltipProvider>`} />
        </div>
      </CardContent>
    </Card>
  );
}
