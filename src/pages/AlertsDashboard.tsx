import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { JobDetailsModal } from "@/components/jobs/JobDetailsModal";
import { 
  AlertTriangle, 
  Clock, 
  AlertCircle,
  RotateCcw,
  Calendar,
  Package,
  TrendingDown,
  Bell,
  ChevronRight,
  Zap
} from "lucide-react";
import { mockJobs, getTechniqueById, getMachineById } from "@/data/mockData";
import { Job } from "@/types/scheduling";

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

  // Filter jobs by alert categories
  const alertData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const delayed = mockJobs.filter(job => job.status === 'delayed');
    const rework = mockJobs.filter(job => job.status === 'rework');
    const urgent = mockJobs.filter(job => 
      job.priority === 'urgent' && 
      !['finished', 'cancelled'].includes(job.status)
    );
    
    // Jobs at risk: scheduled for today but not started yet
    const atRisk = mockJobs.filter(job => {
      const jobDate = new Date(job.scheduledDate);
      const jobDateOnly = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate());
      return jobDateOnly.getTime() === today.getTime() && 
             ['queue', 'ready', 'scheduled'].includes(job.status);
    });

    // Overdue: past scheduled date and not finished
    const overdue = mockJobs.filter(job => {
      const jobDate = new Date(job.scheduledDate);
      return jobDate < today && 
             !['finished', 'cancelled'].includes(job.status);
    });

    return { delayed, rework, urgent, atRisk, overdue };
  }, []);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const AlertCard = ({ 
    title, 
    icon: Icon, 
    iconColor, 
    bgColor, 
    jobs, 
    emptyMessage 
  }: { 
    title: string; 
    icon: any; 
    iconColor: string; 
    bgColor: string;
    jobs: Job[]; 
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
            {jobs.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
        ) : (
          jobs.slice(0, 5).map((job) => {
            const technique = getTechniqueById(job.techniqueId);
            const machine = getMachineById(job.machineId);
            
            return (
              <div 
                key={job.id}
                onClick={() => handleJobClick(job)}
                className="p-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{job.orderNumber}</span>
                      <Badge className={`${priorityColors[job.priority]} border text-xs`}>
                        {priorityLabels[job.priority]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">{job.client}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(job.scheduledDate).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {job.startTime}
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
                        {technique?.shortName}
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
        {jobs.length > 5 && (
          <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
            Ver todos ({jobs.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const totalAlerts = alertData.delayed.length + alertData.rework.length + 
                      alertData.urgent.length + alertData.atRisk.length + alertData.overdue.length;

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
        <Badge 
          className={`${totalAlerts > 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'} border px-4 py-2`}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          {totalAlerts} alertas ativos
        </Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

        {/* Critical Alert Summary */}
        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              Resumo Crítico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                <p className="text-xs text-muted-foreground">Total de Alertas</p>
                <p className="text-2xl font-bold text-foreground">{totalAlerts}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                <p className="text-xs text-muted-foreground">Críticos (Atrasados + Vencidos)</p>
                <p className="text-2xl font-bold text-red-400">
                  {alertData.delayed.length + alertData.overdue.length}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border/30">
              <p className="text-xs text-muted-foreground mb-2">Distribuição por Severidade</p>
              <div className="flex gap-2">
                <div className="flex-1 h-2 rounded-full bg-red-500/50" style={{ flex: alertData.delayed.length + alertData.overdue.length || 0.1 }} />
                <div className="flex-1 h-2 rounded-full bg-yellow-500/50" style={{ flex: alertData.urgent.length || 0.1 }} />
                <div className="flex-1 h-2 rounded-full bg-cyan-500/50" style={{ flex: alertData.atRisk.length || 0.1 }} />
                <div className="flex-1 h-2 rounded-full bg-purple-500/50" style={{ flex: alertData.rework.length || 0.1 }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Crítico</span>
                <span>Urgente</span>
                <span>Em Risco</span>
                <span>Retrabalho</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
