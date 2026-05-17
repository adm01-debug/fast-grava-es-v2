import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingDown, Target, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MachineOEE, TechniqueOEE } from '@/hooks/useOEE';

interface OEERankingGapProps {
  machines: MachineOEE[];
  techniques: TechniqueOEE[];
  targetOEE?: number;
}

export const OEERankingGap = memo(function OEERankingGap({ 
  machines, 
  techniques, 
  targetOEE = 85 
}: OEERankingGapProps) {
  
  const rankingData = useMemo(() => {
    const machineGaps = machines.map(m => ({
      name: m.machineName,
      id: m.machineId,
      type: 'machine' as const,
      value: m.oee,
      gap: m.oee - targetOEE,
      losses: m.lostPieces,
      color: m.techniqueColor
    })).sort((a, b) => b.gap - a.gap);

    const techniqueGaps = techniques.map(t => ({
      name: t.techniqueName,
      id: t.techniqueId,
      type: 'technique' as const,
      value: t.averageOEE,
      gap: t.averageOEE - targetOEE,
      color: t.techniqueColor
    })).sort((a, b) => b.gap - a.gap);

    return {
      topMachines: machineGaps.slice(0, 10),
      bottomMachines: machineGaps.slice(-10).reverse(),
      topTechniques: techniqueGaps.slice(0, 5),
      bottomTechniques: techniqueGaps.slice(-5).reverse()
    };
  }, [machines, techniques, targetOEE]);

  const renderRankingItem = (item: any, index: number, isBottom: boolean) => {
    const isAboveTarget = item.gap >= 0;
    
    return (
      <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-background/40 border border-border/50 hover:border-primary/30 transition-all group">
        <div className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0",
          isBottom ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
        )}>
          #{index + 1}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
             <p className="font-bold text-sm truncate">{item.name}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
             <Progress value={item.value} className="h-1 flex-1" />
             <span className="text-[10px] font-bold text-muted-foreground w-8 text-right">{item.value.toFixed(0)}%</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className={cn(
            "flex items-center justify-end gap-1 text-xs font-black",
            isAboveTarget ? "text-success" : "text-destructive"
          )}>
            {isAboveTarget ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(item.gap).toFixed(1)}%
          </div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase">Gap vs Meta</p>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-primary/10 bg-black/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Ranking OEE (Máquinas)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {rankingData.topMachines.map((m, i) => renderRankingItem(m, i, false))}
          </CardContent>
        </Card>

        <Card className="border-destructive/10 bg-black/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Impacto de Perdas (Gaps vs Meta 85%)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {rankingData.bottomMachines.map((m, i) => renderRankingItem(m, i, true))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-primary/10 bg-black/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Ranking por Técnica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {rankingData.topTechniques.map((t, i) => renderRankingItem(t, i, false))}
          </CardContent>
        </Card>

        <Card className="border-indicator-info/10 bg-black/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-indicator-info" />
              Técnicas com Maior Desvio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {rankingData.bottomTechniques.map((t, i) => renderRankingItem(t, i, true))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
