import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Play } from 'lucide-react';

export function EntryAnimations({ animationKey }: { animationKey: number }) {
  return (
    <Card className="card-interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" />
          Animações de Entrada
        </CardTitle>
        <CardDescription>Animações para elementos que aparecem na tela</CardDescription>
      </CardHeader>
      <CardContent>
        <div key={animationKey} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-muted flex items-center justify-center animate-fade-in opacity-0 [animation-fill-mode:forwards]">
              <span className="text-sm font-medium">Fade In</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">.animate-fade-in</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-muted flex items-center justify-center animate-scale-in opacity-0 [animation-fill-mode:forwards] [animation-delay:0.1s]">
              <span className="text-sm font-medium">Scale In</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">.animate-scale-in</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-muted flex items-center justify-center animate-slide-in-right opacity-0 [animation-fill-mode:forwards] [animation-delay:0.2s]">
              <span className="text-sm font-medium">Slide Right</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">.animate-slide-in-right</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-muted flex items-center justify-center animate-enter opacity-0 [animation-fill-mode:forwards] [animation-delay:0.3s]">
              <span className="text-sm font-medium">Enter (Combined)</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">.animate-enter</p>
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CodeBlock code={'<div className="animate-fade-in">\n  Conteúdo com fade in\n</div>'} label="Fade In" />
            <CodeBlock code={'<div className="animate-scale-in">\n  Conteúdo com scale in\n</div>'} label="Scale In" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CodeBlock code={'<div className="animate-slide-in-right">\n  Slide da direita\n</div>'} label="Slide In Right" />
            <CodeBlock code={'<div className="animate-enter">\n  Fade + Scale combinados\n</div>'} label="Enter (Combined)" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
