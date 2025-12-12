import { AlertTriangle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockJobs } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Alert {
  id: string;
  type: 'delayed' | 'conflict' | 'warning';
  title: string;
  description: string;
  time: Date;
}

const alerts: Alert[] = [
  {
    id: '1',
    type: 'delayed',
    title: 'Job Atrasado',
    description: 'OS-2024-0008 ultrapassou o prazo previsto em 45 min',
    time: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: '2',
    type: 'conflict',
    title: 'Conflito de Horário',
    description: 'Máquina ST02 com sobreposição às 14:00',
    time: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: '3',
    type: 'warning',
    title: 'Baixa Ocupação',
    description: 'Laser CO2 com apenas 23% de ocupação hoje',
    time: new Date(Date.now() - 1000 * 60 * 120),
  },
];

export function AlertsWidget() {
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
        {alerts.map((alert, index) => {
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
        })}
      </CardContent>
    </Card>
  );
}
