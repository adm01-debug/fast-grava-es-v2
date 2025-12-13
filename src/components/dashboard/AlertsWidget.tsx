import { AlertTriangle, Clock, AlertCircle, Calendar, Settings2, Sparkles, ListTodo, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useJobs, useMachines } from '@/hooks/useJobs';
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
  const { data: machines = [] } = useMachines();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
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

  // Filter machines by selected job's technique and calculate occupancy
  const availableMachines = useMemo(() => {
    if (!selectedJob) return [];
    return machines.filter(m => m.technique_id === selectedJob.technique_id && m.is_active);
  }, [selectedJob, machines]);

  // Calculate occupancy for each machine on selected date
  const machineOccupancy = useMemo(() => {
    if (!scheduleDate) return {};
    
    const WORK_DAY_MINUTES = 13 * 60; // 07:00 to 20:00 = 780 minutes
    const occupancy: Record<string, { occupiedMinutes: number; jobCount: number; percentage: number }> = {};
    
    availableMachines.forEach(machine => {
      const machineJobs = jobs.filter(job => 
        job.machine_id === machine.id && 
        job.scheduled_date === scheduleDate &&
        !['finished', 'cancelled'].includes(job.status)
      );
      
      const occupiedMinutes = machineJobs.reduce((total, job) => total + job.estimated_duration, 0);
      
      occupancy[machine.id] = {
        occupiedMinutes,
        jobCount: machineJobs.length,
        percentage: Math.min(100, Math.round((occupiedMinutes / WORK_DAY_MINUTES) * 100)),
      };
    });
    
    return occupancy;
  }, [availableMachines, jobs, scheduleDate]);

  // Calculate best suggestion (machine with lowest occupancy + first available time slot)
  const suggestion = useMemo(() => {
    if (!selectedJob || !scheduleDate || availableMachines.length === 0) return null;
    
    const WORK_START = 7 * 60; // 07:00
    const WORK_END = 20 * 60;  // 20:00
    const duration = selectedJob.estimated_duration;
    
    let bestMachine: string | null = null;
    let bestTime: string | null = null;
    let lowestOccupancy = Infinity;
    
    for (const machine of availableMachines) {
      // Get all jobs for this machine on the selected date
      const machineJobs = jobs
        .filter(job => 
          job.machine_id === machine.id && 
          job.scheduled_date === scheduleDate &&
          job.start_time &&
          !['finished', 'cancelled'].includes(job.status)
        )
        .map(job => {
          const [h, m] = job.start_time!.split(':').map(Number);
          const start = h * 60 + m;
          return { start, end: start + job.estimated_duration };
        })
        .sort((a, b) => a.start - b.start);
      
      // Find first available slot
      let currentTime = WORK_START;
      let foundSlot: number | null = null;
      
      for (const slot of machineJobs) {
        if (currentTime + duration <= slot.start) {
          foundSlot = currentTime;
          break;
        }
        currentTime = Math.max(currentTime, slot.end);
      }
      
      // Check if there's space after all jobs
      if (foundSlot === null && currentTime + duration <= WORK_END) {
        foundSlot = currentTime;
      }
      
      if (foundSlot !== null) {
        const occ = machineOccupancy[machine.id]?.percentage || 0;
        if (occ < lowestOccupancy) {
          lowestOccupancy = occ;
          bestMachine = machine.id;
          bestTime = `${String(Math.floor(foundSlot / 60)).padStart(2, '0')}:${String(foundSlot % 60).padStart(2, '0')}`;
        }
      }
    }
    
    if (bestMachine && bestTime) {
      const machine = availableMachines.find(m => m.id === bestMachine);
      return { machineId: bestMachine, machineName: machine?.name || '', time: bestTime, occupancy: lowestOccupancy };
    }
    
    return null;
  }, [selectedJob, scheduleDate, availableMachines, jobs, machineOccupancy]);

  const applySuggestion = () => {
    if (suggestion) {
      setSelectedMachineId(suggestion.machineId);
      setStartTime(suggestion.time);
      toast.success('Sugestão aplicada!');
    }
  };

  // Jobs scheduled for the selected machine on the selected date
  const machineScheduledJobs = useMemo(() => {
    if (!selectedMachineId || !scheduleDate) return [];
    
    return jobs
      .filter(job => 
        job.machine_id === selectedMachineId && 
        job.scheduled_date === scheduleDate &&
        !['finished', 'cancelled'].includes(job.status)
      )
      .map(job => {
        const startMinutes = job.start_time 
          ? parseInt(job.start_time.split(':')[0]) * 60 + parseInt(job.start_time.split(':')[1])
          : 0;
        const endMinutes = startMinutes + job.estimated_duration;
        const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
        
        return {
          ...job,
          endTime,
          startMinutes,
        };
      })
      .sort((a, b) => a.startMinutes - b.startMinutes);
  }, [selectedMachineId, scheduleDate, jobs]);

  // Calculate free time slots for the selected machine
  const freeSlots = useMemo(() => {
    if (!selectedMachineId || !scheduleDate) return [];
    
    const WORK_START = 7 * 60;  // 07:00
    const WORK_END = 20 * 60;   // 20:00
    const MIN_SLOT_DURATION = 15; // Minimum slot to show (15 min)
    
    const slots: { start: string; end: string; duration: number }[] = [];
    let currentTime = WORK_START;
    
    for (const job of machineScheduledJobs) {
      if (job.startMinutes > currentTime) {
        const gapDuration = job.startMinutes - currentTime;
        if (gapDuration >= MIN_SLOT_DURATION) {
          slots.push({
            start: `${String(Math.floor(currentTime / 60)).padStart(2, '0')}:${String(currentTime % 60).padStart(2, '0')}`,
            end: `${String(Math.floor(job.startMinutes / 60)).padStart(2, '0')}:${String(job.startMinutes % 60).padStart(2, '0')}`,
            duration: gapDuration,
          });
        }
      }
      currentTime = Math.max(currentTime, job.startMinutes + job.estimated_duration);
    }
    
    // Check remaining time until end of day
    if (currentTime < WORK_END) {
      const remainingDuration = WORK_END - currentTime;
      if (remainingDuration >= MIN_SLOT_DURATION) {
        slots.push({
          start: `${String(Math.floor(currentTime / 60)).padStart(2, '0')}:${String(currentTime % 60).padStart(2, '0')}`,
          end: '20:00',
          duration: remainingDuration,
        });
      }
    }
    
    // Sort by duration (largest first) for easier selection
    return slots.sort((a, b) => b.duration - a.duration);
  }, [selectedMachineId, scheduleDate, machineScheduledJobs]);

  // Detect conflicts for the selected date/time/machine
  const conflicts = useMemo(() => {
    if (!selectedJob || !scheduleDate || !startTime) return [];
    
    const selectedStartMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const selectedEndMinutes = selectedStartMinutes + selectedJob.estimated_duration;

    return jobs.filter(job => {
      // Skip the job being scheduled and non-scheduled jobs
      if (job.id === selectedJobId) return false;
      if (job.scheduled_date !== scheduleDate) return false;
      if (['finished', 'cancelled'].includes(job.status)) return false;
      
      // If machine is selected, check for same machine conflict
      if (selectedMachineId && job.machine_id !== selectedMachineId) return false;
      
      // If no machine selected, check for same technique conflict
      if (!selectedMachineId && job.technique_id !== selectedJob.technique_id) return false;
      
      // Check time overlap
      if (!job.start_time) return false;
      const jobStartMinutes = parseInt(job.start_time.split(':')[0]) * 60 + parseInt(job.start_time.split(':')[1]);
      const jobEndMinutes = jobStartMinutes + job.estimated_duration;
      
      // Check if times overlap
      return (selectedStartMinutes < jobEndMinutes && selectedEndMinutes > jobStartMinutes);
    });
  }, [selectedJob, scheduleDate, startTime, jobs, selectedJobId, selectedMachineId]);

  const handleAlertClick = (alert: Alert) => {
    if (alert.canSchedule && alert.jobId) {
      setSelectedJobId(alert.jobId);
      setScheduleDate(format(new Date(), 'yyyy-MM-dd'));
      setStartTime('08:00');
      setSelectedMachineId('');
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
          machine_id: selectedMachineId || null,
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

              {/* Suggestion card */}
              {suggestion && (
                <div 
                  onClick={applySuggestion}
                  className="p-3 bg-primary/10 border border-primary/30 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Sugestão Inteligente</span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 text-xs group-hover:bg-primary group-hover:text-primary-foreground">
                      Aplicar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium text-foreground">{suggestion.machineName}</span>
                    {' às '}<span className="font-medium text-foreground">{suggestion.time}</span>
                    {' • '}{suggestion.occupancy}% ocupação
                  </p>
                </div>
              )}
              
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

                <div className="space-y-2">
                  <Label htmlFor="machine-select">Máquina</Label>
                  <Select value={selectedMachineId} onValueChange={setSelectedMachineId}>
                    <SelectTrigger id="machine-select">
                      <SelectValue placeholder="Selecione uma máquina (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMachines.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Nenhuma máquina disponível para esta técnica
                        </div>
                      ) : (
                        availableMachines.map(machine => {
                          const occ = machineOccupancy[machine.id] || { percentage: 0, jobCount: 0, occupiedMinutes: 0 };
                          const occColor = occ.percentage >= 80 ? 'bg-destructive' : 
                                          occ.percentage >= 50 ? 'bg-status-delayed' : 
                                          'bg-status-ready';
                          
                          return (
                            <SelectItem key={machine.id} value={machine.id}>
                              <div className="flex items-center justify-between gap-3 w-full">
                                <div className="flex items-center gap-2">
                                  <Settings2 className="w-3 h-3 text-muted-foreground" />
                                  <span>{machine.code} - {machine.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                                    <div 
                                      className={cn("h-full rounded-full transition-all", occColor)}
                                      style={{ width: `${occ.percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground min-w-[3ch]">
                                    {occ.percentage}%
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Machine scheduled jobs list */}
                {selectedMachineId && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ListTodo className="w-4 h-4 text-muted-foreground" />
                      Jobs Agendados - {machines.find(m => m.id === selectedMachineId)?.code}
                    </Label>
                    {machineScheduledJobs.length === 0 ? (
                      <div className="p-3 bg-status-ready/10 border border-status-ready/30 rounded-lg text-center">
                        <p className="text-sm text-status-ready font-medium">Máquina livre nesta data</p>
                        <p className="text-xs text-muted-foreground mt-1">Nenhum job agendado</p>
                      </div>
                    ) : (
                      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                        {machineScheduledJobs.map(job => {
                          // Check if this job conflicts with selected time
                          const selectedStartMinutes = startTime 
                            ? parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])
                            : 0;
                          const selectedEndMinutes = selectedStartMinutes + (selectedJob?.estimated_duration || 0);
                          const isConflicting = startTime && 
                            selectedStartMinutes < job.startMinutes + job.estimated_duration && 
                            selectedEndMinutes > job.startMinutes;

                          return (
                            <div 
                              key={job.id}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-md text-xs transition-colors",
                                isConflicting 
                                  ? "bg-destructive/15 border border-destructive/40" 
                                  : "bg-secondary/50 border border-border/20"
                              )}
                            >
                              <Clock className={cn(
                                "w-3.5 h-3.5 shrink-0",
                                isConflicting ? "text-destructive" : "text-muted-foreground"
                              )} />
                              <span className={cn(
                                "font-mono font-medium",
                                isConflicting ? "text-destructive" : "text-foreground"
                              )}>
                                {job.start_time || '--:--'} - {job.endTime}
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className="font-medium truncate">{job.order_number}</span>
                              <span className="text-muted-foreground truncate flex-1">{job.client}</span>
                              <span className="text-muted-foreground shrink-0">{job.estimated_duration}min</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Free slots display */}
                    {freeSlots.length > 0 && (
                      <div className="mt-2 p-2 bg-status-ready/10 border border-status-ready/30 rounded-md">
                        <p className="text-xs text-status-ready font-medium mb-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Horários Livres:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {freeSlots.map((slot, idx) => {
                            const jobDuration = selectedJob?.estimated_duration || 0;
                            const fits = slot.duration >= jobDuration;
                            const isSelected = startTime === slot.start;
                            
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setStartTime(slot.start)}
                                className={cn(
                                  "px-2 py-1 text-xs font-mono rounded border transition-colors flex items-center gap-1.5",
                                  isSelected
                                    ? fits 
                                      ? "bg-status-ready text-status-ready-foreground border-status-ready"
                                      : "bg-destructive text-destructive-foreground border-destructive"
                                    : fits
                                      ? "bg-status-ready/20 text-foreground border-status-ready/40 hover:bg-status-ready/30"
                                      : "bg-destructive/10 text-muted-foreground border-destructive/30 hover:bg-destructive/20"
                                )}
                              >
                                {fits ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                                {slot.start} - {slot.end} ({slot.duration}min)
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                          <Check className="w-3 h-3 text-status-ready" /> Cabe ({selectedJob?.estimated_duration}min)
                          <span className="mx-1">•</span>
                          <X className="w-3 h-3 text-destructive" /> Não cabe
                        </p>
                      </div>
                    )}
                  </div>
                )}
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
