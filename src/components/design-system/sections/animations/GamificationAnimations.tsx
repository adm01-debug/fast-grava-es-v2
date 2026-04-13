import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Flame, Coins, Sparkles, Award, Star } from 'lucide-react';

export function GamificationAnimations({ animationKey }: { animationKey: number }) {
  return (
    <Card className="card-interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Animações de Gamificação
        </CardTitle>
        <CardDescription>Animações especiais para elementos de gamificação</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">XP Bar Shimmer</h4>
          <div className="space-y-2">
            <div className="h-4 rounded-full bg-muted overflow-hidden"><div className="h-full w-3/4 rounded-full xp-bar xp-bar-glow" /></div>
            <p className="text-xs text-muted-foreground">Classes: <code className="text-primary">.xp-bar .xp-bar-glow</code></p>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Streak Fire Pulse</h4>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 streak-fire"><Flame className="h-8 w-8 text-orange-500" /><span className="text-2xl font-bold">7</span></div>
            <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.streak-fire</code></p>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Coin Shine</h4>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--coins))] flex items-center justify-center coin-shine"><Coins className="h-6 w-6 text-yellow-900" /></div>
            <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.coin-shine</code></p>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Level Up Flash</h4>
          <div key={animationKey + 2} className="flex gap-4">
            <div className="px-6 py-3 rounded-lg bg-[hsl(var(--xp))] text-white font-bold animate-level-up">LEVEL UP!</div>
            <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.animate-level-up</code></p>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Achievement Unlock</h4>
          <div key={animationKey + 3} className="flex gap-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[hsl(var(--gold))] text-yellow-900 achievement-unlock"><Trophy className="h-6 w-6" /><span className="font-bold">Conquista Desbloqueada!</span></div>
            <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.achievement-unlock</code></p>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Points Pop</h4>
          <div key={animationKey + 4} className="flex gap-4">
            <div className="text-2xl font-bold text-[hsl(var(--xp))] points-pop">+100</div>
            <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.points-pop</code></p>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ranking Badges</h4>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2 text-center"><div className="w-16 h-16 rounded-full flex items-center justify-center rank-gold"><Trophy className="h-8 w-8 text-yellow-900" /></div><p className="text-xs text-muted-foreground">.rank-gold</p></div>
            <div className="space-y-2 text-center"><div className="w-16 h-16 rounded-full flex items-center justify-center rank-silver"><Award className="h-8 w-8 text-gray-700" /></div><p className="text-xs text-muted-foreground">.rank-silver</p></div>
            <div className="space-y-2 text-center"><div className="w-16 h-16 rounded-full flex items-center justify-center rank-bronze"><Star className="h-8 w-8 text-orange-900" /></div><p className="text-xs text-muted-foreground">.rank-bronze</p></div>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Floating Icon</h4>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center animate-float"><Sparkles className="h-6 w-6 text-white" /></div>
            <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.animate-float</code></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
