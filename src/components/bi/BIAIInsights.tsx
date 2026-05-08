import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2, Lightbulb, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BIAIInsightsProps {
  biMetrics: {
    periodLossRate: number;
    periodCompletedJobs: number;
    periodCompletedPieces: number;
    periodLostPieces: number;
    toDoJobs: number;
  };
  oeeData: {
    overallOEE: number;
    overallAvailability: number;
    overallPerformance: number;
    overallQuality: number;
  };
}

export function BIAIInsights({ biMetrics, oeeData }: BIAIInsightsProps) {
  const insights = useMemo(() => {
    const list = [];
    
    // Predicative Calculation: Backlog Clearance
    const avgPiecesPerHour = 45; // Mock avg production rate
    const totalRemainingPieces = biMetrics.toDoJobs * 100; // Mock avg quantity per job
    const hoursToClear = totalRemainingPieces / avgPiecesPerHour;
    const daysToClear = (hoursToClear / 8).toFixed(1); // Assuming 8h shifts

    list.push({
      title: "Previsão de Entrega",
      description: `Com a carga atual de ${biMetrics.toDoJobs} pedidos, estima-se ${daysToClear} dias para limpar o backlog (fluxo normal).`,
      type: "info",
      icon: Clock,
      impact: "Médio"
    });
    if (oeeData.overallOEE < 60) {
      list.push({
        title: "Eficiência Global Baixa",
        description: `O OEE atual de ${oeeData.overallOEE.toFixed(1)}% está abaixo da meta. Foque na disponibilidade das máquinas.`,
        type: "warning",
        icon: AlertCircle,
        impact: "Crítico"
      });
    } else if (oeeData.overallOEE > 85) {
      list.push({
        title: "Excelência Operacional",
        description: "O OEE está em níveis de classe mundial. Mantenha os processos atuais e documente as melhores práticas.",
        type: "success",
        icon: CheckCircle2,
        impact: "Alto"
      });
    }

    // Quality/Loss Insight
    if (biMetrics.periodLossRate > 5) {
      list.push({
        title: "Alerta de Qualidade",
        description: `Taxa de perda de ${biMetrics.periodLossRate.toFixed(2)}%. Verifique o setup inicial das máquinas e a qualidade dos insumos.`,
        type: "danger",
        icon: AlertCircle,
        impact: "Médio"
      });
    } else {
      list.push({
        title: "Controle de Perdas",
        description: "A taxa de desperdício está sob controle. Ótima performance de setup e execução.",
        type: "success",
        icon: CheckCircle2,
        impact: "Baixo"
      });
    }

    // Capacity Insight
    if (biMetrics.toDoJobs > 50) {
      list.push({
        title: "Gargalo Detectado",
        description: `Existem ${biMetrics.toDoJobs} pedidos aguardando. Considere um turno extra ou redistribuição de carga entre Studios.`,
        type: "warning",
        icon: Lightbulb,
        impact: "Alto"
      });
    }

    // Performance Trend
    if (oeeData.overallPerformance > 90) {
      list.push({
        title: "Performance Superior",
        description: "As máquinas estão operando em alta velocidade constante. Monitore o desgaste preventivo.",
        type: "info",
        icon: Sparkles,
        impact: "Médio"
      });
    }

    return list;
  }, [biMetrics, oeeData]);

  return (
    <Card className="bg-black/40 border-primary/20 backdrop-blur-xl overflow-hidden relative group h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <CardHeader className="relative z-10 border-b border-white/5 bg-white/5">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 rounded-lg bg-primary/20">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <span className="font-display tracking-widest uppercase">IA Insights & Recomendações</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative z-10">
        <div className="divide-y divide-white/5">
          {insights.map((insight, index) => (
            <motion.div 
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 hover:bg-white/5 transition-colors cursor-default"
            >
              <div className="flex gap-4">
                <div className={cn(
                  "mt-1 p-2 rounded-full",
                  insight.type === 'success' ? "bg-success/20 text-success" :
                  insight.type === 'warning' ? "bg-warning/20 text-warning" :
                  insight.type === 'danger' ? "bg-destructive/20 text-destructive" :
                  "bg-primary/20 text-primary"
                )}>
                  <insight.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm tracking-tight">{insight.title}</h4>
                    <span className={cn(
                      "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border",
                      insight.impact === 'Crítico' ? "border-destructive/30 text-destructive bg-destructive/5" :
                      insight.impact === 'Alto' ? "border-warning/30 text-warning bg-warning/5" :
                      "border-primary/30 text-primary bg-primary/5"
                    )}>
                      Impacto {insight.impact}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="p-4 bg-primary/5 border-t border-primary/10">
          <div className="flex items-center gap-2 text-[10px] text-primary/70 font-mono uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Análise Preditiva em Tempo Real Ativa
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
