import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BrainCircuit, ArrowRight, Zap, AlertTriangle, 
  CheckCircle2, Sparkles, ChevronRight, Bell, Settings
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSmartSequencing } from '@/hooks/useSmartSequencing';
import { useLoadBalancing } from '@/hooks/useLoadBalancing';
import { useBottleneckPrediction } from '@/hooks/useBottleneckPrediction';
import { motion, AnimatePresence } from 'framer-motion';

export function KanbanAIAdvisor() {
  const { suggestions: sequenceSuggestions, totalSavings } = useSmartSequencing();
  const { suggestions: balancingSuggestions } = useLoadBalancing();
  const { alerts: bottleneckAlerts } = useBottleneckPrediction();
  
  const [showSettings, setShowSettings] = useState(false);
  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem('alert-thresholds');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          bottleneckHigh: parsed.bottleneckHigh || 480,
          bottleneckMedium: parsed.bottleneckRiskMinutes || 300,
        };
      } catch (e) {
        console.error('Error loading thresholds', e);
      }
    }
    return {
      bottleneckHigh: 480,
      bottleneckMedium: 300,
    };
  });

  const totalInsights = sequenceSuggestions.length + balancingSuggestions.length + bottleneckAlerts.length;

  if (totalInsights === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <BrainCircuit className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold flex items-center gap-2">
            IA Strategist Advisor
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-primary/5 text-primary border-primary/20">
              {totalInsights} Insights
            </Badge>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <div className="p-1.5 rounded-lg bg-background border border-border/50 text-muted-foreground">
            <Bell className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Sequenciamento */}
        {sequenceSuggestions.length > 0 && (
          <AdviceCard
            icon={Zap}
            title="Otimização de Setup"
            description={`Economize até ${totalSavings}min agrupando por cor.`}
            actionLabel="Otimizar Sequência"
            color="text-amber-400"
            badge={`${sequenceSuggestions.length} Máquinas`}
          />
        )}

        {/* Balanceamento */}
        {balancingSuggestions.length > 0 && (
          <AdviceCard
            icon={ArrowRight}
            title="Balanceamento de Carga"
            description={`${balancingSuggestions.length} jobs podem ser movidos para máquinas ociosas.`}
            actionLabel="Ver Sugestões"
            color="text-blue-400"
          />
        )}

        {/* Gargalos */}
        {bottleneckAlerts.length > 0 && (
          <AdviceCard
            icon={AlertTriangle}
            title="Previsão de Gargalo"
            description={bottleneckAlerts[0].message}
            actionLabel="Agir Agora"
            color="text-red-400"
            severity="critical"
          />
        )}
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração de Alertas Automáticos
            </DialogTitle>
            <DialogDescription>
              Defina os limites de carga para notificações de gargalo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="high">Risco Alto (Gargalo Crítico)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="high" 
                  type="number" 
                  value={thresholds.bottleneckHigh} 
                  onChange={(e) => setThresholds(prev => ({ ...prev, bottleneckHigh: parseInt(e.target.value) }))}
                />
                <span className="text-xs text-muted-foreground font-mono w-16">minutos</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic">Padrão: 480 min (8 horas)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="medium">Risco Médio (Atenção)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="medium" 
                  type="number" 
                  value={thresholds.bottleneckMedium} 
                  onChange={(e) => setThresholds(prev => ({ ...prev, bottleneckMedium: parseInt(e.target.value) }))}
                />
                <span className="text-xs text-muted-foreground font-mono w-16">minutos</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic">Padrão: 300 min (5 horas)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSettings(false)}>Cancelar</Button>
            <Button onClick={() => {
              toast.success("Configurações de alerta salvas!");
              setShowSettings(false);
            }}>Salvar Configurações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function AdviceCard({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  color, 
  badge,
  severity 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  actionLabel: string, 
  color: string,
  badge?: string,
  severity?: 'critical' | 'warning' 
}) {
  return (
    <Card className={`overflow-hidden border-l-4 ${
      severity === 'critical' ? 'border-l-red-500 bg-red-500/5' : 'border-l-primary/50 bg-card/50'
    } hover:bg-card/80 transition-all cursor-pointer group`}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className={`p-1.5 rounded-md bg-background border border-border/50 ${color}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          {badge && (
            <Badge variant="outline" className="text-[10px] px-1 h-4 border-primary/20 text-primary">
              {badge}
            </Badge>
          )}
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-bold truncate">{title}</p>
          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-border/30">
          <span className="text-[10px] font-medium text-primary group-hover:underline flex items-center gap-1">
            {actionLabel}
            <ChevronRight className="h-2.5 w-2.5" />
          </span>
          <Sparkles className="h-2.5 w-2.5 text-primary/40 group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}
