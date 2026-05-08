import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, Calendar, AlertTriangle, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SeverityConfig {
  id: string;
  machine_id: string;
  severity: 'upcoming' | 'due' | 'overdue' | 'critical';
  days_threshold: number;
  message_override: string | null;
  is_enabled: boolean;
}

interface TPMSeverityConfigsProps {
  machineId?: string;
}

export function TPMSeverityConfigs({ machineId }: TPMSeverityConfigsProps) {
  const queryClient = useQueryClient();
  const [newSeverity, setNewSeverity] = useState<'upcoming' | 'due' | 'overdue' | 'critical'>('upcoming');

  const { data: configs, isLoading } = useQuery({
    queryKey: ['tpm-severity-configs', machineId],
    queryFn: async () => {
      let query = supabase.from('tpm_severity_configs').select('*');
      if (machineId) {
        query = query.eq('machine_id', machineId);
      } else {
        query = query.is('machine_id', null);
      }
      const { data, error } = await supabase.from('tpm_severity_configs').select('*').eq('machine_id', machineId);
      if (error) throw error;
      return data as SeverityConfig[];
    }
  });

  const upsertConfig = useMutation({
    mutationFn: async (config: Partial<SeverityConfig>) => {
      const { error } = await supabase
        .from('tpm_severity_configs')
        .upsert({ ...config, machine_id: machineId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tpm-severity-configs', machineId] });
      toast.success('Configuração de severidade salva');
    }
  });

  const deleteConfig = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tpm_severity_configs')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tpm-severity-configs', machineId] });
      toast.success('Configuração removida');
    }
  });

  if (isLoading) return <div>Carregando severidades...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {configs?.map(config => (
          <div key={config.id} className="flex flex-wrap items-center gap-4 p-4 border rounded-lg bg-secondary/5">
            <div className="flex items-center gap-2 w-32">
              {config.severity === 'upcoming' && <Calendar className="h-4 w-4 text-blue-400" />}
              {config.severity === 'due' && <Clock className="h-4 w-4 text-amber-400" />}
              {config.severity === 'overdue' && <AlertTriangle className="h-4 w-4 text-orange-400" />}
              {config.severity === 'critical' && <AlertCircle className="h-4 w-4 text-destructive" />}
              <span className="text-sm font-medium capitalize">{config.severity}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Limite (dias):</span>
              <Input 
                type="number" 
                className="w-20 h-8" 
                defaultValue={config.days_threshold}
                onBlur={(e) => upsertConfig.mutate({ id: config.id, severity: config.severity, days_threshold: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex-1">
              <Input 
                placeholder="Mensagem personalizada (opcional)" 
                className="h-8"
                defaultValue={config.message_override || ''}
                onBlur={(e) => upsertConfig.mutate({ id: config.id, severity: config.severity, message_override: e.target.value })}
              />
            </div>

            <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => deleteConfig.mutate(config.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="flex items-center gap-2 p-4 border border-dashed rounded-lg">
          <Select value={newSeverity} onValueChange={(v) => setNewSeverity(v as any)}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Próxima</SelectItem>
              <SelectItem value="due">Vencendo</SelectItem>
              <SelectItem value="overdue">Atrasada</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => upsertConfig.mutate({ severity: newSeverity, days_threshold: 0 })}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar Regra
          </Button>
        </div>
      </div>
    </div>
  );
}
