import { memo } from 'react';
import { Printer, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useOperatorMachines } from '@/hooks/useOperatorMachines';
import { useOperatorPresence } from '@/hooks/useOperatorPresence';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const OperatorMachinesIndicator = memo(function OperatorMachinesIndicator() {
  const { user, role } = useAuth();
  const { isTracking } = useOperatorPresence();

  const { assignments, isLoading: assignmentsLoading } = useOperatorMachines(user?.id);

  const { data: machines } = useQuery({
    queryKey: ['machines-for-indicator'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('id, name, code')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Only show for operators
  if (role !== 'operator') return null;

  const assignedMachineIds = assignments?.map(a => a.machine_id) || [];
  const assignedMachines = machines?.filter(m => assignedMachineIds.includes(m.id)) || [];

  if (assignmentsLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 animate-pulse">
        <Printer className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  if (assignedMachines.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
        <Printer className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive">Sem máquinas atribuídas</span>
        <StatusBadge isOnline={isTracking} />
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 cursor-default hover:bg-primary/15 transition-colors">
          <Printer className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {assignedMachines.length} {assignedMachines.length === 1 ? 'máquina' : 'máquinas'}
          </span>
          <StatusBadge isOnline={isTracking} />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Suas máquinas atribuídas:</p>
          <div className="flex flex-wrap gap-1">
            {assignedMachines.map(machine => (
              <Badge key={machine.id} variant="outline" className="text-xs">
                {machine.code} - {machine.name}
              </Badge>
            ))}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
});

const StatusBadge = memo(function StatusBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
          isOnline
            ? 'bg-green-500/20 text-green-600 dark:text-green-400'
            : 'bg-muted text-muted-foreground'
        }`}>
          {isOnline ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <Wifi className="h-3 w-3" />
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-muted-foreground/50"></span>
              <WifiOff className="h-3 w-3" />
            </>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {isOnline ? 'Conectado em tempo real' : 'Desconectado'}
      </TooltipContent>
    </Tooltip>
  );
});
