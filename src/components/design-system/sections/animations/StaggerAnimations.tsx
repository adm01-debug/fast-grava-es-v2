import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Sparkles } from 'lucide-react';

export function StaggerAnimations({ animationKey }: { animationKey: number }) {
  return (
    <Card className="card-interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Animações Stagger (Escalonadas)
        </CardTitle>
        <CardDescription>Delays sequenciais para listas de elementos</CardDescription>
      </CardHeader>
      <CardContent>
        <div key={animationKey + 1} className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className={`h-16 w-16 rounded-lg gradient-primary flex items-center justify-center text-white font-bold animate-fade-in opacity-0 [animation-fill-mode:forwards] stagger-${num}`}>
              {num}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Classes: <code className="text-primary">.stagger-1</code> até <code className="text-primary">.stagger-6</code>
        </p>
        <div className="space-y-3 pt-4 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
          <CodeBlock code={'{items.map((item, index) => (\n  <div \n    key={item.id}\n    className={`animate-fade-in stagger-${index + 1}`}\n  >\n    {item.content}\n  </div>\n))}'} label="Lista com Stagger" />
        </div>
        <div className="space-y-3 pt-4 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CodeBlock code={'<div className="hover-lift">\n  Eleva no hover\n</div>'} label="Hover Lift" />
            <CodeBlock code={'<div className="hover-scale">\n  Escala no hover\n</div>'} label="Hover Scale" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CodeBlock code={'<div className="hover-glow">\n  Brilha no hover\n</div>'} label="Hover Glow" />
            <CodeBlock code={'<Card className="card-interactive">\n  Card interativo\n</Card>'} label="Card Interactive" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
