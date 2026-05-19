import { useMemo } from 'react';
import { DbJob } from '@/features/jobs';
import { cn } from '@/lib/utils';

interface DensityMinimapProps {
  jobs: DbJob[];
  startHour: number;
  endHour: number;
}

/**
 * Sparkline showing job density per hour (load preview).
 * Helps users spot peaks and gaps before scrolling the full timeline.
 */
export function DensityMinimap({ jobs, startHour, endHour }: DensityMinimapProps) {
  const buckets = useMemo(() => {
    const totalHours = endHour - startHour;
    const counts = new Array(totalHours).fill(0);
    jobs.forEach((job) => {
      if (!job.start_time || !job.end_time) return;
      const [sh] = job.start_time.split(':').map(Number);
      const [eh] = job.end_time.split(':').map(Number);
      const from = Math.max(sh, startHour);
      const to = Math.min(eh, endHour);
      for (let h = from; h < to; h++) {
        const idx = h - startHour;
        if (idx >= 0 && idx < counts.length) counts[idx]++;
      }
    });
    const max = Math.max(1, ...counts);
    return counts.map((c) => ({ count: c, ratio: c / max }));
  }, [jobs, startHour, endHour]);

  const totalLoad = buckets.reduce((acc, b) => acc + b.count, 0);

  return (
    <div className="flex items-end gap-px h-8 px-3 py-1 bg-muted/5 border-b border-border/40">
      <span className="text-[10px] text-muted-foreground uppercase mr-2 self-center">Carga</span>
      {buckets.map((b, i) => (
        <div
          key={i}
          title={`${(startHour + i).toString().padStart(2, '0')}:00 — ${b.count} job${b.count !== 1 ? 's' : ''}`}
          className={cn(
            'flex-1 rounded-sm transition-all',
            b.count === 0 ? 'bg-muted/20' : 'bg-primary/60 hover:bg-primary'
          )}
          style={{ height: `${Math.max(2, b.ratio * 100)}%` }}
        />
      ))}
      <span className="text-[10px] text-muted-foreground ml-2 self-center tabular-nums">
        Σ {totalLoad}
      </span>
    </div>
  );
}
