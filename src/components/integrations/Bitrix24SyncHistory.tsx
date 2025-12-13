import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, CheckCircle2, AlertCircle, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Webhook, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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

type TypeFilter = 'all' | 'pull' | 'push' | 'webhook';
type StatusFilter = 'all' | 'success' | 'partial' | 'error';

export const Bitrix24SyncHistory = () => {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data: history, isLoading } = useQuery({
    queryKey: ['bitrix24-sync-history'],
    queryFn: async () => {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/bitrix24-sync?action=history&limit=50`,
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

  const filteredHistory = history?.filter(item => {
    const matchesType = typeFilter === 'all' || item.sync_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesType && matchesStatus;
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Histórico de Sincronização
          </CardTitle>
          {filteredHistory && (
            <Badge variant="outline" className="text-xs">
              {filteredHistory.length} registros
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
              <SelectTrigger className="h-9 text-xs">
                <Filter className="h-3 w-3 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="pull">Importação</SelectItem>
                <SelectItem value="push">Exportação</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Carregando...</div>
        ) : !filteredHistory || filteredHistory.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {history && history.length > 0 
              ? 'Nenhum registro encontrado com os filtros selecionados.'
              : 'Nenhuma sincronização registrada ainda.'
            }
          </div>
        ) : (
          <ScrollArea className="h-[280px]">
            <div className="space-y-2">
              {filteredHistory.map((item) => (
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
