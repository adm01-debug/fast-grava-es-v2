import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  Loader2,
  ArrowRight,
  ExternalLink,
  Undo2,
  Copy,
  Bell
} from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Enhanced toast types
type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'promise';

interface EnhancedToastOptions {
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancelAction?: {
    label: string;
    onClick?: () => void;
  };
  undo?: () => void;
  link?: {
    label: string;
    href: string;
    external?: boolean;
  };
  icon?: ReactNode;
  progress?: number;
  persistent?: boolean;
  copyable?: string;
}

// Toast icons
const toastIcons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-success" />,
  error: <XCircle className="h-5 w-5 text-destructive" />,
  warning: <AlertCircle className="h-5 w-5 text-warning" />,
  info: <Info className="h-5 w-5 text-info" />,
  loading: <Loader2 className="h-5 w-5 text-primary animate-spin" />,
  promise: <Loader2 className="h-5 w-5 text-primary animate-spin" />,
};

// Custom toast component
function EnhancedToastContent({
  title,
  description,
  type = 'info',
  action,
  cancelAction,
  undo,
  link,
  icon,
  progress,
  copyable,
  onDismiss,
}: EnhancedToastOptions & { onDismiss?: () => void }) {
  const handleCopy = () => {
    if (copyable) {
      navigator.clipboard.writeText(copyable);
      sonnerToast.success('Copiado!', { duration: 1500 });
    }
  };

  const hasActions = action || cancelAction || undo || link || copyable;

  return (
    <div className="flex gap-3 w-full">
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        {icon || toastIcons[type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-medium text-foreground text-sm">{title}</p>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Actions */}
        {hasActions && (
          <div className="flex items-center gap-2 mt-3">
            {action && (
              <Button
                size="sm"
                variant="default"
                className="h-7 text-xs"
                onClick={() => {
                  action.onClick();
                  onDismiss?.();
                }}
              >
                {action.label}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}

            {undo && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => {
                  undo();
                  onDismiss?.();
                }}
              >
                <Undo2 className="h-3 w-3 mr-1" />
                Desfazer
              </Button>
            )}

            {link && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                asChild
              >
                <a
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                  {link.external && <ExternalLink className="h-3 w-3 ml-1" />}
                </a>
              </Button>
            )}

            {copyable && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={handleCopy}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>
            )}

            {cancelAction && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground"
                onClick={() => {
                  cancelAction.onClick?.();
                  onDismiss?.();
                }}
              >
                {cancelAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced toast API
export const enhancedToast = {
  /**
   * Show a success toast
   */
  success: (title: string, options?: Omit<EnhancedToastOptions, 'type'>) => {
    return sonnerToast.custom(
      (id) => (
        <EnhancedToastContent
          title={title}
          type="success"
          {...options}
          onDismiss={() => sonnerToast.dismiss(id)}
        />
      ),
      {
        duration: options?.persistent ? Infinity : 4000,
        ...options,
      }
    );
  },

  /**
   * Show an error toast
   */
  error: (title: string, options?: Omit<EnhancedToastOptions, 'type'>) => {
    return sonnerToast.custom(
      (id) => (
        <EnhancedToastContent
          title={title}
          type="error"
          {...options}
          onDismiss={() => sonnerToast.dismiss(id)}
        />
      ),
      {
        duration: options?.persistent ? Infinity : 6000,
        ...options,
      }
    );
  },

  /**
   * Show a warning toast
   */
  warning: (title: string, options?: Omit<EnhancedToastOptions, 'type'>) => {
    return sonnerToast.custom(
      (id) => (
        <EnhancedToastContent
          title={title}
          type="warning"
          {...options}
          onDismiss={() => sonnerToast.dismiss(id)}
        />
      ),
      {
        duration: options?.persistent ? Infinity : 5000,
        ...options,
      }
    );
  },

  /**
   * Show an info toast
   */
  info: (title: string, options?: Omit<EnhancedToastOptions, 'type'>) => {
    return sonnerToast.custom(
      (id) => (
        <EnhancedToastContent
          title={title}
          type="info"
          {...options}
          onDismiss={() => sonnerToast.dismiss(id)}
        />
      ),
      {
        duration: options?.persistent ? Infinity : 4000,
        ...options,
      }
    );
  },

  /**
   * Show a loading toast
   */
  loading: (title: string, options?: Omit<EnhancedToastOptions, 'type'>) => {
    return sonnerToast.custom(
      (id) => (
        <EnhancedToastContent
          title={title}
          type="loading"
          {...options}
          onDismiss={() => sonnerToast.dismiss(id)}
        />
      ),
      {
        duration: Infinity,
        ...options,
      }
    );
  },

  /**
   * Show a promise toast that updates based on promise state
   */
  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
    });
  },

  /**
   * Show a toast with undo action
   */
  withUndo: (
    title: string,
    options: Omit<EnhancedToastOptions, 'type' | 'undo'> & {
      onUndo: () => void;
      undoTimeout?: number;
    }
  ) => {
    const { onUndo, undoTimeout = 5000, ...rest } = options;
    let undone = false;

    const id = sonnerToast.custom(
      () => (
        <EnhancedToastContent
          title={title}
          type="success"
          undo={() => {
            undone = true;
            onUndo();
          }}
          {...rest}
          onDismiss={() => sonnerToast.dismiss(id)}
        />
      ),
      {
        duration: undoTimeout,
        ...rest,
      }
    );

    return { id, wasUndone: () => undone };
  },

  /**
   * Show a notification-style toast
   */
  notification: (options: {
    title: string;
    description?: string;
    avatar?: string;
    time?: string;
    onClick?: () => void;
  }) => {
    return sonnerToast.custom(
      (id) => (
        <div
          className="flex gap-3 cursor-pointer hover:bg-muted/50 -m-4 p-4 rounded-lg transition-colors"
          onClick={() => {
            options.onClick?.();
            sonnerToast.dismiss(id);
          }}
        >
          {options.avatar ? (
            <img
              src={options.avatar}
              alt=""
              className="h-10 w-10 rounded-full shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground">{options.title}</p>
            {options.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                {options.description}
              </p>
            )}
            {options.time && (
              <p className="text-xs text-muted-foreground mt-1">{options.time}</p>
            )}
          </div>
        </div>
      ),
      {
        duration: 6000,
      }
    );
  },

  /**
   * Dismiss a toast
   */
  dismiss: sonnerToast.dismiss,

  /**
   * Dismiss all toasts
   */
  dismissAll: () => sonnerToast.dismiss(),
};

// Preset toast messages
export const toastMessages = {
  saved: () => enhancedToast.success('Alterações salvas'),
  deleted: (item: string, onUndo?: () => void) =>
    onUndo
      ? enhancedToast.withUndo(`${item} excluído`, { onUndo })
      : enhancedToast.success(`${item} excluído`),
  created: (item: string) => enhancedToast.success(`${item} criado com sucesso`),
  updated: (item: string) => enhancedToast.success(`${item} atualizado`),
  copied: () => enhancedToast.success('Copiado para a área de transferência'),
  networkError: () =>
    enhancedToast.error('Erro de conexão', {
      description: 'Verifique sua internet e tente novamente',
      action: {
        label: 'Tentar novamente',
        onClick: () => window.location.reload(),
      },
    }),
  sessionExpired: () =>
    enhancedToast.warning('Sessão expirada', {
      description: 'Por favor, faça login novamente',
      action: {
        label: 'Login',
        onClick: () => (window.location.href = '/auth'),
      },
    }),
  formError: (errors: number) =>
    enhancedToast.error('Erro de validação', {
      description: `${errors} campo${errors > 1 ? 's' : ''} com erro${errors > 1 ? 's' : ''}`,
    }),
};
