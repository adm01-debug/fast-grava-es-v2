import { Bell, Check, CheckCheck, Trash2, Sparkles, BrainCircuit, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const typeColors: Record<string, string> = {
  info: 'bg-blue-500', success: 'bg-green-500', warning: 'bg-yellow-500', error: 'bg-red-500', urgent: 'bg-red-600',
};

export function NotificationCenter() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          <Button variant="ghost" size="sm" onClick={() => markAllAsRead()} disabled={unreadCount === 0}><CheckCheck className="h-4 w-4" /></Button>
        </div>
        <ScrollArea className="h-[400px]">
          {isLoading ? (<div className="p-4 text-center text-muted-foreground">Carregando...</div>) 
          : notifications.length === 0 ? (<div className="p-8 text-center text-muted-foreground"><Bell className="h-12 w-12 mx-auto mb-2 opacity-20" /><p>Nenhuma notificação</p></div>) 
          : (<div className="divide-y">{notifications.map((n) => (
            <div key={n.id} className={cn("p-4 hover:bg-accent cursor-pointer transition-colors", !n.is_read && "bg-accent/50")}
              onClick={() => { markAsRead(n.id); if (n.action_url) window.location.href = n.action_url; }}>
              <div className="flex items-start gap-3">
                <div className={cn("w-2 h-2 rounded-full mt-2", typeColors[n.type] || 'bg-gray-500')} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm", !n.is_read && "font-semibold")}>{n.title}</p>
                    {n.is_grouped && n.group_count > 1 && <Badge variant="secondary" className="text-xs">{n.group_count}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
                  <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}</p>
                </div>
                <div className="flex gap-1">
                  {!n.is_read && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}><Check className="h-3 w-3" /></Button>}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </div>
          ))}</div>)}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
