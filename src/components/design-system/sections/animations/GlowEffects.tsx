import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Wand2 } from 'lucide-react';

export function GlowEffects() {
  return (
    <Card className="card-interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          Efeitos de Glow (Brilho)
        </CardTitle>
        <CardDescription>Efeitos de brilho e neon para destaque</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-primary flex items-center justify-center glow-primary"><span className="text-sm font-medium text-primary-foreground">Primary</span></div>
            <p className="text-xs text-muted-foreground text-center">.glow-primary</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-secondary flex items-center justify-center glow-secondary"><span className="text-sm font-medium text-secondary-foreground">Secondary</span></div>
            <p className="text-xs text-muted-foreground text-center">.glow-secondary</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[hsl(var(--success))] flex items-center justify-center glow-success"><span className="text-sm font-medium text-white">Success</span></div>
            <p className="text-xs text-muted-foreground text-center">.glow-success</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-accent flex items-center justify-center glow-accent"><span className="text-sm font-medium text-accent-foreground">Accent</span></div>
            <p className="text-xs text-muted-foreground text-center">.glow-accent</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[hsl(var(--warning))] flex items-center justify-center glow-warning"><span className="text-sm font-medium text-foreground">Warning</span></div>
            <p className="text-xs text-muted-foreground text-center">.glow-warning</p>
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CodeBlock code={'<div className="xp-bar xp-bar-glow">\n  Barra de XP\n</div>'} label="XP Bar" />
            <CodeBlock code={'<div className="streak-fire">\n  <Flame /> 7\n</div>'} label="Streak Fire" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CodeBlock code={'<div className="coin-shine">\n  <Coins />\n</div>'} label="Coin Shine" />
            <CodeBlock code={'<div className="animate-level-up">\n  LEVEL UP!\n</div>'} label="Level Up" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CodeBlock code={'<div className="achievement-unlock">\n  <Trophy /> Conquista!\n</div>'} label="Achievement Unlock" />
            <CodeBlock code={'<div className="points-pop">\n  +100\n</div>'} label="Points Pop" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CodeBlock code={'<div className="rank-gold">\n  <Trophy />\n</div>'} label="Rank Gold" />
            <CodeBlock code={'<div className="animate-float">\n  <Sparkles />\n</div>'} label="Float Animation" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
