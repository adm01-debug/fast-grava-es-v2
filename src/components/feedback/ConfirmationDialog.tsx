import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Types
type ConfirmationType = 'danger' | 'warning' | 'info';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: ConfirmationType;
  onConfirm: () => void | Promise<void>;
  requireConfirmation?: string; // Text user must type to confirm
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const typeStyles: Record<ConfirmationType, { icon: typeof AlertTriangle; color: string; bgColor: string }> = {
  danger: {
    icon: Trash2,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  info: {
    icon: AlertTriangle,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  type = 'warning',
  onConfirm,
  requireConfirmation,
  icon,
  isLoading: externalLoading,
}: ConfirmationDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const styles = typeStyles[type];
  const Icon = icon || styles.icon;
  
  const isConfirmDisabled = requireConfirmation 
    ? confirmText.toLowerCase() !== requireConfirmation.toLowerCase()
    : false;
  
  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
      setConfirmText('');
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loading = externalLoading || isLoading;
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                styles.bgColor
              )}
            >
              {typeof Icon === 'function' ? (
                <Icon className={cn('h-6 w-6', styles.color)} />
              ) : (
                Icon
              )}
            </motion.div>
            <div>
              <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        {/* Confirmation input */}
        {requireConfirmation && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Digite <span className="font-mono font-semibold text-foreground">"{requireConfirmation}"</span> para confirmar:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={requireConfirmation}
              className="font-mono"
              autoComplete="off"
            />
          </div>
        )}
        
        <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
          <AlertDialogCancel disabled={loading} className="gap-2">
            <X className="h-4 w-4" />
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isConfirmDisabled || loading}
            className={cn(
              'gap-2',
              type === 'danger' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : type === 'danger' ? (
              <Trash2 className="h-4 w-4" />
            ) : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Delete confirmation preset
interface DeleteConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType?: string;
  onDelete: () => void | Promise<void>;
  requireTyping?: boolean;
}

export function DeleteConfirmation({
  open,
  onOpenChange,
  itemName,
  itemType = 'item',
  onDelete,
  requireTyping = false,
}: DeleteConfirmationProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      type="danger"
      title={`Excluir ${itemType}?`}
      description={`Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir"
      cancelLabel="Cancelar"
      onConfirm={onDelete}
      requireConfirmation={requireTyping ? itemName : undefined}
    />
  );
}

// Discard changes confirmation
export function DiscardChangesConfirmation({
  open,
  onOpenChange,
  onDiscard,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onSave?: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <AlertDialogTitle>Alterações não salvas</AlertDialogTitle>
              <AlertDialogDescription>
                Você tem alterações que não foram salvas. Deseja descartá-las?
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2 sm:gap-0 flex-col sm:flex-row">
          <AlertDialogCancel>Continuar Editando</AlertDialogCancel>
          <Button variant="outline" onClick={onDiscard}>
            Descartar
          </Button>
          {onSave && (
            <Button onClick={onSave}>
              Salvar
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Logout confirmation
export function LogoutConfirmation({
  open,
  onOpenChange,
  onLogout,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout: () => void;
}) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      type="info"
      title="Sair da conta?"
      description="Você será desconectado e precisará fazer login novamente."
      confirmLabel="Sair"
      cancelLabel="Cancelar"
      onConfirm={onLogout}
    />
  );
}

// Hook for easy confirmation dialog usage
export function useConfirmation() {
  const [state, setState] = useState<{
    open: boolean;
    props: Partial<ConfirmationDialogProps>;
  }>({
    open: false,
    props: {},
  });
  
  const confirm = (props: Omit<ConfirmationDialogProps, 'open' | 'onOpenChange'>) => {
    return new Promise<boolean>((resolve) => {
      setState({
        open: true,
        props: {
          ...props,
          onConfirm: async () => {
            await props.onConfirm?.();
            resolve(true);
          },
        },
      });
    });
  };
  
  const Dialog = () => (
    <ConfirmationDialog
      open={state.open}
      onOpenChange={(open) => setState((s) => ({ ...s, open }))}
      title={state.props.title || ''}
      description={state.props.description || ''}
      {...state.props}
      onConfirm={state.props.onConfirm || (() => {})}
    />
  );
  
  return { confirm, Dialog };
}

export default ConfirmationDialog;
