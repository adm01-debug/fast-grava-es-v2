import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, CheckCircle2, Pause, AlertTriangle, Clock, 
  ArrowRight, Zap, Package
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedEvent {
  id: string;
  type: 'started' | 'finished' | 'paused' | 'delayed' | 'scheduled' | 'status_change';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    jobId?: string;
    orderNumber?: string;
    machine?: string;
    oldStatus?: string;
    newStatus?: string;
  };
}

const statusIcons: Record<string, { icon: typeof Play; color: string }> = {
  started: { icon: Play, color: 'text-cyan-400' },
  finished: { icon: CheckCircle2, color: 'text-green-400' },
  paused: { icon: Pause, color: 'text-orange-400' },
  delayed: { icon: AlertTriangle, color: 'text-red-400' },
  scheduled: { icon: Clock, color: 'text-blue-400' },
  status_change: { icon: ArrowRight, color: 'text-purple-400' },
};

const statusLabels: Record<string, string> = {
  queue: 'Na Fila', ready: 'No Jeito', scheduled: 'Agendado',
  production: 'Em Produção', finished: 'Finalizado', paused: 'Pausado',
  cancelled: 'Cancelado', delayed: 'Atrasado', rework: 'Retrabalho',
};

export function ActivityFeedWidget() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const eventsRef = useRef<FeedEvent[]>([]);

  useEffect(() => {
    // Listen to real-time job changes
    const channel = supabase
      .channel('activity-feed')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'jobs',
      }, (payload) => {
        const newJob = payload.new as Record<string, unknown>;
        const oldJob = payload.old as Record<string, unknown>;
        
        if (oldJob.status !== newJob.status) {
          const newStatus = newJob.status as string;
          let type: FeedEvent['type'] = 'status_change';
          if (newStatus === 'production') type = 'started';
          else if (newStatus === 'finished') type = 'finished';
          else if (newStatus === 'paused') type = 'paused';
          else if (newStatus === 'delayed') type = 'delayed';
          else if (newStatus === 'scheduled') type = 'scheduled';

          const event: FeedEvent = {
            id: crypto.randomUUID(),
            type,
            title: `${newJob.order_number || 'Job'} - ${newJob.client}`,
            description: `${statusLabels[oldJob.status as string] || oldJob.status} → ${statusLabels[newStatus] || newStatus}`,
            timestamp: new Date().toISOString(),
            metadata: {
              jobId: newJob.id as string,
              orderNumber: newJob.order_number as string,
              oldStatus: oldJob.status as string,
              newStatus,
            },
          };

          eventsRef.current = [event, ...eventsRef.current].slice(0, 50);
          setEvents([...eventsRef.current]);
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'jobs',
      }, (payload) => {
        const job = payload.new as Record<string, unknown>;
        const event: FeedEvent = {
          id: crypto.randomUUID(),
          type: 'scheduled',
          title: `Novo Job: ${job.order_number}`,
          description: `${job.client} - ${job.product}`,
          timestamp: new Date().toISOString(),
          metadata: { jobId: job.id as string, orderNumber: job.order_number as string },
        };
        eventsRef.current = [event, ...eventsRef.current].slice(0, 50);
        setEvents([...eventsRef.current]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Feed em Tempo Real
          {events.length > 0 && (
            <Badge variant="secondary" className="text-xs ml-auto">
              {events.length} eventos
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
              <Package className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Aguardando atividades...</p>
              <p className="text-xs opacity-70">Mudanças aparecerão aqui em tempo real</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              <div className="space-y-2">
                {events.map((event) => {
                  const { icon: Icon, color } = statusIcons[event.type] || statusIcons.status_change;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`mt-0.5 ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true, locale: ptBR })}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
