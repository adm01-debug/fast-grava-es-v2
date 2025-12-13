import { AlertTriangle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useJobs } from '@/hooks/useJobs';
import { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Alert {
  id: string;
  type: 'delayed' | 'conflict' | 'warning';
  title: string;
  description: string;
  time: Date;
  jobId?: string;
  canSchedule?: boolean;
}

export function AlertsWidget() {
  const { data: jobs = [], refetch } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate alerts from real job data
  const alerts = useMemo(() => {
    const alertList: Alert[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Urgent jobs without scheduling (highest priority)
    jobs.filter(job => 
      job.priority === 'urgent' && 
      !job.scheduled_date && 
      !['finished', 'cancelled'].includes(job.status)
    ).forEach(job => {
      alertList.push({
        id: `urgent-${job.id}`,
        type: 'conflict',
        title: 'Urgente Sem Agendamento',
        description: `${job.order_number} (${job.client}) precisa ser agendado`,
        time: job.created_at ? new Date(job.created_at) : now,
        jobId: job.id,
        canSchedule: true,
      });
    });

    // Delayed jobs
    jobs.filter(job => job.status === 'delayed').forEach(job => {
      alertList.push({
        id: `delayed-${job.id}`,
        type: 'delayed',
        title: 'Job Atrasado',
        description: `${job.order_number} ultrapassou o prazo previsto`,
        time: job.updated_at ? new Date(job.updated_at) : now,
      });
    });

    // Overdue jobs (past scheduled date)
    jobs.filter(job => {
      if (!job.scheduled_date) return false;
      const jobDate = new Date(job.scheduled_date);
      return jobDate < today && !['finished', 'cancelled'].includes(job.status);
    }).forEach(job => {
      alertList.push({
        id: `overdue-${job.id}`,
        type: 'conflict',
        title: 'Job Vencido',
        description: `${job.order_number} passou da data agendada`,
        time: job.scheduled_date ? new Date(job.scheduled_date) : now,
      });
    });

    jobs.filter(job => 
      job.priority === 'high' && 
      !job.scheduled_date && 
      !['finished', 'cancelled'].includes(job.status)
    ).forEach(job => {
      alertList.push({
        id: `high-priority-${job.id}`,
        type: 'warning',
        title: 'Alta Prioridade Sem Data',
        description: `${job.order_number} aguarda agendamento`,
        time: job.created_at ? new Date(job.created_at) : now,
        jobId: job.id,
        canSchedule: true,
      });
    });

    // Low buffer warning - check techniques with few ready jobs
    const techniqueReadyCounts: Record<string, number> = {};
    jobs.filter(job => job.status === 'ready').forEach(job => {
      techniqueReadyCounts[job.technique_id] = (techniqueReadyCounts[job.technique_id] || 0) + 1;
    });

    Object.entries(techniqueReadyCounts).forEach(([techniqueId, count]) => {
      if (count < 3) {
        alertList.push({
          id: `buffer-${techniqueId}`,
          type: 'warning',
          title: 'Buffer Baixo',
          description: `Técnica ${techniqueId} com apenas ${count} job(s) prontos`,
          time: now,
        });
      }
    });

    return alertList.slice(0, 6); // Show max 6 alerts
  }, [jobs]);

  const selectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    return jobs.find(j => j.id === selectedJobId) || null;
  }, [selectedJobId, jobs]);

  // Detect conflicts for the selected date/time
  const conflicts = useMemo(() => {
    if (!selectedJob || !scheduleDate || !startTime) return [];
    
    const selectedStartMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const selectedEndMinutes = selectedStartMinutes + selectedJob.estimated_duration;

    return jobs.filter(job => {
      // Skip the job being scheduled and non-scheduled jobs
      if (job.id === selectedJobId) return false;
      if (job.scheduled_date !== scheduleDate) return false;
      if (['finished', 'cancelled'].includes(job.status)) return false;
      
      // Check if same technique (potential resource conflict)
      if (job.technique_id !== selectedJob.technique_id) return false;
      
      // Check time overlap
      if (!job.start_time) return false;
      const jobStartMinutes = parseInt(job.start_time.split(':')[0]) * 60 + parseInt(job.start_time.split(':')[1]);
      const jobEndMinutes = jobStartMinutes + job.estimated_duration;
      
      // Check if times overlap
      return (selectedStartMinutes < jobEndMinutes && selectedEndMinutes > jobStartMinutes);
    });
  }, [selectedJob, scheduleDate, startTime, jobs, selectedJobId]);

  const handleAlertClick = (alert: Alert) => {
    if (alert.canSchedule && alert.jobId) {
      setSelectedJobId(alert.jobId);
      setScheduleDate(format(new Date(), 'yyyy-MM-dd'));
      setStartTime('08:00');
      setIsScheduleModalOpen(true);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!selectedJobId || !scheduleDate) {
      toast.error('Selecione uma data');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          scheduled_date: scheduleDate,
          start_time: startTime,
          status: 'scheduled',
        })
        .eq('id', selectedJobId);

      if (error) throw error;

      toast.success('Job agendado com sucesso!');
      setIsScheduleModalOpen(false);
      setSelectedJobId(null);
      refetch();
    } catch (error) {
      console.error('Error scheduling job:', error);
      toast.error('Erro ao agendar job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const alertIcons = {
    delayed: AlertTriangle,
    conflict: AlertCircle,
    warning: Clock,
  };

  const alertColors = {
    delayed: 'text-status-delayed bg-status-delayed/10',
    conflict: 'text-destructive bg-destructive/10',
    warning: 'text-status-ready bg-status-ready/10',
  };

  return (
    <>
      <Card className="glass-card card-interactive animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:0.15s]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-status-delayed/20 flex items-center justify-center animate-glow-pulse">
              <AlertTriangle className="w-4 h-4 text-status-delayed" />
            </div>
            <span className="gradient-text">Alertas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum alerta no momento</p>
          ) : (
            alerts.map((alert) => {
              const Icon = alertIcons[alert.type];
              
              return (
                <div 
                  key={alert.id}
                  onClick={() => handleAlertClick(alert)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-all cursor-pointer border border-border/20",
                    "hover:-translate-x-1 hover:border-primary/30",
                    alert.canSchedule && "group"
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    alertColors[alert.type]
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(alert.time, { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  {alert.canSchedule && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Agendar Job
            </DialogTitle>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-4">
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="font-medium">{selectedJob.order_number}</p>
                <p className="text-sm text-muted-foreground">{selectedJob.client} - {selectedJob.product}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedJob.quantity} peças • {selectedJob.estimated_duration} min estimados
                </p>
              </div>
              
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-date">Data</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="start-time">Horário de Início</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    min="07:00"
                    max="20:00"
                  />
                </div>
              </div>

              {/* Conflict warnings */}
              {conflicts.length > 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium text-sm">
                      {conflicts.length} conflito{conflicts.length > 1 ? 's' : ''} detectado{conflicts.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {conflicts.map(conflict => (
                      <div key={conflict.id} className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{conflict.order_number}</span>
                        {' - '}{conflict.client}
                        {conflict.start_time && (
                          <span className="text-destructive/80">
                            {' '}({conflict.start_time} - {
                              (() => {
                                const [h, m] = conflict.start_time.split(':').map(Number);
                                const endMin = h * 60 + m + conflict.estimated_duration;
                                return `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`
                              })()
                            })
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleScheduleSubmit} 
              disabled={isSubmitting}
              variant={conflicts.length > 0 ? "destructive" : "default"}
            >
              {isSubmitting ? 'Agendando...' : conflicts.length > 0 ? 'Agendar Mesmo Assim' : 'Agendar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
