import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Wrench, 
  Brain, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  BellOff,
  TrendingUp,
  Wifi,
  WifiOff
} from 'lucide-react';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDailySummaryNotifications } from '@/hooks/useDailySummaryNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useNotificationSounds } from '@/hooks/useNotificationSounds';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

interface MaintenanceAlert {
  id: string;
  alert_type: string;
  message: string;
  is_resolved: boolean;
  is_read: boolean;
  created_at: string;
  resolved_at: string | null;
  machine_id: string;
  machines?: { name: string; code: string };
}

interface MachinePrediction {
  id: string;
  prediction_type: string;
  risk_score: number;
  predicted_failure_date: string | null;
  is_active: boolean;
  created_at: string;
  machine_id: string;
  machines?: { name: string; code: string };
}

interface DailySummaryRecord {
  id: string;
  date: string;
  summary_type: string;
  data: {
    maintenance: {
      overdue: { count: number };
      due_today: { count: number };
      upcoming_7_days: { count: number };
    };
    predictions: {
      critical: { count: number };
      high_risk: { count: number };
    };
    alerts: {
      has_critical: boolean;
      total_attention_items: number;
    };
  };
  created_at: string;
}

type NotificationItem = {
  id: string;
  type: 'maintenance' | 'prediction' | 'summary';
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  isRead?: boolean;
  isResolved?: boolean;
  metadata?: Record<string, unknown>;
};

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState('7');
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  
  const queryClient = useQueryClient();
  const { permission, requestPermission, sendNotification } = usePushNotifications();
  const { manualRefresh, isLoading: isSummaryLoading } = useDailySummaryNotifications();
  const { playSound, isEnabled: isSoundEnabled } = useNotificationSounds();

  // Handle new realtime notification
  const handleNewNotification = useCallback((type: 'maintenance' | 'prediction' | 'summary', payload: unknown) => {
    if (import.meta.env.DEV) console.log(`[Realtime] New ${type} notification:`, payload);
    
    // Increment counter
    setNewNotificationsCount(prev => prev + 1);
    
    // Play sound
    if (isSoundEnabled()) {
      playSound('alert');
    }
    
    // Show toast
    toast.info('Nova notificação', {
      description: `Uma nova ${type === 'maintenance' ? 'manutenção' : type === 'prediction' ? 'predição' : 'resumo'} foi adicionada.`,
      action: {
        label: 'Ver',
        onClick: () => {
          setNewNotificationsCount(0);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      },
    });
    
    // Invalidate queries to refetch data
    if (type === 'maintenance') {
      queryClient.invalidateQueries({ queryKey: ['maintenance-alerts-history'] });
    } else if (type === 'prediction') {
      queryClient.invalidateQueries({ queryKey: ['ml-predictions-history'] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['daily-summaries-history'] });
    }
  }, [queryClient, playSound, isSoundEnabled]);

  // Realtime subscriptions
  useEffect(() => {
    if (import.meta.env.DEV) console.log('[Realtime] Setting up notification subscriptions...');
    
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'maintenance_alerts',
        },
        (payload) => handleNewNotification('maintenance', payload.new)
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'machine_predictions',
        },
        (payload) => handleNewNotification('prediction', payload.new)
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_summaries',
        },
        (payload) => handleNewNotification('summary', payload.new)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'maintenance_alerts',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['maintenance-alerts-history'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'machine_predictions',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ml-predictions-history'] });
        }
      )
      .subscribe((status) => {
        if (import.meta.env.DEV) console.log('[Realtime] Subscription status:', status);
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      if (import.meta.env.DEV) console.log('[Realtime] Cleaning up notification subscriptions...');
      supabase.removeChannel(channel);
    };
  }, [handleNewNotification, queryClient]);

  // Fetch maintenance alerts
  const { data: maintenanceAlerts, isLoading: isLoadingAlerts, refetch: refetchAlerts } = useQuery({
    queryKey: ['maintenance-alerts-history', dateRange],
    queryFn: async () => {
      const fromDate = subDays(new Date(), parseInt(dateRange));
      const { data, error } = await supabase
        .from('maintenance_alerts')
        .select('*, machines(name, code)')
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as MaintenanceAlert[];
    },
  });

  // Fetch ML predictions
  const { data: predictions, isLoading: isLoadingPredictions, refetch: refetchPredictions } = useQuery({
    queryKey: ['ml-predictions-history', dateRange],
    queryFn: async () => {
      const fromDate = subDays(new Date(), parseInt(dateRange));
      const { data, error } = await supabase
        .from('machine_predictions')
        .select('*, machines(name, code)')
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as MachinePrediction[];
    },
  });

  // Fetch daily summaries
  const { data: summaries, isLoading: isLoadingSummaries, refetch: refetchSummaries } = useQuery({
    queryKey: ['daily-summaries-history', dateRange],
    queryFn: async () => {
      const fromDate = subDays(new Date(), parseInt(dateRange));
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data as DailySummaryRecord[];
    },
  });

  // Transform data into unified notification format
  const notifications = useMemo((): NotificationItem[] => {
    const items: NotificationItem[] = [];

    // Add maintenance alerts
    (maintenanceAlerts || []).forEach((alert) => {
      const severity = alert.alert_type === 'critical' ? 'critical' 
        : alert.alert_type === 'overdue' ? 'warning' 
        : 'info';
      
      items.push({
        id: `maintenance-${alert.id}`,
        type: 'maintenance',
        title: `Manutenção ${alert.alert_type === 'critical' ? 'Crítica' : alert.alert_type === 'overdue' ? 'Atrasada' : 'Pendente'}`,
        message: `${alert.machines?.name || 'Máquina'}: ${alert.message}`,
        severity,
        timestamp: alert.created_at,
        isRead: alert.is_read,
        isResolved: alert.is_resolved,
        metadata: { machineId: alert.machine_id },
      });
    });

    // Add ML predictions
    (predictions || []).forEach((pred) => {
      const severity = pred.risk_score >= 85 ? 'critical' 
        : pred.risk_score >= 70 ? 'warning' 
        : 'info';
      
      items.push({
        id: `prediction-${pred.id}`,
        type: 'prediction',
        title: `Predição ${pred.prediction_type === 'failure' ? 'de Falha' : 'de Manutenção'}`,
        message: `${pred.machines?.name || 'Máquina'}: Risco ${pred.risk_score}%${pred.predicted_failure_date ? ` - Previsão: ${format(new Date(pred.predicted_failure_date), 'dd/MM/yyyy')}` : ''}`,
        severity,
        timestamp: pred.created_at,
        isResolved: !pred.is_active,
        metadata: { machineId: pred.machine_id, riskScore: pred.risk_score },
      });
    });

    // Add daily summaries
    (summaries || []).forEach((summary) => {
      const hasIssues = summary.data?.alerts?.has_critical;
      const totalItems = summary.data?.alerts?.total_attention_items || 0;
      
      items.push({
        id: `summary-${summary.id}`,
        type: 'summary',
        title: `Resumo Diário - ${format(new Date(summary.date), "dd 'de' MMMM", { locale: ptBR })}`,
        message: hasIssues 
          ? `${totalItems} itens requerem atenção` 
          : 'Nenhum item crítico',
        severity: hasIssues ? 'warning' : 'success',
        timestamp: summary.created_at,
        metadata: summary.data,
      });
    });

    // Sort by timestamp
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return items;
  }, [maintenanceAlerts, predictions, summaries]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(n => n.type === activeTab);
    }

    // Filter by severity
    if (severityFilter !== 'all') {
      filtered = filtered.filter(n => n.severity === severityFilter);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.message.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notifications, activeTab, severityFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    total: notifications.length,
    critical: notifications.filter(n => n.severity === 'critical').length,
    warning: notifications.filter(n => n.severity === 'warning').length,
    unresolved: notifications.filter(n => !n.isResolved).length,
    maintenance: notifications.filter(n => n.type === 'maintenance').length,
    predictions: notifications.filter(n => n.type === 'prediction').length,
    summaries: notifications.filter(n => n.type === 'summary').length,
  }), [notifications]);

  const handleRefreshAll = async () => {
    await Promise.all([
      refetchAlerts(),
      refetchPredictions(),
      refetchSummaries(),
      manualRefresh(),
    ]);
  };

  const isLoading = isLoadingAlerts || isLoadingPredictions || isLoadingSummaries;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      case 'prediction':
        return <Brain className="h-4 w-4" />;
      case 'summary':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">
              <span className="gradient-text">Central de Notificações</span>
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">
                Histórico unificado de alertas, predições e resumos
              </p>
              {/* Realtime indicator */}
              <Badge 
                variant={isRealtimeConnected ? "secondary" : "outline"} 
                className={cn(
                  "gap-1 text-xs",
                  isRealtimeConnected 
                    ? "bg-green-500/20 text-green-600 border-green-500/30" 
                    : "text-muted-foreground"
                )}
              >
                {isRealtimeConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    Ao vivo
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </>
                )}
              </Badge>
              {newNotificationsCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {newNotificationsCount} nova{newNotificationsCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {permission !== 'granted' && (
              <Button variant="outline" onClick={requestPermission} className="gap-2">
                <Bell className="h-4 w-4" />
                Ativar Push
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => {
                setNewNotificationsCount(0);
                handleRefreshAll();
              }}
              disabled={isLoading || isSummaryLoading}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", (isLoading || isSummaryLoading) && "animate-spin")} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Bell className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Críticos</p>
                  <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Atenção</p>
                  <p className="text-2xl font-bold text-warning">{stats.warning}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-warning/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{stats.unresolved}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar notificações..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="warning">Atenção</SelectItem>
                  <SelectItem value="info">Informativo</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full sm:w-40">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Último dia</SelectItem>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader className="pb-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Todas</span>
                  <Badge variant="secondary" className="ml-1">{stats.total}</Badge>
                </TabsTrigger>
                <TabsTrigger value="maintenance" className="gap-2">
                  <Wrench className="h-4 w-4" />
                  <span className="hidden sm:inline">Manutenção</span>
                  <Badge variant="secondary" className="ml-1">{stats.maintenance}</Badge>
                </TabsTrigger>
                <TabsTrigger value="prediction" className="gap-2">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">Predições</span>
                  <Badge variant="secondary" className="ml-1">{stats.predictions}</Badge>
                </TabsTrigger>
                <TabsTrigger value="summary" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Resumos</span>
                  <Badge variant="secondary" className="ml-1">{stats.summaries}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <BellOff className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">Nenhuma notificação encontrada</p>
                  <p className="text-sm">Tente ajustar os filtros ou período</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                        notification.severity === 'critical' && "border-destructive/30 bg-destructive/5",
                        notification.severity === 'warning' && "border-warning/30 bg-warning/5",
                        notification.severity === 'success' && "border-green-500/30 bg-green-500/5",
                        notification.isResolved && "opacity-60"
                      )}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getSeverityIcon(notification.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{notification.title}</span>
                          <Badge variant="outline" className="gap-1 text-xs">
                            {getTypeIcon(notification.type)}
                            {notification.type === 'maintenance' ? 'Manutenção' 
                              : notification.type === 'prediction' ? 'ML' 
                              : 'Resumo'}
                          </Badge>
                          {notification.isResolved && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolvido
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.timestamp), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
