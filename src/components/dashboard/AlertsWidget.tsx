import { AlertTriangle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useJobs } from '@/hooks/useJobs';
import { useMemo } from 'react';

interface Alert {
  id: string;
  type: 'delayed' | 'conflict' | 'warning';
  title: string;
  description: string;
  time: Date;
}

export function AlertsWidget() {
  const { data: jobs = [] } = useJobs();

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

    // High priority jobs without scheduling
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
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-all cursor-pointer border border-border/20",
                  "hover:-translate-x-1 hover:border-primary/30"
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
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
