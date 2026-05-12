import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, TrendingUp, DollarSign, Wallet, LineChart, PieChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export function AIFinancialAdvisor() {
  const insights = [
    {
      type: 'profit',
      title: 'Margem em Alta: Sublimação',
      description: 'A margem bruta em sublimação subiu 4.2% devido à otimização do consumo de tinta e redução de setups.',
      icon: <TrendingUp className="h-4 w-4 text-emerald-500" />
    },
    {
      type: 'cost',
      title: 'Alerta de Custo: Energia',
      description: 'Custo de energia por peça na CNC-03 está 15% acima da média. Sugerimos revisão do horário de operação ou manutenção preventiva.',
      icon: <Wallet className="h-4 w-4 text-amber-500" />
    },
    {
      type: 'opportunity',
      title: 'Oportunidade de Precificação',
      description: 'O custo real de Gravação Laser reduziu. Há espaço para redução de 5% no preço para ganhar competitividade sem perder margem alvo.',
      icon: <DollarSign className="h-4 w-4 text-blue-500" />
    },
    {
      type: 'forecast',
      title: 'Previsão de Fluxo',
      description: 'Estimamos redução de 8% nos custos indiretos para o próximo mês com a nova política de buffer automático de jobs.',
      icon: <LineChart className="h-4 w-4 text-purple-500" />
    }
  ];

  return (
    <Card className="glass-card border-primary/20 bg-primary/5 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary animate-pulse" />
            AI Financial Advisor
          </CardTitle>
          <Badge variant="outline" className="text-[10px] uppercase font-bold border-primary/30 text-primary">Live Data</Badge>
        </div>
        <CardDescription>Inteligência financeira aplicada ao custeio industrial</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {insights.map((insight, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-background/40 border border-border/50 hover:border-primary/30 transition-all duration-300 group"
          >
            <div className="mt-0.5 group-hover:scale-110 transition-transform">
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
          <div className="p-3 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-tighter">Retorno Estimado: R$ 12.450,00/mês</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
