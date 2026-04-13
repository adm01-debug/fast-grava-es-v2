import { Badge } from '@/components/ui/badge';
import { Bell, Wrench, Brain, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface NotificationItem {
  id: string;
  type: 'maintenance' | 'prediction' | 'summary';
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  isRead?: boolean;
  isResolved?: boolean;
  metadata?: Record<string, unknown>;
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

export function NotificationCard({ notification }: { notification: NotificationItem }) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border transition-colors",
        notification.severity === 'critical' && "border-destructive/30 bg-destructive/5",
        notification.severity === 'warning' && "border-warning/30 bg-warning/5",
        notification.severity === 'success' && "border-green-500/30 bg-green-500/5",
        notification.isResolved && "opacity-60"
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getSeverityIcon(notification.severity)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">{notification.title}</span>
          <Badge variant="outline" className="gap-1 text-xs">
            {getTypeIcon(notification.type)}
            {notification.type === 'maintenance' ? 'Manutenção' : notification.type === 'prediction' ? 'ML' : 'Resumo'}
          </Badge>
          {notification.isResolved && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Resolvido
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: ptBR })}
        </p>
      </div>
    </div>
  );
}
