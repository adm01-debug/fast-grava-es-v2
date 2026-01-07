import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, BellOff, Check, CheckCheck, Trash2, 
  Settings, Filter, MoreVertical, X, Circle
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// #50 - Sistema de Notificações Avançado

type NotificationType = 'info' | 'success' | 'warning' | 'error';
type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  icon?: React.ReactNode;
  category?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onAction?: (notification: Notification) => void;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onAction
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const getTypeColor = (type: NotificationType) => {
    const colors = {
      info: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500'
    };
    return colors[type];
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notificações</h4>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            >
              <Filter className="h-4 w-4 mr-1" />
              {filter === 'all' ? 'Todas' : 'Não lidas'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onMarkAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marcar todas como lidas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onClearAll} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar todas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Notifications list */}
        <ScrollArea className="h-[400px]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BellOff className="h-12 w-12 mb-2" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 hover:bg-muted/50 transition-colors cursor-pointer',
                    !notification.read && 'bg-muted/30'
                  )}
                  onClick={() => {
                    if (!notification.read) onMarkAsRead(notification.id);
                    if (onAction) onAction(notification);
                  }}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      'h-2 w-2 rounded-full mt-2 shrink-0',
                      getTypeColor(notification.type)
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          'text-sm',
                          !notification.read && 'font-medium'
                        )}>
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        {notification.category && (
                          <Badge variant="outline" className="text-xs">
                            {notification.category}
                          </Badge>
                        )}
                      </div>
                      {notification.actionLabel && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onAction) onAction(notification);
                          }}
                        >
                          {notification.actionLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// Time ago formatter
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Agora mesmo';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min atrás`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d atrás`;
  return date.toLocaleDateString();
}

// Notification item standalone
export function NotificationItem({
  notification,
  onRead,
  onDelete,
  onClick
}: {
  notification: Notification;
  onRead?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}) {
  const typeColors = {
    info: 'border-l-blue-500',
    success: 'border-l-green-500',
    warning: 'border-l-yellow-500',
    error: 'border-l-red-500'
  };

  return (
    <div
      className={cn(
        'p-4 border-l-4 rounded-r-lg bg-card transition-colors cursor-pointer',
        typeColors[notification.type],
        !notification.read && 'bg-muted/50'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-medium text-sm">{notification.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatTimeAgo(notification.timestamp)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!notification.read && onRead && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
              e.stopPropagation();
              onRead();
            }}>
              <Check className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for notification management
export function useNotifications(initialNotifications: Notification[] = []) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const addNotification = useCallback((
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };
}
