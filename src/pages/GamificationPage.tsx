import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { FavoriteButton, FavoritesDropdown } from '@/components/navigation/FavoritesManager';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { VoiceButton } from '@/components/voice/VoiceCommands';
import { useGamification } from '@/hooks/useGamification';
import { Trophy, Medal, Star, Target, Zap, Award, Crown, TrendingUp, Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
const achievementIcons: Record<string, React.ElementType> = {
  trophy: Trophy,
  medal: Medal,
  star: Star,
  target: Target,
  zap: Zap,
  award: Award,
  crown: Crown,
};

export default function GamificationPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const { rankings, achievements, isLoading, periodStart, periodEnd } = useGamification(period);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </MainLayout>
    );
  }

  const topThree = rankings.slice(0, 3);
  const restRankings = rankings.slice(3);

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in-up">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-display font-bold">
                <span className="gradient-text">Ranking de Operadores</span>
              </h1>
              <FavoriteButton 
                path="/gamification" 
                name="Gamificação" 
              />
            </div>
            <p className="text-muted-foreground">
              {format(periodStart, "dd 'de' MMMM", { locale: ptBR })} - {format(periodEnd, "dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <VoiceButton />
            <FavoritesDropdown onNavigate={(url) => navigate(url)} />
            <Badge variant="outline" className="gap-1 text-xs hidden sm:flex">
              <Command className="h-3 w-3" />K para buscar
            </Badge>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
              <TabsList>
                <TabsTrigger value="daily">Diário</TabsTrigger>
                <TabsTrigger value="weekly">Semanal</TabsTrigger>
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Podium */}
        <Card className="glass-card overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-to-r from-amber-500/10 via-gray-500/10 to-orange-500/10">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Pódio
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-end justify-center gap-4 sm:gap-8">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mb-2 shadow-lg">
                    <Medal className="w-8 h-8 sm:w-10 sm:h-10 text-gray-700" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm sm:text-base truncate max-w-[100px]">
                      {topThree[1].profile?.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{topThree[1].total_points} pts</p>
                  </div>
                  <div className="w-20 sm:w-24 h-16 sm:h-20 bg-gray-400 rounded-t-lg mt-2 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-700">2</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className="flex flex-col items-center -mt-4">
                  <Crown className="w-8 h-8 text-amber-500 mb-1 animate-bounce" />
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-2 shadow-xl ring-4 ring-amber-300/50">
                    <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-amber-900" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-base sm:text-lg truncate max-w-[120px]">
                      {topThree[0].profile?.full_name}
                    </p>
                    <p className="text-sm text-amber-500 font-semibold">{topThree[0].total_points} pts</p>
                  </div>
                  <div className="w-24 sm:w-28 h-24 sm:h-28 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-lg mt-2 flex items-center justify-center">
                    <span className="text-3xl font-bold text-amber-900">1</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-2 shadow-lg">
                    <Award className="w-8 h-8 sm:w-10 sm:h-10 text-orange-900" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm sm:text-base truncate max-w-[100px]">
                      {topThree[2].profile?.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{topThree[2].total_points} pts</p>
                  </div>
                  <div className="w-20 sm:w-24 h-12 sm:h-16 bg-orange-600 rounded-t-lg mt-2 flex items-center justify-center">
                    <span className="text-2xl font-bold text-orange-900">3</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Full Rankings */}
          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Ranking Completo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rankings.map((r, index) => (
                  <div 
                    key={r.id} 
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg transition-colors",
                      index < 3 ? "bg-muted/50" : "hover:bg-muted/30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                      index === 0 ? "bg-amber-500 text-amber-950" :
                      index === 1 ? "bg-gray-400 text-gray-950" :
                      index === 2 ? "bg-orange-600 text-orange-950" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {r.position}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{r.profile?.full_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{r.total_produced.toLocaleString()} pçs</span>
                        <span>•</span>
                        <span>{r.efficiency_rate.toFixed(0)}% efic.</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg">{r.total_points}</p>
                      <p className="text-xs text-muted-foreground">pontos</p>
                    </div>

                    <div className="w-24 hidden sm:block">
                      <Progress value={r.quality_rate} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        {r.quality_rate.toFixed(0)}% qual.
                      </p>
                    </div>
                  </div>
                ))}

                {rankings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Nenhum dado de ranking para este período</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Conquistas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.slice(0, 8).map((a) => {
                  const Icon = achievementIcons[a.icon] || Trophy;
                  return (
                    <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{a.achievement_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        +{a.points}
                      </Badge>
                    </div>
                  );
                })}

                {achievements.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Nenhuma conquista ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
