// Smart Notifications System
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BellOff, X, Check, Clock, AlertTriangle, Info, CheckCircle,
  XCircle, Volume2, VolumeX, Settings, Filter, Trash2, Archive,
  Pin, PinOff, ChevronDown, MoreHorizontal, ExternalLink, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types
type NotificationType = 'info' | 'success' | 'warning' | 'error';
type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

interface SmartNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  pinned: boolean;
  archived: boolean;
  category: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
  groupId?: string;
}

interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  showBadge: boolean;
  groupSimilar: boolean;
  autoArchiveAfterDays: number;
  mutedCategories: string[];
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

interface NotificationGroup {
  groupId: string;
  notifications: SmartNotification[];
  count: number;
  latestTimestamp: Date;
}

interface SmartNotificationsContextType {
  notifications: SmartNotification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  addNotification: (notification: Omit<SmartNotification, 'id' | 'timestamp' | 'read' | 'pinned' | 'archived'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  togglePin: (id: string) => void;
  archiveNotification: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
  getGroupedNotifications: () => NotificationGroup[];
  requestDesktopPermission: () => Promise<boolean>;
}

const SmartNotificationsContext = createContext<SmartNotificationsContextType | null>(null);

// Default preferences
const defaultPreferences: NotificationPreferences = {
  enabled: true,
  sound: true,
  desktop: false,
  showBadge: true,
  groupSimilar: true,
  autoArchiveAfterDays: 7,
  mutedCategories: [],
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00'
};

// Provider
interface SmartNotificationsProviderProps {
  children: ReactNode;
}

export function SmartNotificationsProvider({ children }: SmartNotificationsProviderProps) {
  const [notifications, setNotifications] = useLocalStorage<SmartNotification[]>(
    'smart-notifications',
    []
  );
  const [preferences, setPreferences] = useLocalStorage<NotificationPreferences>(
    'notification-preferences',
    defaultPreferences
  );

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

  // Check if in quiet hours
  const isInQuietHours = useCallback(() => {
    if (!preferences.quietHoursEnabled) return false;
    
    const now = new Date();
    const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number);
    
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }, [preferences.quietHoursEnabled, preferences.quietHoursStart, preferences.quietHoursEnd]);

  // Play sound
  const playSound = useCallback(() => {
    if (preferences.sound && !isInQuietHours()) {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  }, [preferences.sound, isInQuietHours]);

  // Show desktop notification
  const showDesktopNotification = useCallback((notification: SmartNotification) => {
    if (preferences.desktop && Notification.permission === 'granted' && !isInQuietHours()) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  }, [preferences.desktop, isInQuietHours]);

  const addNotification = useCallback((
    notification: Omit<SmartNotification, 'id' | 'timestamp' | 'read' | 'pinned' | 'archived'>
  ) => {
    if (!preferences.enabled) return;
    if (preferences.mutedCategories.includes(notification.category)) return;

    const newNotification: SmartNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      pinned: false,
      archived: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    playSound();
    showDesktopNotification(newNotification);
  }, [preferences.enabled, preferences.mutedCategories, setNotifications, playSound, showDesktopNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, [setNotifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [setNotifications]);

  const togglePin = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n)
    );
  }, [setNotifications]);

  const archiveNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, archived: true, read: true } : n)
    );
  }, [setNotifications]);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, [setNotifications]);

  const clearAll = useCallback(() => {
    setNotifications(prev => prev.filter(n => n.pinned));
  }, [setNotifications]);

  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, [setPreferences]);

  const getGroupedNotifications = useCallback((): NotificationGroup[] => {
    if (!preferences.groupSimilar) {
      return notifications
        .filter(n => !n.archived)
        .map(n => ({
          groupId: n.id,
          notifications: [n],
          count: 1,
          latestTimestamp: new Date(n.timestamp)
        }));
    }

    const groups = new Map<string, SmartNotification[]>();
    
    notifications
      .filter(n => !n.archived)
      .forEach(n => {
        const key = n.groupId || n.category;
        const existing = groups.get(key) || [];
        groups.set(key, [...existing, n]);
      });

    return Array.from(groups.entries()).map(([groupId, notifs]) => ({
      groupId,
      notifications: notifs,
      count: notifs.length,
      latestTimestamp: new Date(Math.max(...notifs.map(n => new Date(n.timestamp).getTime())))
    })).sort((a, b) => b.latestTimestamp.getTime() - a.latestTimestamp.getTime());
  }, [notifications, preferences.groupSimilar]);

  const requestDesktopPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      if (granted) {
        updatePreferences({ desktop: true });
      }
      return granted;
    }
    return false;
  }, [updatePreferences]);

  // Auto-archive old notifications
  useEffect(() => {
    const archiveDate = new Date();
    archiveDate.setDate(archiveDate.getDate() - preferences.autoArchiveAfterDays);

    setNotifications(prev =>
      prev.map(n => {
        if (!n.archived && !n.pinned && new Date(n.timestamp) < archiveDate) {
          return { ...n, archived: true };
        }
        return n;
      })
    );
  }, [preferences.autoArchiveAfterDays, setNotifications]);

  return (
    <SmartNotificationsContext.Provider
      value={{
        notifications,
        preferences,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        togglePin,
        archiveNotification,
        deleteNotification,
        clearAll,
        updatePreferences,
        getGroupedNotifications,
        requestDesktopPermission
      }}
    >
      {children}
    </SmartNotificationsContext.Provider>
  );
}

