import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SwipeActions } from '@/components/mobile/SwipeActions';
import { DbJob } from '@/hooks/useJobs';
import { Play, AlertTriangle, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface OperatorReadyJobCardProps {
  job: DbJob;
  index: number;
  technique?: { name: string; color: string; short_name: string } | null;
  machine?: { name: string; code: string } | null;
  onStart: (job: DbJob) => void;
  onClick: (job: DbJob) => void;
}

export function OperatorReadyJobCard({ job, index, technique, machine, onStart, onClick }: OperatorReadyJobCardProps) {
  return (
    <motion.div key={job.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: index * 0.05 }}>
      <SwipeActions rightActions={[{ id: 'start', icon: <Play className="h-5 w-5" />, label: 'Iniciar', color: 'hsl(0, 0%, 100%)', bgColor: 'hsl(var(--success))', onAction: () => onStart(job) }]}>
        <Card className={cn("glass-card cursor-pointer transition-all duration-200 hover:scale-[1.02]", job.priority === 'urgent' && "border-destructive/30", job.priority === 'high' && "border-warning/30")} onClick={() => onClick(job)}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium truncate">{job.client}</p>
              {job.priority === 'urgent' && <Badge variant="destructive" className="shrink-0"><AlertTriangle className="h-3 w-3 mr-1" />Urgente</Badge>}
              {job.priority === 'high' && <Badge variant="outline" className="border-warning/50 text-warning shrink-0">Alta</Badge>}
            </div>
            <p className="text-sm text-muted-foreground truncate mb-2">{job.product}</p>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className="text-xs" style={{ borderColor: technique?.color, color: technique?.color }}>{technique?.short_name}</Badge>
              <span className="text-xs text-muted-foreground">{job.quantity.toLocaleString()} pçs</span>
              {machine && <Badge variant="secondary" className="text-xs">{machine.code}</Badge>}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3"><Timer className="h-3 w-3" />Estimado: {job.estimated_duration}min</div>
            <Button size="sm" className="w-full gradient-primary" onClick={(e) => { e.stopPropagation(); onStart(job); }}><Play className="h-4 w-4 mr-1" />Iniciar Produção</Button>
          </CardContent>
        </Card>
      </SwipeActions>
    </motion.div>
  );
}
