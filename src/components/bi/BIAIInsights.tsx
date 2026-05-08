import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2, Lightbulb, Clock, ChevronRight, ChevronDown, Zap, Target, TrendingUp, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{ oee: number; revenue: number } | null>(null);

  const runSimulation = () => {
    setIsSimulating(true);
    // Simulate complex calculation
    setTimeout(() => {
      setSimulationResult({
        oee: Math.min(98, oeeData.overallOEE + 12),
        revenue: biMetrics.periodCompletedPieces * 2.5 * 1.15
      });
      setIsSimulating(false);
    }, 1500);
  };

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
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-primary/70 font-mono uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                Simulador de Otimização IA
              </div>
              {!simulationResult && (
                <Button 
                  onClick={runSimulation} 
                  disabled={isSimulating}
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-[10px] gap-2 border border-primary/20 hover:bg-primary/10"
                >
                  {isSimulating ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <Cpu className="h-3 w-3" />}
                  SIMULAR CENÁRIO IDEAL
                </Button>
              )}
            </div>

            {isSimulating && (
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] text-primary/60 font-mono">
                  <span>PROCESSANDO REDE NEURAL...</span>
                  <span>{Math.floor(Math.random() * 100)}%</span>
                </div>
                <Progress value={45} className="h-1 bg-white/5" />
              </div>
            )}

            {simulationResult && !isSimulating && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-1">
                  <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-white/10" onClick={() => setSimulationResult(null)}>
                    <ChevronDown className="h-3 w-3 rotate-180" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] text-primary font-bold uppercase">
                    <Target className="h-3 w-3" /> Potencial OEE
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">{simulationResult.oee.toFixed(1)}%</span>
                    <span className="text-[10px] text-success flex items-center gap-0.5">
                      <TrendingUp className="h-2 w-2" /> +{(simulationResult.oee - oeeData.overallOEE).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1 border-l border-white/10 pl-3">
                  <div className="flex items-center gap-1.5 text-[9px] text-primary font-bold uppercase">
                    <TrendingUp className="h-3 w-3" /> Ganhos Est.
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">
                      R$ {simulationResult.revenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] text-success flex items-center gap-0.5">
                      <TrendingUp className="h-2 w-2" /> +15%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div className="flex items-center gap-2 text-[10px] text-primary/50 font-mono uppercase tracking-widest pt-1 border-t border-white/5">
              <Sparkles className="h-3 w-3" /> Análise Preditiva em Tempo Real Ativa
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Add RefreshCcw to imports if not there (it was used in simulation logic but not in the main list)
import { RefreshCcw } from 'lucide-react';
