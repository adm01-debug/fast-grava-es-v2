import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plug,
  Plus,
  Check,
  X,
  RefreshCw,
  Settings,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Database,
  Cloud,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Shield,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Integration Types
export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'communication' | 'storage' | 'analytics' | 'automation' | 'security';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync?: Date;
  config?: Record<string, any>;
}

// Hook for managing integrations
export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'email',
      name: 'Email SMTP',
      description: 'Envio de emails transacionais',
      icon: <Mail className="h-5 w-5" />,
      category: 'communication',
      status: 'disconnected',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Notificações e alertas',
      icon: <MessageSquare className="h-5 w-5" />,
      category: 'communication',
      status: 'disconnected',
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sincronização de agendamentos',
      icon: <Calendar className="h-5 w-5" />,
      category: 'automation',
      status: 'disconnected',
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Armazenamento de documentos',
      icon: <Cloud className="h-5 w-5" />,
      category: 'storage',
      status: 'disconnected',
    },
    {
      id: 'analytics',
      name: 'Google Analytics',
      description: 'Métricas e análises',
      icon: <Activity className="h-5 w-5" />,
      category: 'analytics',
      status: 'disconnected',
    },
    {
      id: 'webhook',
      name: 'Webhooks',
      description: 'Integrações customizadas',
      icon: <Zap className="h-5 w-5" />,
      category: 'automation',
      status: 'disconnected',
    },
    {
      id: 'backup',
      name: 'Backup Automático',
      description: 'Backup de dados',
      icon: <Database className="h-5 w-5" />,
      category: 'storage',
      status: 'connected',
      lastSync: new Date(),
    },
    {
      id: 'sso',
      name: 'SSO / SAML',
      description: 'Single Sign-On corporativo',
      icon: <Shield className="h-5 w-5" />,
      category: 'security',
      status: 'disconnected',
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const connectIntegration = useCallback(async (id: string, config?: Record<string, any>) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === id
          ? { ...int, status: 'connected', config, lastSync: new Date() }
          : int
      )
    );
    
    setIsLoading(false);
    return true;
  }, []);

  const disconnectIntegration = useCallback(async (id: string) => {
    setIsLoading(true);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === id
          ? { ...int, status: 'disconnected', config: undefined, lastSync: undefined }
          : int
      )
    );
    
    setIsLoading(false);
  }, []);

  const syncIntegration = useCallback(async (id: string) => {
    setIsLoading(true);
    
    setIntegrations((prev) =>
      prev.map((int) => (int.id === id ? { ...int, status: 'pending' } : int))
    );
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === id ? { ...int, status: 'connected', lastSync: new Date() } : int
      )
    );
    
    setIsLoading(false);
  }, []);

  const getIntegrationsByCategory = useCallback(
    (category: Integration['category']) => {
      return integrations.filter((int) => int.category === category);
    },
    [integrations]
  );

  const connectedCount = integrations.filter((int) => int.status === 'connected').length;

  return {
    integrations,
    isLoading,
    connectIntegration,
    disconnectIntegration,
    syncIntegration,
    getIntegrationsByCategory,
    connectedCount,
  };
}

