import { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Wand2, Clock, Building2 } from 'lucide-react';
import { format, parse, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SchedulingConflict, ConflictingJob } from '@/hooks/useSchedulingConflicts';

interface ConflictResolutionPanelProps {
  conflicts: SchedulingConflict[];
  onResolved?: () => void;
}

const priorityWeight: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const statusWeight: Record<string, number> = {
  production: 5,
  scheduled: 3,
  ready: 2,
  queue: 1,
};

/**
 * Picks the job that should be shifted (lowest priority + lowest status weight).
 */
function pickShiftCandidate(jobs: ConflictingJob[], jobMetaMap: Map<string, { priority?: string }>) {
  return [...jobs].sort((a, b) => {
    const pa = priorityWeight[jobMetaMap.get(a.id)?.priority || 'medium'] || 2;
    const pb = priorityWeight[jobMetaMap.get(b.id)?.priority || 'medium'] || 2;
    if (pa !== pb) return pa - pb;
    const sa = statusWeight[a.status] || 0;
    const sb = statusWeight[b.status] || 0;
    return sa - sb;
  })[0];
}

export function ConflictResolutionPanel({ conflicts, onResolved }: ConflictResolutionPanelProps) {
  const [open, setOpen] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const summary = useMemo(() => {
    const errorCount = conflicts.filter((c) => c.severity === 'error').length;
    const warningCount = conflicts.length - errorCount;
    const totalJobs = conflicts.reduce((sum, c) => sum + c.jobs.length, 0);
    return { errorCount, warningCount, totalJobs };
  }, [conflicts]);

  if (!conflicts.length) return null;

  const handleAutoShift = async (conflict: SchedulingConflict) => {
    setResolvingId(conflict.id);
    try {
      // Fetch full job records to access priority
      const ids = conflict.jobs.map((j) => j.id);
      const { data: fullJobs, error } = await supabase
        .from('jobs')
        .select('id, priority, end_time')
        .in('id', ids);
      if (error) throw error;

      const metaMap = new Map(fullJobs?.map((j) => [j.id, { priority: j.priority }]) || []);
      const candidate = pickShiftCandidate(conflict.jobs, metaMap);

      // Find the job that ends latest among the others to shift after it
      const others = conflict.jobs.filter((j) => j.id !== candidate.id);
      const latestEnd = others
        .map((j) => parse(j.endTime, 'HH:mm', conflict.date))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      const candStart = parse(candidate.startTime, 'HH:mm', conflict.date);
      const candEnd = parse(candidate.endTime, 'HH:mm', conflict.date);
      const durationMin = Math.max(0, (candEnd.getTime() - candStart.getTime()) / 60000);
      const newStart = addMinutes(latestEnd, 5);
      const newEnd = addMinutes(newStart, durationMin);

      const { error: upErr } = await supabase
        .from('jobs')
        .update({
          start_time: format(newStart, 'HH:mm'),
          end_time: format(newEnd, 'HH:mm'),
          updated_at: new Date().toISOString(),
        })
        .eq('id', candidate.id);
      if (upErr) throw upErr;

      toast.success('Conflito resolvido', {
        description: `Job ${candidate.orderNumber} reagendado para ${format(newStart, 'HH:mm')}.`,
      });
      onResolved?.();
    } catch (e) {
      if (import.meta.env.DEV) console.error(e);
      toast.error('Falha ao resolver conflito automaticamente');
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Conflitos detectados
              <Badge variant="destructive" className="ml-1">{conflicts.length}</Badge>
              {summary.errorCount > 0 && (
                <Badge variant="outline" className="border-destructive/50 text-destructive">
                  {summary.errorCount} críticos
                </Badge>
              )}
              {summary.warningCount > 0 && (
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                  {summary.warningCount} aviso{summary.warningCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className="rounded-lg border border-border/40 bg-card/60 p-3 space-y-2"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{conflict.machineCode}</span>
                    <span className="text-muted-foreground">{conflict.machineName}</span>
                    <Badge
                      variant={conflict.severity === 'error' ? 'destructive' : 'outline'}
                      className="text-xs"
                    >
                      {format(conflict.date, "dd MMM", { locale: ptBR })}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    className="gap-1.5"
                    disabled={resolvingId === conflict.id}
                    onClick={() => handleAutoShift(conflict)}
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    {resolvingId === conflict.id ? 'Resolvendo…' : 'Resolver automaticamente'}
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {conflict.jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between rounded-md border border-border/30 bg-background/50 px-2.5 py-1.5 text-xs"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{job.orderNumber}</span>
                        <span className="text-muted-foreground truncate">{job.client}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground shrink-0 ml-2">
                        <Clock className="h-3 w-3" />
                        <span>{job.startTime}–{job.endTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
