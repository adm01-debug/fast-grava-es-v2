import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Activity,
  Pencil,
  Trash2,
  Save,
  X
} from "lucide-react";
import { useSchedulingData } from "@/hooks/useSchedulingData";
import { DbJob, useUpdateJob, useDeleteJob } from "@/hooks/useJobs";
import { JobQRCode } from "@/components/qrcode/JobQRCode";
import { useDuplicateJob } from "@/hooks/useDuplicateJob";
import { useEntityAuditTrail } from "@/hooks/useAuditTrail";
import { AuditEntryCard } from "@/components/audit/AuditEntryCard";
import { HistoryPeriodFilter, type HistoryPeriodValue } from "@/components/audit/HistoryPeriodFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCostsTab } from "./JobCostsTab";
import { JobTraceabilityTab } from "./JobTraceabilityTab";
import { JobQualityTab } from "./JobQualityTab";
import { JobInstructionsTab } from "./JobInstructionsTab";
import { useState, useCallback, useEffect } from "react";
import { useDataExport } from "@/hooks/useDataExport";
import { useConfirmation } from "@/contexts/ConfirmationContext";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const jobEditSchema = z.object({
  order_number: z.string().min(1, 'Número da OS é obrigatório'),
  client: z.string().min(1, 'Cliente é obrigatório'),
  product: z.string().min(1, 'Produto é obrigatório'),
  quantity: z.number().min(1, 'Quantidade é obrigatória'),
  gravure_color: z.string().optional(),
  notes: z.string().optional(),
  priority: z.string(),
});

type JobEditValues = z.infer<typeof jobEditSchema>;

interface JobDetailsModalProps {
  job: DbJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (jobId: string, newStatus: DbJob['status']) => void;
}

const priorityColors = {
  urgent: 'bg-priority-urgent/20 text-priority-urgent border-priority-urgent/30',
  high: 'bg-priority-high/20 text-priority-high border-priority-high/30',
  medium: 'bg-priority-medium/20 text-priority-medium border-priority-medium/30',
  low: 'bg-priority-low/20 text-priority-low border-priority-low/30'
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
  const { confirm } = useConfirmation();
  const updateJobMutation = useUpdateJob();
  const deleteJobMutation = useDeleteJob();
  const [isEditing, setIsEditing] = useState(false);

  const { control, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<JobEditValues>({
    resolver: zodResolver(jobEditSchema),
  });

  useEffect(() => {
    if (job) {
      reset({
        order_number: job.order_number,
        client: job.client,
        product: job.product,
        quantity: job.quantity,
        gravure_color: job.gravure_color || '',
        notes: job.notes || '',
        priority: job.priority,
      });
    }
  }, [job, reset]);

  if (!job) return null;

  const technique = getTechniqueById(job.technique_id);
  const machine = getMachineById(job.machine_id);

  const handleSave = async (data: JobEditValues) => {
    try {
      await updateJobMutation.mutateAsync({ jobId: job.id, data: data as any });
      toast.success('Job atualizado com sucesso');
      setIsEditing(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Excluir Job',
      description: `Tem certeza que deseja excluir o job ${job.order_number}? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      variant: 'destructive'
    });

    if (confirmed) {
      try {
        await deleteJobMutation.mutateAsync(job.id);
        toast.success('Job excluído com sucesso');
        onOpenChange(false);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

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
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) setIsEditing(false); }}>
      <DialogContent className="max-w-2xl bg-card border-border/50 backdrop-blur-sm">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              {job.order_number}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="border-border/50 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </>
              )}
              {isEditing && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="gap-1">
                    <X className="h-4 w-4" /> Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSubmit(handleSave)} disabled={isSubmitting} className="gap-1 gradient-primary">
                    <Save className="h-4 w-4" /> {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              )}
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
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto">
            <TabsTrigger value="details" className="text-[10px] sm:text-xs">Detalhes</TabsTrigger>
            <TabsTrigger value="instructions" className="flex items-center gap-1 text-[10px] sm:text-xs">
              <FileText className="h-3 w-3" />
              Instruções
            </TabsTrigger>
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
            {isEditing ? (
              <form className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order_number">Número da OS</Label>
                    <Controller
                      name="order_number"
                      control={control}
                      render={({ field }) => <Input {...field} className={errors.order_number ? 'border-destructive' : ''} />}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Controller
                      name="client"
                      control={control}
                      render={({ field }) => <Input {...field} className={errors.client ? 'border-destructive' : ''} />}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">Produto</Label>
                    <Controller
                      name="product"
                      control={control}
                      render={({ field }) => <Input {...field} className={errors.product ? 'border-destructive' : ''} />}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Controller
                      name="quantity"
                      control={control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <Input 
                          {...field} 
                          type="number" 
                          value={value}
                          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                          className={errors.quantity ? 'border-destructive' : ''} 
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="urgent">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gravure_color">Cor da Gravação</Label>
                    <Controller
                      name="gravure_color"
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => <Textarea {...field} rows={3} />}
                  />
                </div>
              </form>
            ) : (
              <>
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
              </>
            )}
          </TabsContent>

          <TabsContent value="instructions">
            <JobInstructionsTab techniqueId={job.technique_id} productCategoryId={job.product_category_id} />
          </TabsContent>

          <TabsContent value="quality">
            <JobQualityTab jobId={job.id} techniqueId={job.technique_id} machineId={job.machine_id} />
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
  const { exportAuditTrail } = useDataExport('jobs' as any);

  const handleExport = useCallback((format: 'csv' | 'pdf') => {
    exportAuditTrail({
      entityType: 'jobs',
      entityId: jobId,
      fromDate: period.fromDate,
      toDate: period.toDate,
    }, `auditoria_job_${jobId.slice(0, 8)}`, format);
  }, [jobId, period, exportAuditTrail]);

  return (
    <div className="mt-4">
      <HistoryPeriodFilter 
        value={period} 
        onChange={setPeriod} 
        onExport={handleExport}
        resultCount={data?.length} 
      />
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
