import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { FavoriteButton, FavoritesDropdown } from '@/components/navigation/FavoritesManager';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { VoiceButton } from '@/components/voice/VoiceCommands';
import { useGamification } from '@/hooks/useGamification';
import { toast } from 'sonner';
import { Trophy, Medal, Star, Target, Zap, Award, Crown, TrendingUp, Command, Package, Clock, Sparkles, Loader2 } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'ranking' | 'rewards'>('ranking');
  const { rankings, achievements, isLoading, periodStart, periodEnd } = useGamification(period);
  const [balance, setBalance] = useState(3500); // Mock user balance
  const [redeemingId, setRedeemingId] = useState<number | null>(null);

  const handleRedeem = (reward: any) => {
    if (balance >= reward.cost) {
      setRedeemingId(reward.id);
      setTimeout(() => {
        setBalance(prev => prev - reward.cost);
        setRedeemingId(null);
        toast.success(`Sucesso! Você resgatou: ${reward.name}`, {
          description: `Seu novo saldo é ${balance - reward.cost} PTS.`,
          icon: <Sparkles className="h-4 w-4 text-primary" />,
        });
      }, 1500);
    }
  };

  const rewards = [
    { id: 1, name: 'Folga de Meio Período', cost: 2500, icon: Clock, color: 'bg-blue-500/10 text-blue-600', description: 'Ganhe 4 horas de folga remunerada.' },
    { id: 2, name: 'Vale Presente R$ 50', cost: 1500, icon: Package, color: 'bg-green-500/10 text-green-600', description: 'Cartão presente para uso em parceiros.' },
    { id: 3, name: 'Prioridade de Turno', cost: 3000, icon: Zap, color: 'bg-amber-500/10 text-amber-600', description: 'Escolha seu turno preferencial por 1 semana.' },
    { id: 4, name: 'Café com a Diretoria', cost: 1000, icon: Star, color: 'bg-purple-500/10 text-purple-600', description: 'Apresente suas ideias diretamente aos diretores.' },
    { id: 5, name: 'Bônus de Produtividade', cost: 5000, icon: TrendingUp, color: 'bg-rose-500/10 text-rose-600', description: 'Bônus em dinheiro no próximo fechamento.' },
  ];

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
          
          <div className="flex items-center gap-4 p-3 bg-primary/5 border border-primary/20 rounded-2xl animate-pulse-glow">
            <div className="p-2 rounded-lg bg-primary/20">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">Seu Saldo</p>
              <p className="text-xl font-black text-primary">{balance.toLocaleString()} PTS</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <VoiceButton />
            <FavoritesDropdown onNavigate={(url) => navigate(url)} />
            <Badge variant="outline" className="gap-1 text-xs hidden sm:flex">
              <Command className="h-3 w-3" />K para buscar
            </Badge>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as 'daily' | 'weekly' | 'monthly')}>
              <TabsList>
                <TabsTrigger value="daily" onClick={() => setActiveTab('ranking')}>Diário</TabsTrigger>
                <TabsTrigger value="weekly" onClick={() => setActiveTab('ranking')}>Semanal</TabsTrigger>
                <TabsTrigger value="monthly" onClick={() => setActiveTab('ranking')}>Mensal</TabsTrigger>
                <TabsTrigger value="rewards" onClick={() => setActiveTab('rewards')} className="bg-primary/10 text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Star className="h-4 w-4 mr-2" />
                  Loja de Recompensas
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Main Content Area */}
        {activeTab === 'rewards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <Card key={reward.id} className="glass-card group hover:border-primary/50 transition-all overflow-hidden border-2 border-transparent">
                <CardHeader className={cn("pb-2", reward.color)}>
                  <div className="flex justify-between items-start">
                    <div className="p-2 rounded-lg bg-white/20">
                      <reward.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="bg-white/30 text-current border-none font-bold">
                      {reward.cost} PTS
                    </Badge>
                  </div>
                  <CardTitle className="mt-4 text-xl">{reward.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground mb-6 h-10 line-clamp-2">
                    {reward.description}
                  </p>
                  <Button 
                    className={cn(
                      "w-full transition-all duration-500",
                      redeemingId === reward.id ? "bg-emerald-500 hover:bg-emerald-600" : "group-hover:scale-[1.02]"
                    )} 
                    disabled={balance < reward.cost || redeemingId !== null}
                    onClick={() => handleRedeem(reward)}
                  >
                    {redeemingId === reward.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {redeemingId === reward.id ? 'Processando...' : 'Resgatar Recompensa'}
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase font-bold tracking-tighter">
                    {balance < reward.cost ? 'Saldo insuficiente para resgate' : 'Disponível para resgate'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
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
                      "flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl transition-all border group",
                      index < 3 ? "bg-primary/5 border-primary/20 shadow-sm" : "hover:bg-muted/30 border-transparent"
                    )}
                  >
                    <div className="flex items-center w-full gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-inner",
                        index === 0 ? "bg-amber-400 text-amber-950 ring-4 ring-amber-400/20" :
                        index === 1 ? "bg-gray-300 text-gray-950 ring-4 ring-gray-300/20" :
                        index === 2 ? "bg-orange-500 text-orange-950 ring-4 ring-orange-500/20" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {r.position}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-base truncate">{r.profile?.full_name}</p>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black h-5">
                            NÍVEL {r.level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {r.total_produced.toLocaleString()}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {r.total_points} pontos</span>
                        </div>
                      </div>

                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">XP PROGRESS</p>
                        <div className="w-32">
                          <Progress value={(r.xp_progress! / r.xp_target!) * 100} className="h-1.5 bg-muted/50" />
                          <p className="text-[9px] text-muted-foreground mt-1">
                            {r.xp_progress} / {r.xp_target} XP
                          </p>
                        </div>
                      </div>
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
        </>
        )}
      </div>
    </MainLayout>
  );
}
