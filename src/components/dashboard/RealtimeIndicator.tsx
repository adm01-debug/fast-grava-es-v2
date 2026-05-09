import { Wifi, WifiOff, RefreshCw, Loader2, Database } from 'lucide-react';
import { useRealtimeConnection } from '@/hooks/useRealtimeConnection';
import { useIsMutating } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RealtimeIndicator() {
  const { status, isConnected, lastUpdate, reconnect } = useRealtimeConnection();
  const isMutating = useIsMutating();

  const isSyncing = isConnected && isMutating > 0;

  const statusConfig = {
    connecting: {
      icon: Loader2,
      label: 'Conectando...',
      className: 'text-yellow-500 animate-spin',
      dotClass: 'bg-yellow-500 animate-pulse',
      ringClass: '',
    },
    connected: {
      icon: Wifi,
      label: 'Tempo real ativo',
      className: 'text-green-500',
      dotClass: 'bg-green-500',
      ringClass: 'pulse-ring',
    },
    disconnected: {
      icon: WifiOff,
      label: 'Desconectado',
      className: 'text-muted-foreground',
      dotClass: 'bg-muted-foreground',
      ringClass: '',
    },
    error: {
      icon: WifiOff,
      label: 'Erro de conexão',
      className: 'text-destructive',
      dotClass: 'bg-destructive',
      ringClass: '',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', config.dotClass, config.ringClass)} />
              <Icon className={cn('h-4 w-4', config.className)} />
            </div>
            {!isConnected && status !== 'connecting' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={reconnect}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <div className="space-y-1">
            <p className="font-medium">{config.label}</p>
            {lastUpdate && (
              <p className="text-muted-foreground">
                Última atualização: {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: ptBR })}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
