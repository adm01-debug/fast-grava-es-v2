import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  href?: string;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  add: (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  remove: (id: string) => void;
  clear: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const add = useCallback((n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => {
    const notification: AppNotification = {
      ...n,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clear = useCallback(() => setNotifications([]), []);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, add, markAsRead, markAllAsRead, remove, clear }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotificationsContext must be used within NotificationsProvider');
  return ctx;
}
