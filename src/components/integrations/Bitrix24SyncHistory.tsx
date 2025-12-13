import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, CheckCircle2, AlertCircle, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Webhook } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SyncHistoryItem {
  id: string;
  sync_type: 'pull' | 'push' | 'webhook';
  status: 'success' | 'partial' | 'error';
  jobs_synced: number;
  jobs_failed: number;
  error_message: string | null;
  details: any;
  started_at: string;
  completed_at: string | null;
  triggered_by: string;
}

export const Bitrix24SyncHistory = () => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['bitrix24-sync-history'],
    queryFn: async () => {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/bitrix24-sync?action=history&limit=20`,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          }
        }
      );
      const data = await response.json();
      return data.history as SyncHistoryItem[];
    },
    refetchInterval: 30000
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Sucesso</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Parcial</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Erro</Badge>;
      default:
        return null;
    }
  };

  const getSyncTypeIcon = (type: string) => {
    switch (type) {
      case 'pull':
        return <ArrowDownToLine className="h-4 w-4 text-blue-400" />;
      case 'push':
        return <ArrowUpFromLine className="h-4 w-4 text-purple-400" />;
      case 'webhook':
        return <Webhook className="h-4 w-4 text-cyan-400" />;
      default:
        return null;
    }
  };

  const getSyncTypeLabel = (type: string) => {
    switch (type) {
      case 'pull':
        return 'Importação';
      case 'push':
        return 'Exportação';
      case 'webhook':
        return 'Webhook';
      default:
        return type;
    }
  };

  const getTriggeredByLabel = (triggeredBy: string) => {
    switch (triggeredBy) {
      case 'manual':
        return 'Manual';
      case 'auto':
        return 'Automático';
      case 'cron':
        return 'Agendado';
      case 'bitrix24':
        return 'Bitrix24';
      default:
        return triggeredBy;
    }
  };

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Histórico de Sincronização
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Carregando...</div>
        ) : !history || history.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Nenhuma sincronização registrada ainda.
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSyncTypeIcon(item.sync_type)}
                      <span className="text-sm font-medium">{getSyncTypeLabel(item.sync_type)}</span>
                      {getStatusBadge(item.status)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.started_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-400" />
                      {item.jobs_synced} sincronizados
                    </span>
                    {item.jobs_failed > 0 && (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 text-red-400" />
                        {item.jobs_failed} falhas
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {getTriggeredByLabel(item.triggered_by)}
                    </Badge>
                  </div>

                  {item.error_message && (
                    <div className="mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                      {item.error_message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
