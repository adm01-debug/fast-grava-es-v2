import React from 'react';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Toast/Notification customizado
interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function CustomToast({ id, type, title, message, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-destructive" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-950/30 border-destructive/30',
    warning: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm',
        bgColors[type]
      )}
    >
      {icons[type]}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        {message && <p className="text-sm text-muted-foreground mt-1">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

// Alert inline
interface AlertBoxProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function AlertBox({
  type,
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
}: AlertBoxProps) {
  const [visible, setVisible] = React.useState(true);

  if (!visible) return null;

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  const styles = {
    success: 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200 border-destructive/30',
    warning: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
  };

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div className={cn('flex gap-3 p-4 rounded-lg border', styles[type], className)}>
      <span className="shrink-0">{icons[type]}</span>
      <div className="flex-1">
        {title && <p className="font-medium mb-1">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
      {dismissible && (
        <button onClick={handleDismiss} className="shrink-0 opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Banner de feedback
interface BannerProps {
  type: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

export function NotificationBanner({ type, children, action, onDismiss, className }: BannerProps) {
  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-destructive',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={cn('text-white py-3 px-4', bgColors[type], className)}>
      <div className="container flex items-center justify-between gap-4">
        <p className="text-sm font-medium">{children}</p>
        <div className="flex items-center gap-2">
          {action && (
            <Button
              size="sm"
              variant="secondary"
              onClick={action.onClick}
              className="h-7 text-xs"
            >
              {action.label}
            </Button>
          )}
          {onDismiss && (
            <button onClick={onDismiss} className="opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Status badge
interface StatusBadgeProps {
  status: 'success' | 'error' | 'warning' | 'pending' | 'info';
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const styles = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const dots = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    pending: 'bg-gray-500 animate-pulse',
    info: 'bg-blue-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        styles[status],
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dots[status])} />
      {label}
    </span>
  );
}

// Mensagem de resultado de ação
interface ResultMessageProps {
  type: 'success' | 'error';
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function ResultMessage({
  type,
  title,
  message,
  action,
  className,
}: ResultMessageProps) {
  return (
    <div className={cn('text-center py-8', className)}>
      <div
        className={cn(
          'mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4',
          type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
        )}
      >
        {type === 'success' ? (
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        ) : (
          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {message && <p className="text-muted-foreground mb-4">{message}</p>}
      {action && (
        <Button onClick={action.onClick} variant={type === 'success' ? 'default' : 'outline'}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Hook para gerenciar toasts
interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export function useToastNotifications() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }

    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = React.useCallback(
    (title: string, message?: string) => addToast({ type: 'success', title, message }),
    [addToast]
  );

  const error = React.useCallback(
    (title: string, message?: string) => addToast({ type: 'error', title, message }),
    [addToast]
  );

  const warning = React.useCallback(
    (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    [addToast]
  );

  const info = React.useCallback(
    (title: string, message?: string) => addToast({ type: 'info', title, message }),
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}

// Container para toasts
export function ToastNotificationContainer({ 
  toasts, 
  onClose 
}: { 
  toasts: ToastItem[]; 
  onClose: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <CustomToast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Inline feedback message
interface InlineFeedbackProps {
  type: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}

export function InlineFeedbackMessage({ type, children, className }: InlineFeedbackProps) {
  const styles = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-destructive',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  const icons = {
    success: <CheckCircle className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  return (
    <p className={cn('flex items-center gap-2 text-sm', styles[type], className)}>
      {icons[type]}
      {children}
    </p>
  );
}
