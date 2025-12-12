import { useEffect, useCallback } from 'react';
import { useJobs } from './useJobs';
import { toast } from 'sonner';

interface NotificationConfig {
  enableDelayedAlerts: boolean;
  enableReadyAlerts: boolean;
  enableStatusChanges: boolean;
  checkIntervalMs: number;
}

const defaultConfig: NotificationConfig = {
  enableDelayedAlerts: true,
  enableReadyAlerts: true,
  enableStatusChanges: true,
  checkIntervalMs: 60000, // 1 minute
};

export function useNotifications(config: Partial<NotificationConfig> = {}) {
  const { data: jobs } = useJobs();
  const settings = { ...defaultConfig, ...config };

  const checkDelayedJobs = useCallback(() => {
    if (!jobs || !settings.enableDelayedAlerts) return;

    const delayedJobs = jobs.filter(job => job.status === 'delayed');
    
    if (delayedJobs.length > 0) {
      toast.error(`${delayedJobs.length} job(s) atrasado(s)`, {
        description: delayedJobs.slice(0, 3).map(j => j.client).join(', '),
        action: {
          label: 'Ver Alertas',
          onClick: () => window.location.href = '/alerts',
        },
      });
    }
  }, [jobs, settings.enableDelayedAlerts]);

  const checkReadyJobs = useCallback(() => {
    if (!jobs || !settings.enableReadyAlerts) return;

    const readyJobs = jobs.filter(job => job.status === 'ready');
    
    // Alert if there are jobs ready but buffer is low for any technique
    const techniqueReadyCounts = readyJobs.reduce((acc, job) => {
      acc[job.technique_id] = (acc[job.technique_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(techniqueReadyCounts).forEach(([techniqueId, count]) => {
      if (count < 3) {
        toast.warning(`Buffer baixo para ${techniqueId}`, {
          description: `Apenas ${count} job(s) no jeito. Meta: 3`,
        });
      }
    });
  }, [jobs, settings.enableReadyAlerts]);

  // Initial check on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      checkDelayedJobs();
    }, 2000); // Delay initial check

    return () => clearTimeout(timeout);
  }, [checkDelayedJobs]);

  // Periodic checks
  useEffect(() => {
    const interval = setInterval(() => {
      checkDelayedJobs();
      checkReadyJobs();
    }, settings.checkIntervalMs);

    return () => clearInterval(interval);
  }, [checkDelayedJobs, checkReadyJobs, settings.checkIntervalMs]);

  return {
    checkDelayedJobs,
    checkReadyJobs,
  };
}

// Helper to show status change notification
export function notifyStatusChange(
  jobClient: string, 
  oldStatus: string, 
  newStatus: string
) {
  const statusLabels: Record<string, string> = {
    queue: 'Na Fila',
    ready: 'No Jeito',
    scheduled: 'Agendado',
    production: 'Em Produção',
    finished: 'Finalizado',
    paused: 'Pausado',
    delayed: 'Atrasado',
    rework: 'Retrabalho',
  };

  const newLabel = statusLabels[newStatus] || newStatus;

  if (newStatus === 'finished') {
    toast.success(`Job finalizado: ${jobClient}`, {
      description: 'Produção concluída com sucesso',
    });
  } else if (newStatus === 'delayed') {
    toast.error(`Job atrasado: ${jobClient}`, {
      description: 'Atenção necessária',
    });
  } else if (newStatus === 'production') {
    toast.info(`Produção iniciada: ${jobClient}`, {
      description: 'Job em andamento',
    });
  } else {
    toast(`Status alterado: ${jobClient}`, {
      description: `Novo status: ${newLabel}`,
    });
  }
}
