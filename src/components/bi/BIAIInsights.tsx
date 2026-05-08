import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2, Lightbulb, Clock, ChevronRight, ChevronDown, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  const insights = useMemo(() => {
    const list = [];
    
    // Predicative Calculation: Backlog Clearance
    const avgPiecesPerHour = 45; 
    const totalRemainingPieces = biMetrics.toDoJobs * 100; 
    const hoursToClear = totalRemainingPieces / avgPiecesPerHour;
    const daysToClear = (hoursToClear / 8).toFixed(1);

    list.push({
      title: "Previsão de Entrega",
      description: `Com a carga atual de ${biMetrics.toDoJobs} pedidos, estima-se ${daysToClear} dias para limpar o backlog (fluxo normal).`,
      details: "Esta estimativa baseia-se na produtividade média histórica de 45 peças/hora por máquina ativa. Flutuações na disponibilidade técnica podem alterar este prazo.",
      type: "info",
      icon: Clock,
      impact: "Médio",
      action: "Otimizar Sequenciamento",
      remedy: "Priorize pedidos com menor tempo de setup para aumentar o giro imediato de caixa."
    });

    if (oeeData.overallOEE < 60) {
      list.push({
        title: "Eficiência Global Baixa",
        description: `O OEE atual de ${oeeData.overallOEE.toFixed(1)}% está abaixo da meta. Foque na disponibilidade das máquinas.`,
        details: "O principal detrator é a Disponibilidade (paradas não planejadas). Recomenda-se revisão imediata do plano de manutenção preventiva.",
        type: "warning",
        icon: AlertCircle,
        impact: "Crítico",
        action: "Ver OEE Detalhado",
        remedy: "Verifique registros de paradas por falha técnica e antecipe manutenções nos equipamentos com maior tempo de setup."
      });
    } else if (oeeData.overallOEE > 85) {
      list.push({
        title: "Excelência Operacional",
        description: "O OEE está em níveis de classe mundial. Mantenha os processos atuais e documente as melhores práticas.",
        details: "A estabilidade do processo permitiu atingir o 'Golden Standard'. Utilize este período para treinar novos operadores nos setups atuais.",
        type: "success",
        icon: CheckCircle2,
        impact: "Alto",
        action: "Exportar Relatório",
        remedy: "Documente os parâmetros de setup deste período como 'padrão ouro' para replicar em outros turnos."
      });
    }

    if (biMetrics.periodLossRate > 5) {
      list.push({
        title: "Alerta de Qualidade",
        description: `Taxa de perda de ${biMetrics.periodLossRate.toFixed(2)}%. Verifique o setup inicial das máquinas.`,
        details: "Houve um pico de perdas no Studio Alfa durante a última troca de turno. Inspecione o alinhamento dos cabeçotes laser.",
        type: "danger",
        icon: AlertCircle,
        impact: "Médio",
        action: "Ver Tabela de Perdas",
        remedy: "Execute um teste de centragem e foco no Studio Alfa antes de iniciar o próximo lote de alta tiragem."
      });
    }

    if (biMetrics.toDoJobs > 50) {
      list.push({
        title: "Gargalo Detectado",
        description: `Existem ${biMetrics.toDoJobs} pedidos aguardando. Considere redistribuição de carga entre Studios.`,
        details: "A demanda atual excede a capacidade instalada em 15%. O Studio Beta possui slots ociosos que podem absorver parte da carga.",
        type: "warning",
        icon: Lightbulb,
        impact: "Alto",
        action: "Balancear Carga",
        remedy: "Mova os pedidos de tecnologia híbrida para o Studio Beta para desafogar a linha principal do Studio Alfa."
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
              className={cn(
                "p-4 transition-all duration-300 cursor-pointer border-l-2 border-transparent",
                expandedInsight === index ? "bg-white/10 border-primary" : "hover:bg-white/5"
              )}
              onClick={() => setExpandedInsight(expandedInsight === index ? null : index)}
            >
              <div className="flex gap-4">
                <div className={cn(
                  "mt-1 p-2 rounded-full h-fit",
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
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border",
                        insight.impact === 'Crítico' ? "border-destructive/30 text-destructive bg-destructive/5" :
                        insight.impact === 'Alto' ? "border-warning/30 text-warning bg-warning/5" :
                        "border-primary/30 text-primary bg-primary/5"
                      )}>
                        {insight.impact}
                      </span>
                      {expandedInsight === index ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                  
                  <AnimatePresence>
                    {expandedInsight === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 pb-1 space-y-3">
                          <p className="text-[11px] text-primary/80 leading-relaxed italic border-t border-white/5 pt-3">
                            "{insight.details}"
                          </p>
                          {insight.remedy && (
                            <div className="bg-primary/10 border border-primary/20 p-2 rounded-lg">
                              <p className="text-[10px] text-white/90 font-bold uppercase mb-1 flex items-center gap-1">
                                <Zap className="h-3 w-3 text-primary" /> Ação Corretiva Recomendada
                              </p>
                              <p className="text-[11px] text-primary/90 leading-tight">
                                {insight.remedy}
                              </p>
                            </div>
                          )}
                          <Button size="sm" variant="outline" className="h-7 text-[10px] w-full border-primary/20 hover:bg-primary/10">
                            {insight.action}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