// Integration Card Component
function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  onSync,
  onConfigure,
}: {
  integration: Integration;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  onConfigure: () => void;
}) {
  const statusColors = {
    connected: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    disconnected: 'bg-muted text-muted-foreground border-border',
    error: 'bg-destructive/10 text-destructive border-destructive/20',
    pending: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  };

  const statusIcons = {
    connected: <CheckCircle className="h-3 w-3" />,
    disconnected: <X className="h-3 w-3" />,
    error: <AlertCircle className="h-3 w-3" />,
    pending: <Clock className="h-3 w-3" />,
  };

  const statusLabels = {
    connected: 'Conectado',
    disconnected: 'Desconectado',
    error: 'Erro',
    pending: 'Sincronizando',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div
              className={cn(
                'p-2.5 rounded-xl transition-colors',
                integration.status === 'connected'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
              )}
            >
              {integration.icon}
            </div>
            <Badge variant="outline" className={cn('text-xs', statusColors[integration.status])}>
              {statusIcons[integration.status]}
              <span className="ml-1">{statusLabels[integration.status]}</span>
            </Badge>
          </div>
          <CardTitle className="text-base mt-3">{integration.name}</CardTitle>
          <CardDescription className="text-sm">{integration.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {integration.lastSync && (
            <p className="text-xs text-muted-foreground mb-3">
              Última sync: {integration.lastSync.toLocaleString('pt-BR')}
            </p>
          )}
          
          <div className="flex gap-2">
            {integration.status === 'connected' ? (
              <>
                <Button size="sm" variant="outline" className="flex-1" onClick={onSync}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Sync
                </Button>
                <Button size="sm" variant="ghost" onClick={onConfigure}>
                  <Settings className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={onDisconnect}>
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button size="sm" className="w-full" onClick={onConnect}>
                <Plus className="h-3 w-3 mr-1" />
                Conectar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Integration Hub Main Component
export function IntegrationHub() {
  const {
    integrations,
    isLoading,
    connectIntegration,
    disconnectIntegration,
    syncIntegration,
    connectedCount,
  } = useIntegrations();

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  const categories = [
    { id: 'all', label: 'Todas', icon: <Plug className="h-4 w-4" /> },
    { id: 'communication', label: 'Comunicação', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'storage', label: 'Armazenamento', icon: <Cloud className="h-4 w-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity className="h-4 w-4" /> },
    { id: 'automation', label: 'Automação', icon: <Zap className="h-4 w-4" /> },
    { id: 'security', label: 'Segurança', icon: <Shield className="h-4 w-4" /> },
  ];

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConfigDialogOpen(true);
  };

  const handleConfirmConnect = async () => {
    if (!selectedIntegration) return;
    
    const success = await connectIntegration(selectedIntegration.id, { apiKey });
    
    if (success) {
      toast({
        title: 'Integração conectada',
        description: `${selectedIntegration.name} foi conectado com sucesso.`,
      });
    }
    
    setConfigDialogOpen(false);
    setApiKey('');
    setSelectedIntegration(null);
  };

  const handleDisconnect = async (integration: Integration) => {
    await disconnectIntegration(integration.id);
    toast({
      title: 'Integração desconectada',
      description: `${integration.name} foi desconectado.`,
    });
  };

  const handleSync = async (integration: Integration) => {
    await syncIntegration(integration.id);
    toast({
      title: 'Sincronização concluída',
      description: `${integration.name} foi sincronizado.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Central de Integrações</h2>
          <p className="text-muted-foreground">
            {connectedCount} de {integrations.length} integrações ativas
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Integração
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plug className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{integrations.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-2/10">
              <CheckCircle className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold">{connectedCount}</p>
              <p className="text-xs text-muted-foreground">Conectadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-4/10">
              <Clock className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {integrations.filter((i) => i.status === 'pending').length}
              </p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {integrations.filter((i) => i.status === 'error').length}
              </p>
              <p className="text-xs text-muted-foreground">Com erro</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
              {cat.icon}
              <span className="hidden sm:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(cat.id === 'all'
                ? integrations
                : integrations.filter((i) => i.category === cat.id)
              ).map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={() => handleConnect(integration)}
                  onDisconnect={() => handleDisconnect(integration)}
                  onSync={() => handleSync(integration)}
                  onConfigure={() => handleConnect(integration)}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Config Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIntegration?.icon}
              Configurar {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              Insira as credenciais para conectar a integração.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key / Token</label>
              <Input
                type="password"
                placeholder="Insira sua chave de API"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Sincronização automática</span>
              <Switch defaultChecked />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmConnect} disabled={isLoading || !apiKey}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Conectar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default IntegrationHub;
