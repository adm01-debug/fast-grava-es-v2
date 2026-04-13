import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { MousePointer2 } from 'lucide-react';

export function HoverEffects() {
  return (
    <Card className="card-interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MousePointer2 className="h-5 w-5 text-primary" />
          Efeitos de Hover
        </CardTitle>
        <CardDescription>Interações visuais ao passar o mouse</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-muted flex items-center justify-center hover-lift cursor-pointer">
              <span className="text-sm font-medium">Hover Lift</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">.hover-lift</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-muted flex items-center justify-center hover-scale cursor-pointer">
              <span className="text-sm font-medium">Hover Scale</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">.hover-scale</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-primary/20 flex items-center justify-center hover-glow cursor-pointer">
              <span className="text-sm font-medium">Hover Glow</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">.hover-glow</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-lg bg-muted flex items-center justify-center card-interactive cursor-pointer border">
              <span className="text-sm font-medium">Card Interactive</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">.card-interactive</p>
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CodeBlock code={'<div className="bg-primary glow-primary">\n  Glow Primary\n</div>'} label="Glow Primary" />
            <CodeBlock code={'<div className="bg-success glow-success">\n  Glow Success\n</div>'} label="Glow Success" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
