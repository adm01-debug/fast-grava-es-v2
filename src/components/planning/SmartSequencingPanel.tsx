import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { 
  BrainCircuit, ArrowRight, Zap, AlertTriangle, 
  CheckCircle2, Sparkles, ChevronRight, LayoutPanelTop,
  Search, Filter, Clock, TrendingDown, TrendingUp, Info
} from 'lucide-react';
import { useSmartSequencing, SequencingSuggestion } from '@/hooks/useSmartSequencing';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function SmartSequencingPanel() {
  const { suggestions, totalSavings, hasSuggestions } = useSmartSequencing();
  const [isApplying, setIsApplying] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [suggestionToDetail, setSuggestionToDetail] = useState<SequencingSuggestion | null>(null);
  const queryClient = useQueryClient();

  const handleApplyOptimization = async (suggestion: SequencingSuggestion) => {
    setIsApplying(true);
    try {
      // Update each job's start_time according to the optimized sequence
      const updates = suggestion.optimizedSequence.map((job, index) => {
        // Simple logic: maintain same dates but update start_time sequence
        const hour = 7 + Math.floor(index / 2);
        const minute = (index % 2) * 30;
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        return supabase
          .from('jobs')
          .update({ 
            start_time: startTime,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);
      });

      await Promise.all(updates);
      
      toast.success(`Sequenciamento otimizado para ${suggestion.machineName}`, {
        description: `Economia estimada: ${suggestion.estimatedSavings} minutos de setup.`,
        icon: <Zap className="h-4 w-4 text-yellow-400" />
      });
      
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (error) {
      console.error('Error applying optimization:', error);
      toast.error('Erro ao aplicar otimização');
    } finally {
      setIsApplying(false);
    }
  };

  if (!hasSuggestions) {
    return null;
  }

  return (
    <Card className="glass-card border-primary/20 overflow-hidden mb-6">
      <CardHeader className="pb-3 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                Painel de Inteligência de Planejamento
                <Badge variant="secondary" className="animate-pulse bg-primary/20 text-primary border-primary/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA Ativa
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Otimizações detectadas para reduzir setup e aumentar OEE
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{totalSavings} min</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Economia Potencial</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((suggestion) => (
            <motion.div
              key={suggestion.machineId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group p-4 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 transition-all cursor-pointer relative overflow-hidden"
              onClick={() => setSuggestionToDetail(suggestion)}
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <LayoutPanelTop className="h-12 w-12" />
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                  {suggestion.machineCode}
                </Badge>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-xs font-medium text-yellow-400">
                    <Zap className="h-3 w-3" />
                    {suggestion.estimatedSavings} min economizados
                  </div>
                  {suggestion.estimatedColumnTime && (
                    <div className="text-[9px] text-muted-foreground font-mono flex items-center gap-1">
                      <Clock className="h-2 w-2" />
                      Carga: {suggestion.estimatedColumnTime}
                    </div>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-sm mb-1">{suggestion.machineName}</h3>
              <p className="text-xs text-muted-foreground mb-4">{suggestion.techniqueName}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest">
                  <span>Agrupamento por Cor</span>
                  <span>{suggestion.optimizedSequence.length} jobs</span>
                </div>
                <div className="flex gap-1">
                  {suggestion.colorGroups.map((group, idx) => (
                    <div 
                      key={idx}
                      className="h-2 flex-1 rounded-full bg-muted overflow-hidden relative"
                      title={`${group.jobCount} jobs - ${group.color}`}
                    >
                      <div 
                        className="absolute inset-0 opacity-80"
                        style={{ backgroundColor: group.color === 'sem-cor' || !group.color ? '#444' : group.color }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                size="sm" 
                className="w-full h-8 text-xs gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApplyOptimization(suggestion);
                }}
                disabled={isApplying}
              >
                {isApplying ? 'Aplicando...' : 'Aplicar Sequência Ideal'}
                <ArrowRight className="h-3 w-3" />
              </Button>

            </motion.div>
          ))}
        </div>
      </CardContent>

      <Dialog open={!!suggestionToDetail} onOpenChange={(open) => !open && setSuggestionToDetail(null)}>
        <DialogContent className="max-w-2xl bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Otimização de Fluxo: {suggestionToDetail?.machineName}
            </DialogTitle>
            <DialogDescription>
              Comparativo entre o sequenciamento atual e a sugestão otimizada pela IA.
            </DialogDescription>
          </DialogHeader>

          {suggestionToDetail && (
            <div className="space-y-6 my-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/30 border-none p-4">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Status Atual</h4>
                  <div className="space-y-2">
                    {suggestionToDetail.currentSequence.slice(0, 5).map((job, i) => (
                      <div key={job.id} className="flex items-center gap-2 text-[11px] opacity-60">
                        <span className="w-4 h-4 flex items-center justify-center rounded-full bg-muted text-[9px]">{i + 1}</span>
                        <span className="truncate flex-1">{job.client}</span>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: job.gravure_color || '#444' }} />
                      </div>
                    ))}
                    {suggestionToDetail.currentSequence.length > 5 && (
                      <p className="text-[9px] text-center italic text-muted-foreground">+ {suggestionToDetail.currentSequence.length - 5} outros jobs</p>
                    )}
                  </div>
                </Card>

                <Card className="bg-primary/5 border-primary/20 p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-5">
                    <TrendingUp className="h-12 w-12" />
                  </div>
                  <h4 className="text-[10px] font-bold text-primary uppercase mb-3 flex items-center gap-1">
                    Sugestão IA Otimizada
                    <Sparkles className="h-2 w-2" />
                  </h4>
                  <div className="space-y-2">
                    {suggestionToDetail.optimizedSequence.slice(0, 5).map((job, i) => (
                      <div key={job.id} className="flex items-center gap-2 text-[11px] font-medium">
                        <span className="w-4 h-4 flex items-center justify-center rounded-full bg-primary/20 text-primary text-[9px] font-bold">{i + 1}</span>
                        <span className="truncate flex-1">{job.client}</span>
                        <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.2)]" style={{ backgroundColor: job.gravure_color || '#444' }} />
                      </div>
                    ))}
                    {suggestionToDetail.optimizedSequence.length > 5 && (
                      <p className="text-[9px] text-center italic text-primary/70 font-semibold">+ {suggestionToDetail.optimizedSequence.length - 5} jobs otimizados</p>
                    )}
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 text-center">
                  <p className="text-[9px] text-yellow-500/70 uppercase font-bold mb-1">Economia Setup</p>
                  <p className="text-xl font-bold text-yellow-500">{suggestionToDetail.estimatedSavings}m</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-center">
                  <p className="text-[9px] text-blue-500/70 uppercase font-bold mb-1">Carga Estimada</p>
                  <p className="text-xl font-bold text-blue-500">{suggestionToDetail.estimatedColumnTime}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10 text-center">
                  <p className="text-[9px] text-green-500/70 uppercase font-bold mb-1">Produtividade</p>
                  <p className="text-xl font-bold text-green-500">+{Math.round((suggestionToDetail.estimatedSavings / (suggestionToDetail.totalMinutes || 1)) * 100)}%</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="text-xs font-bold mb-2 flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" />
                  Recomendações IA
                </h4>
                <ul className="text-[11px] space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5" />
                    Agrupamento por cores semelhantes reduz o tempo de limpeza de clichês e troca de tintas.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5" />
                    Manter jobs de alta prioridade no início de cada grupo de cor para garantir prazos.
                  </li>
                  {suggestionToDetail.bottleneckRisk === 'high' && (
                    <li className="flex items-start gap-2 text-red-400 font-medium">
                      <AlertTriangle className="h-3 w-3 mt-0.5" />
                      Carga de trabalho elevada detectada para este equipamento nas próximas 24h.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSuggestionToDetail(null)}>Fechar</Button>
            <Button 
              size="sm" 
              className="gap-2 bg-primary hover:bg-primary/90"
              onClick={() => {
                if (suggestionToDetail) handleApplyOptimization(suggestionToDetail);
                setSuggestionToDetail(null);
              }}
              disabled={isApplying}
            >
              {isApplying ? 'Aplicando...' : 'Aplicar Sequência Otimizada'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
