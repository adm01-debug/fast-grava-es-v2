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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  RefreshCw,
  Timer,
  Database
} from "lucide-react";
import { useSchedulingData } from "@/hooks/useSchedulingData";
import { DbJob } from "@/hooks/useJobs";
import { Job } from "@/types/scheduling";
import { useBottleneckPrediction, BottleneckAlert } from "@/hooks/useBottleneckPrediction";
import { useLoadBalancing, LoadBalancingSuggestion } from "@/hooks/useLoadBalancing";
import { useEfficiencyNotifications } from "@/hooks/useEfficiencyNotifications";
import { EfficiencyAlertHistoryWidget } from "@/components/dashboard/EfficiencyAlertHistoryWidget";
import { useStuckJobsDetection, StuckJob } from "@/hooks/useStuckJobsDetection";
import { useOrphanedDataDetection } from "@/hooks/useOrphanedDataDetection";

const priorityColors: Record<string, string> = {
  urgent: 'bg-primary/20 text-primary border-primary/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30'
};

const priorityLabels: Record<string, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa'
};

type ViewAllModalType = 'jobs' | 'bottleneck' | 'loadBalancing' | 'stuckJobs' | null;

interface ViewAllModalData {
  type: ViewAllModalType;
  title: string;
  jobs?: DbJob[];
  bottleneckAlerts?: BottleneckAlert[];
  loadBalancingSuggestions?: LoadBalancingSuggestion[];
  stuckJobs?: StuckJob[];
}

