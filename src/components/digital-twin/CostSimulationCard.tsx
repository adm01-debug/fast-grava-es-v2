import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, Target, BarChart3, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

export function CostSimulationCard() {
  return (
    <Card className="glass-card border-primary/20 bg-primary/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Calculator className="h-32 w-32 text-primary" />
      </div>
      <CardHeader>
        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-500" />
          What-If Cost Analyzer (IA)
        </CardTitle>
        <CardDescription>Simulação financeira de decisões de produção</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-xl bg-background/40 border border-border/50 space-y-3">
           <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-muted-foreground uppercase">Cenário Atual</span>
              <span className="font-black text-foreground">R$ 12.450 / dia</span>
           </div>
           <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[75%]" />
           </div>
           
           <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-600 uppercase">Cenário Otimizado (IA)</span>
              <span className="font-black text-emerald-600">R$ 11.200 / dia</span>
           </div>
           <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: "65%" }}
                transition={{ duration: 1.5 }}
              />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
              <TrendingDown className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
              <p className="text-[10px] font-black uppercase text-emerald-600">-R$ 1.250</p>
              <p className="text-[8px] font-bold text-muted-foreground">ECONOMIA ESTIMADA</p>
           </div>
           <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-blue-600" />
              <p className="text-[10px] font-black uppercase text-blue-600">+4.2%</p>
              <p className="text-[8px] font-bold text-muted-foreground">MARGEM LÍQUIDA</p>
           </div>
        </div>

        <Button variant="outline" className="w-full h-9 text-[10px] font-black uppercase tracking-widest border-primary/30 hover:bg-primary/5">
          Executar Simulação de Lote
        </Button>
      </CardContent>
    </Card>
  );
}