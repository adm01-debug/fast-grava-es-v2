import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
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
  QrCode
} from "lucide-react";
import { Job } from "@/types/scheduling";
import { getTechniqueById, getMachineById, getOperatorById } from "@/data/mockData";
import { JobQRCode } from "@/components/qrcode/JobQRCode";

interface JobDetailsModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (jobId: string, newStatus: Job['status']) => void;
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
  if (!job) return null;

  const technique = getTechniqueById(job.techniqueId);
  const machine = getMachineById(job.machineId);
  const operator = getOperatorById(job.operatorId);

  const InfoRow = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) => (
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
              {job.orderNumber}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${priorityColors[job.priority]} border`}>
                {priorityLabels[job.priority]}
              </Badge>
              <StatusBadge status={job.status} />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
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
                value={job.gravureColor}
                color="bg-purple-500/20"
              />
              <InfoRow 
                icon={Clock} 
                label="Duração Estimada" 
                value={`${job.estimatedDuration} minutos`}
                color="bg-orange-500/20"
              />
            </div>

            <div className="space-y-1 p-4 rounded-xl bg-muted/20 border border-border/30">
              <InfoRow 
                icon={Calendar} 
                label="Data Agendada" 
                value={new Date(job.scheduledDate).toLocaleDateString('pt-BR')}
                color="bg-cyan-500/20"
              />
              <InfoRow 
                icon={Clock} 
                label="Horário" 
                value={`${job.startTime} - ${job.endTime}`}
                color="bg-yellow-500/20"
              />
              <InfoRow 
                icon={User} 
                label="Operador" 
                value={operator?.name || 'Não atribuído'}
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
                {technique?.name}
              </Badge>
            </div>
            <div className="flex-1 p-4 rounded-xl bg-muted/20 border border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Máquina</p>
              <p className="text-sm font-medium text-foreground">
                {machine?.code} - {machine?.name}
              </p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex justify-center">
            <JobQRCode 
              jobId={job.id}
              orderNumber={job.orderNumber}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