export default function AlertsDashboard() {
  const [selectedJob, setSelectedJob] = useState<DbJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewAllModal, setViewAllModal] = useState<ViewAllModalData | null>(null);

  // Fetch real data from Supabase
  const { jobs, getTechniqueById } = useSchedulingData();

  // Convert DbJob to Job format for modal
  const dbJobToJob = (dbJob: DbJob): Job => ({
    id: dbJob.id,
    orderNumber: dbJob.order_number,
    client: dbJob.client,
    product: dbJob.product,
    quantity: dbJob.quantity,
    techniqueId: dbJob.technique_id as Job['techniqueId'],
    machineId: dbJob.machine_id || '',
    operatorId: '',
    scheduledDate: dbJob.scheduled_date ? new Date(dbJob.scheduled_date) : new Date(),
    startTime: dbJob.start_time || '',
    endTime: dbJob.end_time || '',
    estimatedDuration: dbJob.estimated_duration,
    status: dbJob.status as Job['status'],
    gravureColor: dbJob.gravure_color || undefined,
    notes: dbJob.notes || undefined,
    priority: dbJob.priority as Job['priority'],
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
    setSelectedJob(dbJob);
    setIsModalOpen(true);
  };

  const handleViewAll = (type: ViewAllModalType, title: string, data: {
    jobs?: DbJob[];
    bottleneckAlerts?: BottleneckAlert[];
    loadBalancingSuggestions?: LoadBalancingSuggestion[];
    stuckJobs?: StuckJob[];
  }) => {
    setViewAllModal({ type, title, ...data });
  };

  const AlertCard = ({ 
    title, 
    icon: Icon, 
    iconColor, 
    bgColor, 
    jobs: cardJobs, 
    emptyMessage,
    isCritical = false
  }: { 
    title: string; 
    icon: React.ElementType; 
    iconColor: string; 
    bgColor: string;
    jobs: DbJob[]; 
    emptyMessage: string;
    isCritical?: boolean;
  }) => (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${bgColor} ${isCritical && cardJobs.length > 0 ? 'animate-bounce-attention' : ''}`}>
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
                      <Badge className={`${priorityColors[job.priority] || priorityColors.medium} border text-xs ${job.priority === 'urgent' ? 'wiggle-infinite' : ''}`}>
                        {priorityLabels[job.priority] || 'Média'}
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
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => handleViewAll('jobs', title, { jobs: cardJobs })}
          >
            Ver todos ({cardJobs.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // View All Modal for Jobs
  const JobsViewAllModal = ({ jobs: modalJobs, title }: { jobs: DbJob[]; title: string }) => (
    <ScrollArea className="max-h-[60vh]">
      <div className="space-y-3 pr-4">
        {modalJobs.map((job) => {
          const technique = getTechniqueById(job.technique_id);
          return (
            <div 
              key={job.id}
              onClick={() => {
                setViewAllModal(null);
                handleJobClick(job);
              }}
              className="p-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{job.order_number}</span>
                    <Badge className={`${priorityColors[job.priority] || priorityColors.medium} border text-xs`}>
                      {priorityLabels[job.priority] || 'Média'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">{job.client} - {job.product}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString('pt-BR') : '-'}
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
        })}
      </div>
    </ScrollArea>
  );

  // View All Modal for Bottleneck Alerts
  const BottleneckViewAllModal = ({ alerts }: { alerts: BottleneckAlert[] }) => (
    <ScrollArea className="max-h-[60vh]">
      <div className="space-y-3 pr-4">
        {alerts.map((alert, index) => (
          <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-foreground">{alert.techniqueName}</span>
              <Badge className={`${
                alert.severity === 'critical' 
                  ? 'bg-primary/20 text-primary border-primary/30' 
                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              } border text-xs`}>
                {alert.severity === 'critical' ? 'Crítico' : 'Atenção'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{alert.message}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(alert.date).toLocaleDateString('pt-BR')}
              </span>
              <span>Ocupação: {alert.currentCapacity.toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );

  // View All Modal for Load Balancing
  const LoadBalancingViewAllModal = ({ suggestions }: { suggestions: LoadBalancingSuggestion[] }) => (
    <ScrollArea className="max-h-[60vh]">
      <div className="space-y-3 pr-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-foreground">
                {suggestion.currentMachineName} → {suggestion.suggestedMachineName}
              </span>
              <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 border text-xs">
                Redistribuir
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Mover job {suggestion.orderNumber} ({suggestion.client})
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>Diferença: {suggestion.loadDifference.toFixed(0)}%</span>
              <span>Carga atual: {suggestion.currentLoad.toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );

  // View All Modal for Stuck Jobs
  const StuckJobsViewAllModal = ({ stuckJobs: modalStuckJobs }: { stuckJobs: StuckJob[] }) => (
    <ScrollArea className="max-h-[60vh]">
      <div className="space-y-3 pr-4">
        {modalStuckJobs.map((stuck) => {
          const technique = getTechniqueById(stuck.job.technique_id);
          return (
            <div 
              key={stuck.job.id}
              onClick={() => {
                setViewAllModal(null);
                handleJobClick(stuck.job);
              }}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                stuck.severity === 'critical' 
                  ? 'bg-primary/10 border-primary/30 hover:bg-primary/20' 
                  : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{stuck.job.order_number}</span>
                    <Badge variant={stuck.severity === 'critical' ? 'destructive' : 'outline'} className="text-xs">
                      {Math.round(stuck.hoursInProduction)}h em produção
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{stuck.job.client} - {stuck.job.product}</p>
                </div>
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
          );
        })}
      </div>
    </ScrollArea>
  );

  // Efficiency alerts
  const { alerts: bottleneckAlerts, criticalCount, warningCount } = useBottleneckPrediction();
  const { suggestions: loadBalancingSuggestions } = useLoadBalancing();
  const { 
    checkBottleneckAlerts, 
    checkLoadBalancingAlerts 
  } = useEfficiencyNotifications();
  
  // Stuck jobs and data integrity
  const { stuckJobs, criticalCount: stuckCritical, warningCount: stuckWarning } = useStuckJobsDetection();
  const { issues: dataIssues, orphanedTechniques } = useOrphanedDataDetection();

  const totalJobAlerts = alertData.delayed.length + alertData.rework.length + 
                      alertData.urgent.length + alertData.atRisk.length + alertData.overdue.length;
  
  const totalEfficiencyAlerts = criticalCount + warningCount + loadBalancingSuggestions.length;
  const totalSystemAlerts = stuckJobs.length + dataIssues.length;
  const totalAlerts = totalJobAlerts + totalEfficiencyAlerts + totalSystemAlerts;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-4 sm:space-y-6">
      <JobDetailsModal 
        job={selectedJob} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />

      {/* View All Modal */}
      <Dialog open={viewAllModal !== null} onOpenChange={(open) => !open && setViewAllModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewAllModal?.title}
              <Badge variant="outline" className="ml-2">
                {viewAllModal?.type === 'jobs' && viewAllModal.jobs?.length}
                {viewAllModal?.type === 'bottleneck' && viewAllModal.bottleneckAlerts?.length}
                {viewAllModal?.type === 'loadBalancing' && viewAllModal.loadBalancingSuggestions?.length}
                {viewAllModal?.type === 'stuckJobs' && viewAllModal.stuckJobs?.length}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {viewAllModal?.type === 'jobs' && viewAllModal.jobs && (
            <JobsViewAllModal jobs={viewAllModal.jobs} title={viewAllModal.title} />
          )}
          {viewAllModal?.type === 'bottleneck' && viewAllModal.bottleneckAlerts && (
            <BottleneckViewAllModal alerts={viewAllModal.bottleneckAlerts} />
          )}
          {viewAllModal?.type === 'loadBalancing' && viewAllModal.loadBalancingSuggestions && (
            <LoadBalancingViewAllModal suggestions={viewAllModal.loadBalancingSuggestions} />
          )}
          {viewAllModal?.type === 'stuckJobs' && viewAllModal.stuckJobs && (
            <StuckJobsViewAllModal stuckJobs={viewAllModal.stuckJobs} />
          )}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-xl bg-red-500/20">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-red-400" />
            </div>
            Dashboard de Alertas
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Monitoramento de jobs atrasados e produções em risco</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkBottleneckAlerts}
            className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10 text-xs sm:text-sm"
          >
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Verificar</span> Gargalos
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkLoadBalancingAlerts}
            className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 text-xs sm:text-sm"
          >
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Verificar</span> Balanc.
          </Button>
          <Badge 
            className={`${totalAlerts > 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'} border px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm`}
          >
            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            {totalAlerts} alertas
          </Badge>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 sm:gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-xl bg-red-500/20">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{alertData.delayed.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Atrasados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-xl bg-orange-500/20">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{alertData.overdue.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Vencidos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-xl bg-yellow-500/20">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{alertData.urgent.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Urgentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-xl bg-cyan-500/20">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{alertData.atRisk.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Em Risco</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-xl bg-purple-500/20">
              <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{alertData.rework.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Retrabalho</p>
            </div>
          </CardContent>
        </Card>
        {/* Efficiency Stats */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-xl bg-pink-500/20">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-pink-400" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{criticalCount + warningCount}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Gargalos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-xl bg-teal-500/20">
              <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{loadBalancingSuggestions.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Desbalanc.</p>
            </div>
          </CardContent>
        </Card>
        {/* Stuck Jobs Stat */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className={`p-2 sm:p-3 rounded-xl ${stuckCritical > 0 ? 'bg-red-500/20' : 'bg-indigo-500/20'}`}>
              <Timer className={`h-4 w-4 sm:h-5 sm:w-5 ${stuckCritical > 0 ? 'text-red-400' : 'text-indigo-400'}`} />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{stuckJobs.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Travados</p>
            </div>
          </CardContent>
        </Card>
        {/* Data Issues Stat */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className={`p-2 sm:p-3 rounded-xl ${dataIssues.length > 0 ? 'bg-amber-500/20' : 'bg-slate-500/20'}`}>
              <Database className={`h-4 w-4 sm:h-5 sm:w-5 ${dataIssues.length > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{dataIssues.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Integridade</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AlertCard 
          title="Jobs Atrasados" 
          icon={AlertTriangle} 
          iconColor="text-red-400" 
          bgColor="bg-red-500/20"
          jobs={alertData.delayed}
          emptyMessage="Nenhum job atrasado no momento"
          isCritical={true}
        />
        
        <AlertCard 
          title="Jobs Vencidos" 
          icon={Clock} 
          iconColor="text-orange-400" 
          bgColor="bg-orange-500/20"
          jobs={alertData.overdue}
          emptyMessage="Nenhum job vencido no momento"
          isCritical={true}
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

        {/* Stuck Jobs Alert */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${stuckCritical > 0 ? 'bg-red-500/20 animate-pulse' : 'bg-indigo-500/20'}`}>
                  <Timer className={`h-5 w-5 ${stuckCritical > 0 ? 'text-red-400' : 'text-indigo-400'}`} />
                </div>
                Jobs Travados
              </div>
              <Badge variant="outline" className={`${stuckCritical > 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-muted/50 text-foreground border-border'}`}>
                {stuckJobs.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stuckJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum job travado em produção</p>
            ) : (
              <>
                {stuckJobs.slice(0, 5).map((stuck) => {
                  const technique = getTechniqueById(stuck.job.technique_id);
                  return (
                    <div 
                      key={stuck.job.id}
                      onClick={() => handleJobClick(stuck.job)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        stuck.severity === 'critical' 
                          ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20' 
                          : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{stuck.job.order_number}</span>
                            <Badge variant={stuck.severity === 'critical' ? 'destructive' : 'outline'} className="text-xs">
                              {Math.round(stuck.hoursInProduction)}h em produção
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{stuck.job.client}</p>
                        </div>
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
                  );
                })}
                {stuckJobs.length > 5 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={() => handleViewAll('stuckJobs', 'Jobs Travados', { stuckJobs })}
                  >
                    Ver todos ({stuckJobs.length})
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Data Integrity Issues */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${dataIssues.length > 0 ? 'bg-amber-500/20' : 'bg-slate-500/20'}`}>
                  <Database className={`h-5 w-5 ${dataIssues.length > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
                </div>
                Integridade de Dados
              </div>
              <Badge variant="outline" className={`${dataIssues.length > 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-muted/50 text-foreground border-border'}`}>
                {dataIssues.length + orphanedTechniques.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dataIssues.length === 0 && orphanedTechniques.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum problema de integridade detectado</p>
            ) : (
              <>
                {orphanedTechniques.map((item) => (
                  <div 
                    key={item.technique.id}
                    className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.technique.color }}
                      />
                      <span className="font-medium text-amber-400">{item.technique.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.issue}</p>
                    <p className="text-xs text-amber-400 mt-1">
                      Cadastre máquinas para esta técnica para resolver.
                    </p>
                  </div>
                ))}
                {dataIssues.map((issue, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${
                      issue.severity === 'error' 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : 'bg-amber-500/10 border-amber-500/30'
                    }`}
                  >
                    <p className={`text-sm ${issue.severity === 'error' ? 'text-red-400' : 'text-amber-400'}`}>
                      {issue.message}
                    </p>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

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
              <>
                {bottleneckAlerts.slice(0, 5).map((alert, index) => (
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
                          <span>Ocupação: {alert.currentCapacity.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {bottleneckAlerts.length > 5 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={() => handleViewAll('bottleneck', 'Previsão de Gargalos', { bottleneckAlerts })}
                  >
                    Ver todos ({bottleneckAlerts.length})
                  </Button>
                )}
              </>
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
              <>
                {loadBalancingSuggestions.slice(0, 5).map((suggestion, index) => (
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
                ))}
                {loadBalancingSuggestions.length > 5 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={() => handleViewAll('loadBalancing', 'Desbalanceamento de Carga', { loadBalancingSuggestions })}
                  >
                    Ver todos ({loadBalancingSuggestions.length})
                  </Button>
                )}
              </>
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
