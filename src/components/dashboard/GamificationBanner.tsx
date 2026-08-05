import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/features/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, TrendingUp, Award } from 'lucide-react';
import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';

export function GamificationBanner() {
  const { user, isOperator } = useAuth();
  const { rankings, isLoading } = useGamification('weekly');

  const userRanking = useMemo(() => {
    if (!user || !rankings.length) return null;
    return rankings.find(r => r.operator_id === user.id);
  }, [user, rankings]);

  if (!isOperator || isLoading || !userRanking) return null;

  // Calculate XP progress to "next level" (simulated)
  const currentXP = userRanking.total_points;
  const level = Math.floor(currentXP / 1000) + 1;
  const xpInLevel = currentXP % 1000;
  const progress = (xpInLevel / 1000) * 100;

  return (
    <Card className="bg-gradient-to-r from-violet-600/10 via-primary/5 to-transparent border-primary/20 overflow-hidden mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <Badge className="absolute -bottom-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground border-2 border-background text-[10px]">
                {userRanking.position}
              </Badge>
            </div>

            <div>
              <h3 className="font-bold text-sm flex items-center gap-2">
                Nível {level} - Especialista
                <Badge variant="outline" className="text-[10px] h-4 px-1 border-primary/30 text-primary">
                  Semanal
                </Badge>
              </h3>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-foreground">{userRanking.total_points}</span> XP Total
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  Top <span className="font-bold text-foreground">#{userRanking.position}</span> no Ranking
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-xs w-full space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Progresso de Nível</span>
              <span>{xpInLevel} / 1000 XP</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-primary/10" variant="xp" />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Produção</p>
              <p className="text-xs font-bold">{userRanking.total_produced} peças</p>
            </div>
            <div className="w-[1px] h-8 bg-border/50 mx-2 hidden sm:block" />
            <Award className="h-8 w-8 text-primary/40" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
