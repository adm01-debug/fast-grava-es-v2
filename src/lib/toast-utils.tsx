import { toast } from 'sonner';
import { CheckCircle, AlertTriangle, XCircle, Info, Undo2, Copy, ExternalLink, Wifi, WifiOff, Upload, Shield, Clock, FileText, Zap, Bell } from 'lucide-react';

interface ToastWithUndoOptions {
  message: string;
  description?: string;
  undoAction: () => void | Promise<void>;
  duration?: number;
  onTimeout?: () => void;
}

interface ToastWithActionOptions {
  message: string;
  description?: string;
  actionLabel: string;
  action: () => void | Promise<void>;
  duration?: number;
}

interface ToastWithLinkOptions {
  message: string;
  description?: string;
  linkLabel: string;
  href: string;
  duration?: number;
}

interface ToastWithCopyOptions {
  message: string;
  description?: string;
  textToCopy: string;
  duration?: number;
}

interface ToastWithProgressOptions {
  message: string;
  description?: string;
  progress: number; // 0-100
  duration?: number;
}

// Toast with undo functionality - perfect for delete actions
export function toastWithUndo({
  message,
  description,
  undoAction,
  duration = 5000,
  onTimeout,
}: ToastWithUndoOptions) {
  let isUndone = false;
  
  const toastId = toast(message, {
    description,
    duration,
    icon: <CheckCircle className="h-5 w-5 text-success" />,
    action: {
      label: 'Desfazer',
      onClick: async () => {
        isUndone = true;
        toast.dismiss(toastId);
        try {
          await undoAction();
          toast.success('Ação desfeita', {
            description: 'A operação foi revertida com sucesso.',
            duration: 2000,
          });
        } catch (error) {
          toast.error('Erro ao desfazer', {
            description: 'Não foi possível reverter a operação.',
          });
        }
      },
    },
    onDismiss: () => {
      if (!isUndone && onTimeout) {
        onTimeout();
      }
    },
  });
  
  return toastId;
}

// Success toast with optional action
export function toastSuccess(message: string, options?: {
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}) {
  return toast.success(message, {
    description: options?.description,
    duration: options?.duration || 3000,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  });
}

// Error toast with retry option
export function toastError(message: string, options?: {
  description?: string;
  retry?: () => void;
  duration?: number;
}) {
  return toast.error(message, {
    description: options?.description,
    duration: options?.duration || 5000,
    action: options?.retry ? {
      label: 'Tentar Novamente',
      onClick: options.retry,
    } : undefined,
  });
}

// Warning toast
export function toastWarning(message: string, description?: string) {
  return toast.warning(message, {
    description,
    duration: 4000,
  });
}

// Info toast
export function toastInfo(message: string, description?: string) {
  return toast.info(message, {
    description,
    duration: 3000,
  });
}

// Loading toast that can be updated
export function toastLoading(message: string) {
  return toast.loading(message);
}

// Update loading toast to success
export function toastLoadingSuccess(toastId: string | number, message: string, description?: string) {
  toast.success(message, {
    id: toastId,
    description,
    duration: 3000,
  });
}

// Update loading toast to error
export function toastLoadingError(toastId: string | number, message: string, description?: string) {
  toast.error(message, {
    id: toastId,
    description,
    duration: 5000,
  });
}

// Promise toast - shows loading, then success/error
export async function toastPromise<T>(
  promise: Promise<T>,
  options: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
) {
  return toast.promise(promise, {
    loading: options.loading,
    success: options.success,
    error: options.error,
  });
}

// Toast with action button
export function toastWithAction({
  message,
  description,
  actionLabel,
  action,
  duration = 5000,
}: ToastWithActionOptions) {
  return toast(message, {
    description,
    duration,
    action: {
      label: actionLabel,
      onClick: action,
    },
  });
}

// Toast with link
export function toastWithLink({
  message,
  description,
  linkLabel,
  href,
  duration = 5000,
}: ToastWithLinkOptions) {
  return toast(message, {
    description,
    duration,
    action: {
      label: linkLabel,
      onClick: () => window.open(href, '_blank'),
    },
  });
}

// Toast with copy to clipboard
export function toastWithCopy({
  message,
  description,
  textToCopy,
  duration = 4000,
}: ToastWithCopyOptions) {
  return toast(message, {
    description,
    duration,
    action: {
      label: 'Copiar',
      onClick: async () => {
        await navigator.clipboard.writeText(textToCopy);
        toast.success('Copiado!', { duration: 1500 });
      },
    },
  });
}

// Preset messages for common operations
export const toastMessages = {
  saved: () => toastSuccess('Salvo com sucesso!'),
  created: (item: string) => toastSuccess(`${item} criado com sucesso!`),
  updated: (item: string) => toastSuccess(`${item} atualizado com sucesso!`),
  
  deleted: (item: string, undoAction?: () => void) => {
    if (undoAction) {
      return toastWithUndo({
        message: `${item} excluído`,
        description: 'Clique em desfazer para recuperar.',
        undoAction,
      });
    }
    return toastSuccess(`${item} excluído com sucesso!`);
  },
  
  copied: () => toastSuccess('Copiado para a área de transferência!', { duration: 2000 }),
  
  networkError: (retry?: () => void) => toastError(
    'Erro de conexão',
    {
      description: 'Verifique sua internet e tente novamente.',
      retry,
    }
  ),
  
  serverError: (retry?: () => void) => toastError(
    'Erro no servidor',
    {
      description: 'Algo deu errado. Tente novamente mais tarde.',
      retry,
    }
  ),
  
  validationError: (fields?: string[]) => toastError(
    'Erro de validação',
    {
      description: fields 
        ? `Corrija os campos: ${fields.join(', ')}`
        : 'Verifique os campos do formulário.',
    }
  ),
  
  unauthorized: () => toastError(
    'Acesso negado',
    { description: 'Você não tem permissão para esta ação.' }
  ),
  
  sessionExpired: () => toastWarning(
    'Sessão expirada',
    'Faça login novamente para continuar.'
  ),
  
  offline: () => toastWarning(
    'Você está offline',
    'Algumas funcionalidades podem estar indisponíveis.'
  ),
  
  online: () => toastSuccess(
    'Conexão restaurada!',
    { description: 'Sincronizando dados...', duration: 2000 }
  ),
  
  autoSaved: () => toastInfo('Rascunho salvo automaticamente'),
  
  fileUploaded: (fileName: string) => toastSuccess(
    'Upload concluído',
    { description: fileName }
  ),
  
  fileUploadError: (retry?: () => void) => toastError(
    'Erro no upload',
    {
      description: 'Não foi possível enviar o arquivo.',
      retry,
    }
  ),
};

export default toastMessages;
