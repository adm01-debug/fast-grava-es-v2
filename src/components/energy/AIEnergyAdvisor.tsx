import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, Leaf, Zap, AlertTriangle, TrendingDown, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export function AIEnergyAdvisor() {
  const insights = [
    {
      type: 'success',
      title: 'Eficiência Energética Otimizada',
      description: 'A nova política de balanceamento de carga reduziu o pico de demanda em 15% nesta semana.',
      icon: <Leaf className="h-4 w-4 text-emerald-500" />
    },
    {
      type: 'warning',
      title: 'Anomalia em CNC-02',
      description: 'Consumo de energia 20% acima do esperado para o volume atual. Sugerimos verificar lubrificação dos eixos.',
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />
    },
    {
      type: 'tip',
      title: 'Sugestão de Economia',
      description: 'Desligar a central de ar comprimido no intervalo das 12:00 às 13:00 economizará R$ 340,00 por mês.',
      icon: <Zap className="h-4 w-4 text-blue-500" />
    },
    {
      type: 'eco',
      title: 'Impacto Ambiental',
      description: 'Com a redução de consumo atual, sua fábrica evitou a emissão de 1.2 toneladas de CO2 este mês.',
      icon: <Lightbulb className="h-4 w-4 text-purple-500" />
    }
  ];

  return (
    <Card className="glass-card border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-emerald-500 animate-pulse" />
            AI Sustainable Advisor
          </CardTitle>
          <Badge variant="outline" className="text-[10px] uppercase font-bold border-emerald-500/30 text-emerald-500">Green Factor</Badge>
        </div>
        <CardDescription>Inteligência artificial focada em eficiência energética e ESG</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {insights.map((insight, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-background/40 border border-border/50 hover:border-emerald-500/30 transition-all duration-300 group"
          >
            <div className="mt-0.5 group-hover:rotate-12 transition-transform">
              {insight.icon}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold leading-none">{insight.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {insight.description}
              </p>
            </div>
          </motion.div>
        ))}
        <div className="pt-2">
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-tighter">Meta ESG: 85% Concluída</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