export function useSmartNotifications() {
  const context = useContext(SmartNotificationsContext);
  if (!context) throw new Error('useSmartNotifications must be used within SmartNotificationsProvider');
  return context;
}

// Icon helpers
const typeIcons: Record<NotificationType, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle
};

const typeColors: Record<NotificationType, string> = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500'
};

// Notification Item
interface NotificationItemProps {
  notification: SmartNotification;
  compact?: boolean;
}

function NotificationItem({ notification, compact = false }: NotificationItemProps) {
  const { markAsRead, togglePin, archiveNotification, deleteNotification } = useSmartNotifications();
  const Icon = typeIcons[notification.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        'group relative p-3 rounded-lg transition-colors',
        notification.read ? 'bg-background' : 'bg-muted/50',
        notification.pinned && 'border-l-2 border-primary'
      )}
    >
      <div className="flex gap-3">
        <div className={cn('mt-0.5', typeColors[notification.type])}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={cn(
                'text-sm',
                !notification.read && 'font-medium'
              )}>
                {notification.title}
              </p>
              {!compact && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {notification.message}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => togglePin(notification.id)}
              >
                {notification.pinned ? (
                  <PinOff className="h-3 w-3" />
                ) : (
                  <Pin className="h-3 w-3" />
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!notification.read && (
                    <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                      <Check className="h-4 w-4 mr-2" />
                      Mark as read
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => archiveNotification(notification.id)}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => deleteNotification(notification.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.timestamp), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
            <Badge variant="outline" className="text-xs h-5">
              {notification.category}
            </Badge>
            {notification.priority === 'urgent' && (
              <Badge variant="destructive" className="text-xs h-5">
                Urgente
              </Badge>
            )}
          </div>

          {notification.actionUrl && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 mt-2 text-xs"
              asChild
            >
              <a href={notification.actionUrl} target="_blank" rel="noopener noreferrer">
                {notification.actionLabel || 'Ver mais'}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </div>

        {!notification.read && (
          <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
        )}
      </div>
    </motion.div>
  );
}

// Notification Center
export function NotificationCenter() {
  const {
    notifications,
    preferences,
    unreadCount,
    markAllAsRead,
    clearAll,
    getGroupedNotifications
  } = useSmartNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [open, setOpen] = useState(false);

  const filteredNotifications = notifications.filter(n => {
    if (n.archived) return false;
    if (filter === 'unread') return !n.read;
    return true;
  });

  const pinnedNotifications = filteredNotifications.filter(n => n.pinned);
  const regularNotifications = filteredNotifications.filter(n => !n.pinned);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {preferences.enabled ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          {preferences.showBadge && unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          <div className="flex items-center gap-2">
            <NotificationSettings />
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-1" />
                Marcar todas
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
            <TabsTrigger value="all" onClick={() => setFilter('all')}>
              Todas
            </TabsTrigger>
            <TabsTrigger value="unread" onClick={() => setFilter('unread')}>
              Não lidas ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-1">
              {pinnedNotifications.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground">
                    <Pin className="h-3 w-3" />
                    Fixadas
                  </div>
                  <AnimatePresence>
                    {pinnedNotifications.map(n => (
                      <NotificationItem key={n.id} notification={n} />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <AnimatePresence>
                {regularNotifications.map(n => (
                  <NotificationItem key={n.id} notification={n} />
                ))}
              </AnimatePresence>

              {filteredNotifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Tabs>

        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={clearAll}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar todas
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Notification Settings
function NotificationSettings() {
  const { preferences, updatePreferences, requestDesktopPermission } = useSmartNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h4 className="font-medium">Configurações</h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <Label>Notificações</Label>
              </div>
              <Switch
                checked={preferences.enabled}
                onCheckedChange={(enabled) => updatePreferences({ enabled })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <Label>Som</Label>
              </div>
              <Switch
                checked={preferences.sound}
                onCheckedChange={(sound) => updatePreferences({ sound })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <Label>Notificações Desktop</Label>
              </div>
              <Switch
                checked={preferences.desktop}
                onCheckedChange={(desktop) => {
                  if (desktop) {
                    requestDesktopPermission();
                  } else {
                    updatePreferences({ desktop: false });
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <Label>Modo Silencioso</Label>
              </div>
              <Switch
                checked={preferences.quietHoursEnabled}
                onCheckedChange={(quietHoursEnabled) => updatePreferences({ quietHoursEnabled })}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Toast Notification
interface ToastNotificationProps {
  notification: SmartNotification;
  onDismiss: () => void;
}

export function ToastNotification({ notification, onDismiss }: ToastNotificationProps) {
  const Icon = typeIcons[notification.type];

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="pointer-events-auto"
    >
      <Card className="w-80 shadow-lg">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className={cn('mt-0.5', typeColors[notification.type])}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{notification.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {notification.message}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Toast Container
export function NotificationToastContainer() {
  const { notifications } = useSmartNotifications();
  const [toasts, setToasts] = useState<SmartNotification[]>([]);

  useEffect(() => {
    const latestUnread = notifications.find(n => !n.read);
    if (latestUnread && !toasts.find(t => t.id === latestUnread.id)) {
      setToasts(prev => [...prev, latestUnread].slice(-3));
    }
  }, [notifications, toasts]);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            notification={toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
