import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Sparkles } from 'lucide-react';

const glowCards = [
  { cls: 'card-glow-blue', title: 'Glow Blue', desc: 'Glow azul no hover', color: 'hsl(210,100%,55%)' },
  { cls: 'card-glow-green', title: 'Glow Green', desc: 'Glow verde no hover', color: 'hsl(142,70%,45%)' },
  { cls: 'card-glow-purple', title: 'Glow Purple', desc: 'Glow roxo no hover', color: 'hsl(280,80%,55%)' },
  { cls: 'card-glow-orange', title: 'Glow Orange', desc: 'Glow laranja no hover', color: 'hsl(24,95%,50%)' },
];

export function CardCSSUtilities() {
  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Classes CSS Utilitárias</CardTitle>
        <CardDescription>Classes adicionais para efeitos especiais via className</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="card-interactive card-shine">
            <CardHeader><CardTitle className="text-lg">Card Shine</CardTitle><CardDescription>Efeito de brilho passando</CardDescription></CardHeader>
            <CardContent><code className="text-xs text-primary">card-interactive card-shine</code></CardContent>
          </Card>
          <Card className="card-float">
            <CardHeader><CardTitle className="text-lg">Card Float</CardTitle><CardDescription>Elevação suave no hover</CardDescription></CardHeader>
            <CardContent><code className="text-xs text-primary">card-float</code></CardContent>
          </Card>
          <Card className="card-pulse-border">
            <CardHeader><CardTitle className="text-lg">Pulse Border</CardTitle><CardDescription>Borda pulsante animada</CardDescription></CardHeader>
            <CardContent><code className="text-xs text-primary">card-pulse-border</code></CardContent>
          </Card>
          {glowCards.map(g => (
            <Card key={g.cls} className={g.cls}>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />{g.title}</CardTitle><CardDescription>{g.desc}</CardDescription></CardHeader>
              <CardContent><code className="text-xs text-primary">{g.cls}</code></CardContent>
            </Card>
          ))}
          <Card className="glass-card hover-lift">
            <CardHeader><CardTitle className="text-lg">Glass Card</CardTitle><CardDescription>Glassmorphism clássico</CardDescription></CardHeader>
            <CardContent><code className="text-xs text-primary">glass-card hover-lift</code></CardContent>
          </Card>
          <Card className="hover-lift">
            <CardHeader><CardTitle className="text-lg">Hover Lift</CardTitle><CardDescription>Eleva no hover com sombra</CardDescription></CardHeader>
            <CardContent><code className="text-xs text-primary">hover-lift</code></CardContent>
          </Card>
        </div>
        <div className="space-y-3 pt-4 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <CodeBlock code={'<Card className="card-interactive card-shine">...</Card>'} label="Interactive + Shine" />
            <CodeBlock code={'<Card className="card-float">...</Card>'} label="Float" />
            <CodeBlock code={'<Card className="glass-card hover-lift">...</Card>'} label="Glass + Hover Lift" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
