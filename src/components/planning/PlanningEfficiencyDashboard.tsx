import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, Target, Zap, Clock, TrendingUp, 
  ArrowUpRight, AlertTriangle, Sparkles 
} from 'lucide-react';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { useSmartSequencing } from '@/hooks/useSmartSequencing';
import { useLoadBalancing } from '@/hooks/useLoadBalancing';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function PlanningEfficiencyDashboard() {
  const { jobs } = useSchedulingData();
  const { totalSavings } = useSmartSequencing();
  const { suggestions: balancingSuggestions } = useLoadBalancing();

  const stats = useMemo(() => {
    if (!jobs || jobs.length === 0) return null;

    const totalJobs = jobs.filter(j => !['finished', 'cancelled'].includes(j.status)).length;
    const optimizedJobs = totalJobs - balancingSuggestions.length;
    const efficiencyScore = Math.round((optimizedJobs / totalJobs) * 100) || 0;
    
    const delayedCount = jobs.filter(j => j.status === 'delayed').length;
    const deadlineHealth = Math.round(((totalJobs - delayedCount) / totalJobs) * 100) || 0;

    return { efficiencyScore, deadlineHealth, totalJobs, delayedCount };
  }, [jobs, balancingSuggestions]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Efficiency Score */}
      <Card className="glass-card overflow-hidden group border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-primary animate-pulse">
              <Sparkles className="h-3 w-3" />
              OTIMIZAÇÃO 10/10
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Score de Planejamento</p>
          <div className="flex items-end gap-2 mb-3">
            <h3 className="text-3xl font-bold font-display">{stats.efficiencyScore}%</h3>
            <div className="text-[10px] text-green-400 font-bold flex items-center mb-1">
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
              +2.4%
            </div>
          </div>
          <Progress value={stats.efficiencyScore} className="h-1.5 bg-primary/10" />
        </CardContent>
      </Card>

      {/* Deadline Health */}
      <Card className="glass-card overflow-hidden group border-green-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
              <Clock className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Saúde dos Prazos</p>
          <div className="flex items-end gap-2 mb-3">
            <h3 className="text-3xl font-bold font-display">{stats.deadlineHealth}%</h3>
            {stats.delayedCount > 0 && (
              <div className="text-[10px] text-red-400 font-bold flex items-center mb-1">
                <AlertTriangle className="h-3 w-3 mr-0.5" />
                {stats.delayedCount} atrasados
              </div>
            )}
          </div>
          <Progress value={stats.deadlineHealth} className="h-1.5 bg-green-500/10" variant="success" />
        </CardContent>
      </Card>

      {/* Setup Savings */}
      <Card className="glass-card overflow-hidden group border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Recuperação de Setup</p>
          <div className="flex items-end gap-2 mb-3">
            <h3 className="text-3xl font-bold font-display">{totalSavings}m</h3>
            <div className="text-[10px] text-amber-400 font-bold flex items-center mb-1 uppercase">
              Economia de IA
            </div>
          </div>
          <div className="flex gap-1 h-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={cn(
                "flex-1 rounded-full bg-muted",
                i <= 3 && "bg-amber-400/50"
              )} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Throughput / Trends */}
      <Card className="glass-card overflow-hidden group border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
              <BarChart3 className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">OEE da Planta</p>
          <div className="flex items-end gap-2 mb-3">
            <h3 className="text-3xl font-bold font-display">88<span className="text-lg opacity-50">%</span></h3>
            <div className="text-[10px] text-purple-400 font-bold flex items-center mb-1 uppercase">
              Alta Performance
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {stats.totalJobs > 0 && Array.from({ length: Math.min(3, stats.totalJobs) }).map((_, i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[8px] font-bold text-primary">
                  {i + 1}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">{stats.totalJobs} jobs ativos em processamento</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
