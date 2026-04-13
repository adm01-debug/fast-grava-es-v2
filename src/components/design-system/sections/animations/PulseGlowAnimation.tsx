import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Zap } from 'lucide-react';

export function PulseGlowAnimation() {
  return (
    <Card className="card-interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Animação Pulse Glow
        </CardTitle>
        <CardDescription>Pulsação contínua com glow</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          <div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center pulse-glow">
            <Zap className="h-10 w-10 text-primary-foreground" />
          </div>
          <div className="space-y-2 self-center">
            <p className="text-sm font-medium">Pulse Glow</p>
            <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">.pulse-glow</code></p>
            <p className="text-xs text-muted-foreground">Efeito de pulsação contínua ideal para CTAs e notificações</p>
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
          <CodeBlock code={'<div className="pulse-glow">\n  <Zap /> Ação importante\n</div>'} label="Pulse Glow" />
        </div>
      </CardContent>
    </Card>
  );
}
