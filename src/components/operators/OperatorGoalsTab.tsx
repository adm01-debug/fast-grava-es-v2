import { useOperatorGoals, calculateGoalProgress, GOAL_TYPE_LABELS } from '@/hooks/useOperatorGoals';
import { useOperatorEvolution } from '@/hooks/useOperatorEvolution';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Trophy, AlertCircle, CheckCircle2, Gauge, Package } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface OperatorGoalsTabProps {
  operatorId: string;
}

export function OperatorGoalsTab({ operatorId }: OperatorGoalsTabProps) {
  const { getGoalsByOperator, isLoading: isLoadingGoals } = useOperatorGoals();
  const { evolutionData, isLoading: isLoadingEvolution } = useOperatorEvolution(30);

  const goals = getGoalsByOperator(operatorId);
  const operatorStats = evolutionData.find(d => d.operatorId === operatorId);

  const goalsWithProgress = useMemo(() => {
    if (!operatorStats || !goals.length) return [];

    return goals.map(goal => {
      let currentValue = 0;
      
      // Calculate current value based on goal type for the period
      switch (goal.goal_type) {
        case 'efficiency':
          const activeDays = operatorStats.dailyData.filter(d => d.jobsCompleted > 0);
          currentValue = activeDays.length > 0 
            ? activeDays.reduce((sum, d) => sum + d.efficiencyScore, 0) / activeDays.length 
            : 0;
          break;
        case 'jobs_completed':
          currentValue = operatorStats.dailyData.reduce((sum, d) => sum + d.jobsCompleted, 0);
          break;
        case 'pieces_produced':
          currentValue = operatorStats.dailyData.reduce((sum, d) => sum + d.piecesProduced, 0);
          break;
        case 'loss_rate':
          const totalProduced = operatorStats.dailyData.reduce((sum, d) => sum + d.piecesProduced, 0);
          const totalLost = operatorStats.dailyData.reduce((sum, d) => sum + d.piecesLost, 0);
          currentValue = totalProduced > 0 ? (totalLost / (totalProduced + totalLost)) * 100 : 0;
          break;
      }

      return calculateGoalProgress(goal, currentValue);
    });
  }, [goals, operatorStats]);

  if (isLoadingGoals || isLoadingEvolution) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (goalsWithProgress.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-xl space-y-3">
        <Target className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
        <div className="space-y-1">
          <p className="font-medium">Nenhuma meta ativa</p>
          <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
            Este operador não possui metas definidas para o período atual.
          </p>
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'efficiency': return <Gauge className="h-4 w-4" />;
      case 'jobs_completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'pieces_produced': return <Package className="h-4 w-4" />;
      case 'loss_rate': return <AlertCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Metas Ativas</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Trophy className="h-3 w-3 text-yellow-500" />
          <span>{goalsWithProgress.filter(g => g.is_achieved).length} de {goalsWithProgress.length} alcançadas</span>
        </div>
      </div>

      <div className="grid gap-4">
        {goalsWithProgress.map((goal) => (
          <Card key={goal.id} className="bg-secondary/20 border-border/50 shadow-none overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-md",
                    goal.is_achieved ? "bg-success/20 text-success" : "bg-primary/10 text-primary"
                  )}>
                    {getIcon(goal.goal_type)}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">
                      {GOAL_TYPE_LABELS[goal.goal_type]}
                    </CardTitle>
                    <CardDescription className="text-[10px]">
                      Meta: {goal.target_value}{goal.goal_type === 'efficiency' || goal.goal_type === 'loss_rate' ? '%' : ''}
                    </CardDescription>
                  </div>
                </div>
                {goal.is_achieved && (
                  <Badge variant="success" className="h-5 px-1.5 text-[9px] uppercase tracking-wider">
                    Alcançada
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono">{Math.round(goal.current_value)}{goal.goal_type === 'efficiency' || goal.goal_type === 'loss_rate' ? '%' : ''} atual</span>
                  <span className={cn(
                    "font-bold",
                    goal.is_achieved ? "text-success" : "text-primary"
                  )}>
                    {goal.progress_percentage}%
                  </span>
                </div>
                <Progress 
                  value={goal.progress_percentage} 
                  className="h-1.5" 
                  variant={goal.is_achieved ? "success" : "default"}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
