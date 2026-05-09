import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Clock, 
  User, 
  Package, 
  Palette,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  FileText,
  Hash,
  Building,
  QrCode,
  Copy,
  History,
  DollarSign,
  Activity
} from "lucide-react";
import { useSchedulingData } from "@/hooks/useSchedulingData";
import { DbJob } from "@/hooks/useJobs";
import { JobQRCode } from "@/components/qrcode/JobQRCode";
import { useDuplicateJob } from "@/hooks/useDuplicateJob";
import { useEntityAuditTrail } from "@/hooks/useAuditTrail";
import { AuditEntryCard } from "@/components/audit/AuditEntryCard";
import { HistoryPeriodFilter, type HistoryPeriodValue } from "@/components/audit/HistoryPeriodFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCostsTab } from "./JobCostsTab";
import { JobTraceabilityTab } from "./JobTraceabilityTab";
import { JobQualityTab } from "./JobQualityTab";
import { useState } from "react";

interface JobDetailsModalProps {
  job: DbJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (jobId: string, newStatus: DbJob['status']) => void;
}

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

export function JobDetailsModal({ job, open, onOpenChange, onStatusChange }: JobDetailsModalProps) {
  const { getTechniqueById, getMachineById } = useSchedulingData();
  const { duplicateJob } = useDuplicateJob();
  if (!job) return null;

  const technique = getTechniqueById(job.technique_id);
  const machine = getMachineById(job.machine_id);

  const InfoRow = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color?: string }) => (
    <div className="flex items-center gap-3 py-2">
      <div className={`p-2 rounded-lg ${color || 'bg-muted/50'}`}>
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );

  const handleAction = (action: string) => {
    if (onStatusChange) {
      switch (action) {
        case 'start':
          onStatusChange(job.id, 'production');
          break;
        case 'pause':
          onStatusChange(job.id, 'paused');
          break;
        case 'finish':
          onStatusChange(job.id, 'finished');
          break;
        case 'rework':
          onStatusChange(job.id, 'rework');
          break;
      }
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border/50 backdrop-blur-sm">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              {job.order_number}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => duplicateJob(job)}
                className="border-border/50 text-muted-foreground hover:text-foreground"
                title="Duplicar Job"
              >
                <Copy className="h-4 w-4 mr-1" />
                Duplicar
              </Button>
              <Badge className={`${priorityColors[job.priority]} border`}>
                {priorityLabels[job.priority]}
              </Badge>
              <StatusBadge status={job.status} />
            </div>
          </div>
          <DialogDescription className="sr-only">
            Detalhes do trabalho {job.order_number}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="details" className="text-[10px] sm:text-xs">Detalhes</TabsTrigger>
            <TabsTrigger value="quality" className="flex items-center gap-1 text-[10px] sm:text-xs">
              <Activity className="h-3 w-3" />
              Qualidade
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-1 text-[10px] sm:text-xs">
              <DollarSign className="h-3 w-3" />
              Custos
            </TabsTrigger>
            <TabsTrigger value="traceability" className="flex items-center gap-1 text-[10px] sm:text-xs">
              <Package className="h-3 w-3" />
              Rastreio
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1 text-[10px] sm:text-xs">
              <History className="h-3 w-3" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-4">
            {/* Client & Product */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-cyan-500/20">
                  <Building className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{job.client}</h3>
                  <p className="text-muted-foreground mt-1">{job.product}</p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 p-4 rounded-xl bg-muted/20 border border-border/30">
                <InfoRow 
                  icon={Package} 
                  label="Quantidade" 
                  value={`${job.quantity.toLocaleString()} peças`}
                  color="bg-green-500/20"
                />
                <InfoRow 
                  icon={Palette} 
                  label="Cor da Gravura" 
                  value={job.gravure_color || 'Não definida'}
                  color="bg-purple-500/20"
                />
                <InfoRow 
                  icon={Clock} 
                  label="Duração Estimada" 
                  value={`${job.estimated_duration} minutos`}
                  color="bg-orange-500/20"
                />
              </div>

              <div className="space-y-1 p-4 rounded-xl bg-muted/20 border border-border/30">
                <InfoRow 
                  icon={Calendar} 
                  label="Data Agendada" 
                  value={job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString('pt-BR') : 'Não agendada'}
                  color="bg-cyan-500/20"
                />
                <InfoRow 
                  icon={Clock} 
                  label="Horário" 
                  value={job.start_time && job.end_time ? `${job.start_time} - ${job.end_time}` : 'Não definido'}
                  color="bg-yellow-500/20"
                />
                <InfoRow 
                  icon={User} 
                  label="Máquina" 
                  value={machine ? `${machine.code} - ${machine.name}` : 'Não atribuída'}
                  color="bg-pink-500/20"
                />
              </div>
            </div>

            {/* Technique & Machine */}
            <div className="flex gap-4">
              <div className="flex-1 p-4 rounded-xl border border-border/30" style={{ backgroundColor: `${technique?.color}10` }}>
                <p className="text-xs text-muted-foreground mb-1">Técnica</p>
                <Badge 
                  variant="outline"
                  className="text-sm"
                  style={{ 
                    backgroundColor: `${technique?.color}20`,
                    borderColor: `${technique?.color}50`,
                    color: technique?.color 
                  }}
                >
                  {technique?.name || 'Não definida'}
                </Badge>
              </div>
              <div className="flex-1 p-4 rounded-xl bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground mb-1">Máquina</p>
                <p className="text-sm font-medium text-foreground">
                  {machine ? `${machine.code} - ${machine.name}` : 'Não atribuída'}
                </p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex justify-center">
              <JobQRCode 
                jobId={job.id}
                orderNumber={job.order_number}
                product={job.product}
                client={job.client}
                size={120}
              />
            </div>

            {/* Notes */}
            {job.notes && (
              <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Observações</p>
                </div>
                <p className="text-sm text-foreground">{job.notes}</p>
              </div>
            )}

            <Separator className="bg-border/50" />

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {(job.status === 'queue' || job.status === 'ready' || job.status === 'scheduled') && (
                <Button 
                  onClick={() => handleAction('start')}
                  className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Produção
                </Button>
              )}
              
              {job.status === 'production' && (
                <>
                  <Button 
                    onClick={() => handleAction('pause')}
                    className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </Button>
                  <Button 
                    onClick={() => handleAction('finish')}
                    className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalizar
                  </Button>
                </>
              )}

              {job.status === 'paused' && (
                <Button 
                  onClick={() => handleAction('start')}
                  className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Retomar
                </Button>
              )}

              {job.status !== 'rework' && job.status !== 'finished' && job.status !== 'cancelled' && (
                <Button 
                  onClick={() => handleAction('rework')}
                  variant="outline"
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Marcar Retrabalho
                </Button>
              )}

              {job.status === 'delayed' && (
                <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-2">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Job Atrasado
                </Badge>
              )}
            </div>
          </TabsContent>

          <TabsContent value="costs">
            <JobCostsTab jobId={job.id} />
          </TabsContent>

          <TabsContent value="traceability">
            <JobTraceabilityTab jobId={job.id} />
          </TabsContent>

          <TabsContent value="history">
            <JobHistoryTab jobId={job.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function JobHistoryTab({ jobId }: { jobId: string }) {
  const [period, setPeriod] = useState<HistoryPeriodValue>({ preset: 'all' });
  const { data, isLoading, error } = useEntityAuditTrail('jobs', jobId, {
    fromDate: period.fromDate,
    toDate: period.toDate,
  });

  return (
    <div className="mt-4">
      <HistoryPeriodFilter value={period} onChange={setPeriod} resultCount={data?.length} />
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <div className="text-sm text-destructive p-4 border border-destructive/30 rounded-md bg-destructive/10">
          Não foi possível carregar o histórico.
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-12 border border-dashed rounded-xl">
          Nenhum registro encontrado no período selecionado.
        </div>
      ) : (
        <ScrollArea className="h-[420px] pr-4">
          <div className="space-y-3 pb-4">
            {data.map((entry) => (
              <AuditEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
