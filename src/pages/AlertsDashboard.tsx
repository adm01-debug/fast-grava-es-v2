import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { JobDetailsModal } from "@/components/jobs/JobDetailsModal";
import { PushNotificationManager } from "@/components/notifications/PushNotificationManager";
import { Bitrix24SyncPanel } from "@/components/integrations/Bitrix24SyncPanel";
import { Bitrix24SyncHistory } from "@/components/integrations/Bitrix24SyncHistory";
import { Bitrix24FieldMapping } from "@/components/integrations/Bitrix24FieldMapping";
import { 
  AlertTriangle, 
  Clock, 
  AlertCircle,
  RotateCcw,
  Calendar,
  TrendingDown,
  Bell,
  ChevronRight,
  Zap,
  Activity,
  Scale,
  RefreshCw
} from "lucide-react";
import { useJobs, useTechniques, DbJob } from "@/hooks/useJobs";
import { Job } from "@/types/scheduling";
import { useBottleneckPrediction } from "@/hooks/useBottleneckPrediction";
import { useLoadBalancing } from "@/hooks/useLoadBalancing";
import { useEfficiencyNotifications } from "@/hooks/useEfficiencyNotifications";
import { EfficiencyAlertHistoryWidget } from "@/components/dashboard/EfficiencyAlertHistoryWidget";
const priorityColors = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30'
};

const priorityLabels = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa'
};

