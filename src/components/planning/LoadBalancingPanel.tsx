import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { 
  Scale, ArrowRight, TrendingDown, AlertCircle, 
  CheckCircle2, Info, ArrowLeftRight, Sparkles, Clock, Zap
} from 'lucide-react';
import { useLoadBalancing, LoadBalancingSuggestion } from '@/hooks/useLoadBalancing';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function LoadBalancingPanel() {
  const { suggestions, byTechnique, isLoading } = useLoadBalancing();
  const [isApplying, setIsApplying] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<LoadBalancingSuggestion | null>(null);
  const queryClient = useQueryClient();

  const handleApplyBalancing = async (suggestion: LoadBalancingSuggestion) => {
    setIsApplying(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          machine_id: suggestion.suggestedMachineId,
          updated_at: new Date().toISOString()
        })
        .eq('id', suggestion.jobId);

      if (error) throw error;

      toast.success(`Job reequilibrado com sucesso`, {
        description: `Movido de ${suggestion.currentMachineName} para ${suggestion.suggestedMachineName}.`,
        icon: <ArrowLeftRight className="h-4 w-4 text-primary" />
      });
      
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (error) {
      console.error('Error balancing load:', error);
      toast.error('Erro ao reequilibrar carga');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading || suggestions.length === 0) {
    return null;
  }

  const visibleSuggestions = showAll ? suggestions : suggestions.slice(0, 3);

  return (
    <Card className="glass-card border-blue-500/20 overflow-hidden mb-6">
      <CardHeader className="pb-3 bg-blue-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Scale className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                Equilíbrio de Carga Assistido
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  {suggestions.length} Oportunidades
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Redistribua jobs para evitar gargalos e ociosidade
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {visibleSuggestions.map((suggestion) => (
              <motion.div
                key={suggestion.jobId}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 transition-all border-l-4 border-l-blue-400/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-muted-foreground">OS {suggestion.orderNumber}</span>
                  <Badge variant="outline" className="text-[9px] bg-blue-500/5 text-blue-400">
                    -{Math.round(suggestion.loadDifference)}% de desequilíbrio
                  </Badge>
                </div>

                <h3 className="font-bold text-sm mb-1 truncate">{suggestion.client}</h3>
                
                <div className="flex items-center gap-2 mb-4 mt-3">
                  <div className="flex-1 text-center p-2 rounded bg-muted/30">
                    <p className="text-[9px] text-muted-foreground uppercase">De</p>
                    <p className="text-xs font-medium truncate">{suggestion.currentMachineName}</p>
                    <p className="text-[10px] text-orange-400 font-bold">{Math.round(suggestion.currentLoad)}%</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 text-center p-2 rounded bg-blue-500/10 border border-blue-500/20">
                    <p className="text-[9px] text-blue-400 uppercase font-bold">Para</p>
                    <p className="text-xs font-medium truncate">{suggestion.suggestedMachineName}</p>
                    <p className="text-[10px] text-blue-400 font-bold">{Math.round(suggestion.suggestedLoad)}%</p>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  className="w-full h-8 text-xs gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-none"
                  onClick={() => handleApplyBalancing(suggestion)}
                  disabled={isApplying}
                >
                  {isApplying ? 'Reequilibrando...' : 'Confirmar Transferência'}
                  <ArrowLeftRight className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {suggestions.length > 3 && (
          <div className="mt-4 flex justify-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground hover:text-primary"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Mostrar menos' : `Ver mais ${suggestions.length - 3} oportunidades`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
