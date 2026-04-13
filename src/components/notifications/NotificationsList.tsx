import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Wrench, Brain, Calendar, AlertTriangle, CheckCircle, Clock, BellOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface NotificationItem {
  id: string;
  type: 'maintenance' | 'prediction' | 'summary';
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  isRead?: boolean;
  isResolved?: boolean;
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case 'warning': return <Clock className="h-4 w-4 text-warning" />;
    case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
    default: return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'maintenance': return <Wrench className="h-4 w-4" />;
    case 'prediction': return <Brain className="h-4 w-4" />;
    case 'summary': return <Calendar className="h-4 w-4" />;
    default: return <Bell className="h-4 w-4" />;
  }
}

interface NotificationsListProps {
  notifications: NotificationItem[];
  isLoading: boolean;
}

export function NotificationsList({ notifications, isLoading }: NotificationsListProps) {
  return (
    <ScrollArea className="h-[500px]">
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <BellOff className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">Nenhuma notificação encontrada</p>
          <p className="text-sm">Tente ajustar os filtros ou período</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notification => (
            <div key={notification.id} className={cn(
              "flex items-start gap-4 p-4 rounded-lg border transition-colors",
              notification.severity === 'critical' && "border-destructive/30 bg-destructive/5",
              notification.severity === 'warning' && "border-warning/30 bg-warning/5",
              notification.severity === 'success' && "border-green-500/30 bg-green-500/5",
              notification.isResolved && "opacity-60"
            )}>
              <div className="flex-shrink-0 mt-0.5">{getSeverityIcon(notification.severity)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{notification.title}</span>
                  <Badge variant="outline" className="gap-1 text-xs">
                    {getTypeIcon(notification.type)}
                    {notification.type === 'maintenance' ? 'Manutenção' : notification.type === 'prediction' ? 'ML' : 'Resumo'}
                  </Badge>
                  {notification.isResolved && <Badge variant="secondary" className="text-xs"><CheckCircle className="h-3 w-3 mr-1" />Resolvido</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: ptBR })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}
