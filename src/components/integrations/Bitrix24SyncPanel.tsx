import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Check, X, ArrowDownToLine, ArrowUpFromLine, Plug, Loader2 } from 'lucide-react';
import { useBitrix24Sync } from '@/hooks/useBitrix24Sync';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Bitrix24SyncPanel = () => {
  const { isLoading, lastSync, testConnection, pullFromBitrix } = useBitrix24Sync();
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  const handleTestConnection = async () => {
    try {
      await testConnection();
      setConnectionStatus('connected');
    } catch {
      setConnectionStatus('error');
    }
  };

  const handlePull = async () => {
    await pullFromBitrix();
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Check className="h-3 w-3 mr-1" />
            Conectado
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            <X className="h-3 w-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Não verificado
          </Badge>
        );
    }
  };

  return (
    <Card className="glass-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Integração Bitrix24
            </CardTitle>
            <CardDescription>
              Sincronização bidirecional de demandas e status
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plug className="h-4 w-4" />
            )}
            Testar Conexão
          </Button>

          <Button
            variant="outline"
            onClick={handlePull}
            disabled={isLoading || connectionStatus === 'error'}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowDownToLine className="h-4 w-4" />
            )}
            Importar do Bitrix
          </Button>

          <Button
            variant="outline"
            disabled
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            Sync Automático
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">5min</Badge>
          </Button>
        </div>

        {lastSync && (
          <p className="text-xs text-muted-foreground">
            Última sincronização: {format(lastSync, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        )}

        <div className="pt-3 border-t border-border/30">
          <h4 className="text-sm font-medium text-foreground mb-2">Mapeamento de Status</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-muted/20">
              <span className="text-muted-foreground">Bitrix: NEW</span>
              <span className="text-foreground">→ Na Fila</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-muted/20">
              <span className="text-muted-foreground">Bitrix: EXECUTING</span>
              <span className="text-foreground">→ Produção</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-muted/20">
              <span className="text-muted-foreground">Bitrix: WON</span>
              <span className="text-foreground">→ Finalizado</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-muted/20">
              <span className="text-muted-foreground">Bitrix: LOSE</span>
              <span className="text-foreground">→ Cancelado</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
