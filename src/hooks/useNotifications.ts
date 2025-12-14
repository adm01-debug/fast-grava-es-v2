import { useEffect, useCallback } from 'react';
import { useJobs, useTechniques } from './useJobs';
import { toast } from 'sonner';
import { createAppError } from '@/lib/errorHandling';
import { navigateTo } from '@/lib/navigation';

const NOTIFICATIONS_ERROR_CONTEXT = {
  delayedCheck: { entity: 'notifications', operation: 'check_delayed' },
  bufferCheck: { entity: 'notifications', operation: 'check_buffer' },
};

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
  const { data: techniques } = useTechniques();
  const settings = { ...defaultConfig, ...config };

  const checkDelayedJobs = useCallback(() => {
    try {
      if (!jobs || !settings.enableDelayedAlerts) return;

      const delayedJobs = jobs.filter(job => job.status === 'delayed');
      
      if (delayedJobs.length > 0) {
        toast.error(`${delayedJobs.length} job(s) atrasado(s)`, {
          description: delayedJobs.slice(0, 3).map(j => j.client).join(', '),
          action: {
            label: 'Ver Alertas',
            onClick: () => navigateTo('/alerts'),
          },
        });
      }
    } catch (error) {
      const appError = createAppError(error, NOTIFICATIONS_ERROR_CONTEXT.delayedCheck);
      if (import.meta.env.DEV) console.error('[checkDelayedJobs]', appError);
    }
  }, [jobs, settings.enableDelayedAlerts]);

  const checkReadyJobs = useCallback(() => {
    try {
      if (!jobs || !techniques || !settings.enableReadyAlerts) return;

      const readyJobs = jobs.filter(job => job.status === 'ready');
      const activeJobs = jobs.filter(job => !['finished', 'cancelled'].includes(job.status));
      
      // Get all unique techniques that have active jobs (need buffer monitoring)
      const techniquesWithActiveJobs = new Set(activeJobs.map(job => job.technique_id));
      
      // Count ready jobs per technique
      const techniqueReadyCounts = readyJobs.reduce((acc, job) => {
        acc[job.technique_id] = (acc[job.technique_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Check ALL techniques that have active work - not just those with ready jobs
      techniquesWithActiveJobs.forEach(techniqueId => {
        const count = techniqueReadyCounts[techniqueId] || 0;
        if (count < 3) {
          // Get technique name for readable notification
          const technique = techniques.find(t => t.id === techniqueId);
          const techniqueName = technique?.name || technique?.short_name || techniqueId;
          
          toast.warning(`Buffer baixo: ${techniqueName}`, {
            description: `Apenas ${count} job(s) no jeito. Meta: 3`,
          });
        }
      });
    } catch (error) {
      const appError = createAppError(error, NOTIFICATIONS_ERROR_CONTEXT.bufferCheck);
      if (import.meta.env.DEV) console.error('[checkReadyJobs]', appError);
    }
  }, [jobs, techniques, settings.enableReadyAlerts]);

  // Initial check on mount for both delayed and ready jobs
  useEffect(() => {
    const timeout = setTimeout(() => {
      checkDelayedJobs();
      checkReadyJobs();
    }, 2000); // Delay initial check

    return () => clearTimeout(timeout);
  }, [checkDelayedJobs, checkReadyJobs]);

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