export default function AlertsDashboard() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch real data from Supabase
  const { data: jobs = [], isLoading: isLoadingJobs } = useJobs();
  const { data: techniques = [] } = useTechniques();

  // Helper to get technique by ID
  const getTechniqueById = (id: string) => techniques.find(t => t.id === id);

  // Convert DbJob to Job format for modal
  const dbJobToJob = (dbJob: DbJob): Job => ({
    id: dbJob.id,
    orderNumber: dbJob.order_number,
    client: dbJob.client,
    product: dbJob.product,
    quantity: dbJob.quantity,
    techniqueId: dbJob.technique_id as any,
    machineId: dbJob.machine_id || '',
    operatorId: '',
    scheduledDate: dbJob.scheduled_date ? new Date(dbJob.scheduled_date) : new Date(),
    startTime: dbJob.start_time || '',
    endTime: dbJob.end_time || '',
    estimatedDuration: dbJob.estimated_duration,
    status: dbJob.status as any,
    gravureColor: dbJob.gravure_color || undefined,
    notes: dbJob.notes || undefined,
    priority: dbJob.priority as any,
    createdAt: new Date(dbJob.created_at),
    updatedAt: new Date(dbJob.updated_at),
    createdBy: '',
    actualStartTime: dbJob.actual_start_time ? new Date(dbJob.actual_start_time) : undefined,
    actualEndTime: dbJob.actual_end_time ? new Date(dbJob.actual_end_time) : undefined,
  });

  // Filter jobs by alert categories
  const alertData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const delayed = jobs.filter(job => job.status === 'delayed');
    const rework = jobs.filter(job => job.status === 'rework');
    const urgent = jobs.filter(job => 
      job.priority === 'urgent' && 
      !['finished', 'cancelled'].includes(job.status)
    );
    
    // Jobs at risk: scheduled for today but not started yet
    const atRisk = jobs.filter(job => {
      if (!job.scheduled_date) return false;
      const jobDate = new Date(job.scheduled_date);
      const jobDateOnly = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate());
      return jobDateOnly.getTime() === today.getTime() && 
             ['queue', 'ready', 'scheduled'].includes(job.status);
    });

    // Overdue: past scheduled date and not finished
    const overdue = jobs.filter(job => {
      if (!job.scheduled_date) return false;
      const jobDate = new Date(job.scheduled_date);
      return jobDate < today && 
             !['finished', 'cancelled'].includes(job.status);
    });

    return { delayed, rework, urgent, atRisk, overdue };
  }, [jobs]);

  const handleJobClick = (dbJob: DbJob) => {
    setSelectedJob(dbJobToJob(dbJob));
    setIsModalOpen(true);
  };

  const AlertCard = ({ 
    title, 
    icon: Icon, 
    iconColor, 
    bgColor, 
    jobs: cardJobs, 
    emptyMessage 
  }: { 
    title: string; 
    icon: any; 
    iconColor: string; 
    bgColor: string;
    jobs: DbJob[]; 
    emptyMessage: string;
  }) => (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${bgColor}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            {title}
          </div>
          <Badge variant="outline" className="bg-muted/50 text-foreground border-border">
            {cardJobs.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {cardJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
        ) : (
          cardJobs.slice(0, 5).map((job) => {
            const technique = getTechniqueById(job.technique_id);
            
            return (
              <div 
                key={job.id}
                onClick={() => handleJobClick(job)}
                className="p-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{job.order_number}</span>
                      <Badge className={`${priorityColors[job.priority]} border text-xs`}>
                        {priorityLabels[job.priority]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">{job.client}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString('pt-BR') : '-'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {job.start_time || '-'}
                      </span>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          backgroundColor: `${technique?.color}20`,
                          borderColor: `${technique?.color}50`,
                          color: technique?.color 
                        }}
                      >
                        {technique?.short_name}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={job.status} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            );
          })
        )}
        {cardJobs.length > 5 && (
          <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
            Ver todos ({cardJobs.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // Efficiency alerts
  const { alerts: bottleneckAlerts, criticalCount, warningCount } = useBottleneckPrediction();
  const { suggestions: loadBalancingSuggestions } = useLoadBalancing();
  const { 
    checkBottleneckAlerts, 
    checkLoadBalancingAlerts 
  } = useEfficiencyNotifications();

  const totalJobAlerts = alertData.delayed.length + alertData.rework.length + 
                      alertData.urgent.length + alertData.atRisk.length + alertData.overdue.length;
  
  const totalEfficiencyAlerts = criticalCount + warningCount + loadBalancingSuggestions.length;
  const totalAlerts = totalJobAlerts + totalEfficiencyAlerts;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <JobDetailsModal 
        job={selectedJob} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20">
              <Bell className="h-7 w-7 text-red-400" />
            </div>
            Dashboard de Alertas
          </h1>
          <p className="text-muted-foreground mt-1">Monitoramento de jobs atrasados e produções em risco</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkBottleneckAlerts}
            className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Verificar Gargalos
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkLoadBalancingAlerts}
            className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Verificar Balanceamento
          </Button>
          <Badge 
            className={`${totalAlerts > 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'} border px-4 py-2`}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {totalAlerts} alertas ativos
          </Badge>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500/20">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{alertData.delayed.length}</p>
              <p className="text-xs text-muted-foreground">Atrasados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-500/20">
              <Clock className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{alertData.overdue.length}</p>
              <p className="text-xs text-muted-foreground">Vencidos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/20">
              <Zap className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{alertData.urgent.length}</p>
              <p className="text-xs text-muted-foreground">Urgentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <AlertCircle className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{alertData.atRisk.length}</p>
              <p className="text-xs text-muted-foreground">Em Risco</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <RotateCcw className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{alertData.rework.length}</p>
              <p className="text-xs text-muted-foreground">Retrabalho</p>
            </div>
          </CardContent>
        </Card>
        {/* Efficiency Stats */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-pink-500/20">
              <Activity className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{criticalCount + warningCount}</p>
              <p className="text-xs text-muted-foreground">Gargalos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-teal-500/20">
              <Scale className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{loadBalancingSuggestions.length}</p>
              <p className="text-xs text-muted-foreground">Desbalanceamento</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertCard 
          title="Jobs Atrasados" 
          icon={AlertTriangle} 
          iconColor="text-red-400" 
          bgColor="bg-red-500/20"
          jobs={alertData.delayed}
          emptyMessage="Nenhum job atrasado no momento"
        />
        
        <AlertCard 
          title="Jobs Vencidos" 
          icon={Clock} 
          iconColor="text-orange-400" 
          bgColor="bg-orange-500/20"
          jobs={alertData.overdue}
          emptyMessage="Nenhum job vencido no momento"
        />

        <AlertCard 
          title="Prioridade Urgente" 
          icon={Zap} 
          iconColor="text-yellow-400" 
          bgColor="bg-yellow-500/20"
          jobs={alertData.urgent}
          emptyMessage="Nenhum job urgente pendente"
        />

        <AlertCard 
          title="Produções em Risco" 
          icon={AlertCircle} 
          iconColor="text-cyan-400" 
          bgColor="bg-cyan-500/20"
          jobs={alertData.atRisk}
          emptyMessage="Nenhuma produção em risco hoje"
        />

        <AlertCard 
          title="Aguardando Retrabalho" 
          icon={RotateCcw} 
          iconColor="text-purple-400" 
          bgColor="bg-purple-500/20"
          jobs={alertData.rework}
          emptyMessage="Nenhum job aguardando retrabalho"
        />

        {/* Bottleneck Alerts */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-pink-500/20">
                  <Activity className="h-5 w-5 text-pink-400" />
                </div>
                Previsão de Gargalos
              </div>
              <Badge variant="outline" className="bg-muted/50 text-foreground border-border">
                {bottleneckAlerts.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bottleneckAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum gargalo previsto</p>
            ) : (
              bottleneckAlerts.slice(0, 5).map((alert, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg bg-muted/30 border border-border/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{alert.techniqueName}</span>
                        <Badge className={`${
                          alert.severity === 'critical' 
                            ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        } border text-xs`}>
                          {alert.severity === 'critical' ? 'Crítico' : 'Atenção'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(alert.date).toLocaleDateString('pt-BR')}
                        </span>
                        <span>Ocupação: {alert.currentOccupancy.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {bottleneckAlerts.length > 5 && (
              <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                Ver todos ({bottleneckAlerts.length})
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Load Balancing Alerts */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-500/20">
                  <Scale className="h-5 w-5 text-teal-400" />
                </div>
                Desbalanceamento de Carga
              </div>
              <Badge variant="outline" className="bg-muted/50 text-foreground border-border">
                {loadBalancingSuggestions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadBalancingSuggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Carga balanceada entre máquinas</p>
            ) : (
              loadBalancingSuggestions.slice(0, 5).map((suggestion, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg bg-muted/30 border border-border/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {suggestion.currentMachineName} → {suggestion.suggestedMachineName}
                        </span>
                        <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 border text-xs">
                          Redistribuir
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Mover job {suggestion.orderNumber} ({suggestion.client})
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Diferença: {suggestion.loadDifference.toFixed(0)}%</span>
                        <span>Carga atual: {suggestion.currentLoad.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {loadBalancingSuggestions.length > 5 && (
              <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                Ver todos ({loadBalancingSuggestions.length})
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Critical Alert Summary */}
        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              Resumo Crítico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                <p className="text-xs text-muted-foreground">Total de Alertas</p>
                <p className="text-2xl font-bold text-foreground">{totalAlerts}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                <p className="text-xs text-muted-foreground">Jobs Críticos</p>
                <p className="text-2xl font-bold text-red-400">
                  {alertData.delayed.length + alertData.overdue.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                <p className="text-xs text-muted-foreground">Gargalos Críticos</p>
                <p className="text-2xl font-bold text-pink-400">{criticalCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                <p className="text-xs text-muted-foreground">Sugestões de Balanceamento</p>
                <p className="text-2xl font-bold text-teal-400">{loadBalancingSuggestions.length}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border/30">
              <p className="text-xs text-muted-foreground mb-2">Distribuição por Categoria</p>
              <div className="flex gap-2">
                <div className="h-2 rounded-full bg-red-500/50" style={{ flex: alertData.delayed.length + alertData.overdue.length || 0.1 }} />
                <div className="h-2 rounded-full bg-yellow-500/50" style={{ flex: alertData.urgent.length || 0.1 }} />
                <div className="h-2 rounded-full bg-cyan-500/50" style={{ flex: alertData.atRisk.length || 0.1 }} />
                <div className="h-2 rounded-full bg-purple-500/50" style={{ flex: alertData.rework.length || 0.1 }} />
                <div className="h-2 rounded-full bg-pink-500/50" style={{ flex: criticalCount + warningCount || 0.1 }} />
                <div className="h-2 rounded-full bg-teal-500/50" style={{ flex: loadBalancingSuggestions.length || 0.1 }} />
              </div>
              <div className="grid grid-cols-6 gap-1 mt-2 text-xs text-muted-foreground text-center">
                <span>Crítico</span>
                <span>Urgente</span>
                <span>Risco</span>
                <span>Retrabalho</span>
                <span>Gargalos</span>
                <span>Balanceamento</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Alert History */}
        <EfficiencyAlertHistoryWidget />

        {/* Bitrix24 Integration */}
        <Bitrix24SyncPanel />

        {/* Bitrix24 Sync History */}
        <Bitrix24SyncHistory />

        {/* Bitrix24 Field Mapping */}
        <Bitrix24FieldMapping />

        {/* Push Notifications Manager */}
        <PushNotificationManager />
      </div>
    </div>
  );
}
