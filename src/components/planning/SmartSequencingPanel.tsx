import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BrainCircuit, ArrowRight, Zap, AlertTriangle, 
  CheckCircle2, Sparkles, ChevronRight, LayoutPanelTop,
  Search, Filter
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
              onClick={() => setSelectedMachine(selectedMachine === suggestion.machineId ? null : suggestion.machineId)}
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <LayoutPanelTop className="h-12 w-12" />
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                  {suggestion.machineCode}
                </Badge>
                <div className="flex items-center gap-1 text-xs font-medium text-yellow-400">
                  <Zap className="h-3 w-3" />
                  {suggestion.estimatedSavings} min economizados
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

              <AnimatePresence>
                {selectedMachine === suggestion.machineId && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pt-4 mt-4 border-t border-border/30"
                  >
                    <p className="text-[10px] text-muted-foreground mb-2">ORDEM SUGERIDA:</p>
                    <div className="space-y-1.5">
                      {suggestion.optimizedSequence.slice(0, 4).map((job, i) => (
                        <div key={job.id} className="flex items-center gap-2 text-[11px] bg-muted/30 p-1.5 rounded-md">
                          <span className="w-4 h-4 flex items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-bold">
                            {i + 1}
                          </span>
                          <span className="font-medium truncate flex-1">{job.client}</span>
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: job.gravure_color || '#444' }} 
                          />
                        </div>
                      ))}
                      {suggestion.optimizedSequence.length > 4 && (
                        <p className="text-[10px] text-center text-muted-foreground pt-1">
                          + {suggestion.optimizedSequence.length - 4} jobs adicionais
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
