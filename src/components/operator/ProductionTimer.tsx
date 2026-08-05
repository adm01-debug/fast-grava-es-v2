import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Timer, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DbJob } from '@/features/jobs';

interface ProductionTimerProps {
  job: DbJob;
  compact?: boolean;
}

export function ProductionTimer({ job, compact = false }: ProductionTimerProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timerData = useMemo(() => {
    if (!job.actual_start_time) return null;

    const start = new Date(job.actual_start_time);
    const elapsedMs = now.getTime() - start.getTime();
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const estimatedSeconds = job.estimated_duration * 60;
    const remainingSeconds = estimatedSeconds - elapsedSeconds;
    const progress = estimatedSeconds > 0 ? Math.min(100, (elapsedSeconds / estimatedSeconds) * 100) : 0;

    let status: 'good' | 'warning' | 'critical' = 'good';
    if (progress >= 100) status = 'critical';
    else if (progress >= 75) status = 'warning';

    return { elapsedSeconds, estimatedSeconds, remainingSeconds, progress, status };
  }, [job.actual_start_time, job.estimated_duration, now]);

  if (!timerData) return null;

  const formatTime = (totalSeconds: number) => {
    const abs = Math.abs(totalSeconds);
    const h = Math.floor(abs / 3600);
    const m = Math.floor((abs % 3600) / 60);
    const s = abs % 60;
    const sign = totalSeconds < 0 ? '-' : '';
    return h > 0
      ? `${sign}${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${sign}${m}:${String(s).padStart(2, '0')}`;
  };

  const statusColors = {
    good: 'text-success',
    warning: 'text-warning',
    critical: 'text-destructive',
  };

  const bgColors = {
    good: 'from-success/10 to-success/5 border-success/30',
    warning: 'from-warning/10 to-warning/5 border-warning/30',
    critical: 'from-destructive/10 to-destructive/5 border-destructive/30',
  };

  const barColors = {
    good: 'bg-success',
    warning: 'bg-warning',
    critical: 'bg-destructive',
  };

  const StatusIcon = timerData.status === 'critical' ? AlertTriangle : timerData.status === 'warning' ? Timer : CheckCircle2;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg border', bgColors[timerData.status])}>
        <StatusIcon className={cn('h-4 w-4', statusColors[timerData.status])} />
        <span className={cn('font-mono text-sm font-bold', statusColors[timerData.status])}>
          {formatTime(timerData.elapsedSeconds)}
        </span>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs text-muted-foreground">
          {formatTime(timerData.estimatedSeconds)}
        </span>
      </div>
    );
  }

  return (
    <Card className={cn('border bg-gradient-to-br overflow-hidden', bgColors[timerData.status])}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className={cn('h-5 w-5', statusColors[timerData.status])} />
            <span className="text-sm font-medium">Tempo de Produção</span>
          </div>
          <StatusIcon className={cn('h-5 w-5', statusColors[timerData.status])} />
        </div>

        {/* Big timer display */}
        <div className="text-center py-3">
          <div className={cn('font-mono text-4xl font-bold tracking-wider', statusColors[timerData.status])}>
            {formatTime(timerData.elapsedSeconds)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Estimado: {formatTime(timerData.estimatedSeconds)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden mt-2">
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full transition-all duration-1000',
              barColors[timerData.status],
            )}
            style={{ width: `${Math.min(100, timerData.progress)}%` }}
          />
          {timerData.progress > 100 && (
            <div className="absolute inset-0 bg-destructive/20 animate-pulse rounded-full" />
          )}
        </div>

        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{Math.round(timerData.progress)}% concluído</span>
          <span className={cn(timerData.remainingSeconds < 0 && 'text-destructive font-medium')}>
            {timerData.remainingSeconds > 0
              ? `${formatTime(timerData.remainingSeconds)} restantes`
              : `${formatTime(Math.abs(timerData.remainingSeconds))} excedido`
            }
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
