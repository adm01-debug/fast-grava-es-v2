import React, { createContext, useContext, useState, useCallback } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Trash2, CheckCircle, Info, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos
interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  requireInput?: string; // Texto que o usuário deve digitar para confirmar
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface PromptOptions extends ConfirmationOptions {
  inputLabel?: string;
  inputPlaceholder?: string;
  inputType?: 'text' | 'textarea';
  defaultValue?: string;
  validation?: (value: string) => string | null;
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
  alert: (options: Omit<ConfirmationOptions, 'cancelText'>) => Promise<void>;
}

const ConfirmationContext = createContext<ConfirmationContextType | null>(null);

// Provider
export function ConfirmationProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    type: 'confirm' | 'prompt' | 'alert';
    options: ConfirmationOptions | PromptOptions;
    resolve: (value: any) => void;
  } | null>(null);

  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const confirm = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({ type: 'confirm', options, resolve });
      setInputValue('');
      setInputError(null);
    });
  }, []);

  const prompt = useCallback((options: PromptOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      setDialogState({ type: 'prompt', options, resolve });
      setInputValue(options.defaultValue || '');
      setInputError(null);
    });
  }, []);

  const alert = useCallback((options: Omit<ConfirmationOptions, 'cancelText'>): Promise<void> => {
    return new Promise((resolve) => {
      setDialogState({ 
        type: 'alert', 
        options: { ...options, cancelText: undefined }, 
        resolve 
      });
    });
  }, []);

  const handleConfirm = async () => {
    if (!dialogState) return;

    const { options, resolve, type } = dialogState;

    // Validação de input requerido
    if ('requireInput' in options && options.requireInput) {
      if (inputValue !== options.requireInput) {
        setInputError(`Digite "${options.requireInput}" para confirmar`);
        return;
      }
    }

    // Validação de prompt
    if (type === 'prompt' && 'validation' in options && options.validation) {
      const error = options.validation(inputValue);
      if (error) {
        setInputError(error);
        return;
      }
    }

    setLoading(true);
    try {
      if (options.onConfirm) {
        await options.onConfirm();
      }

      if (type === 'prompt') {
        resolve(inputValue);
      } else if (type === 'alert') {
        resolve(undefined);
      } else {
        resolve(true);
      }
    } finally {
      setLoading(false);
      setDialogState(null);
    }
  };

  const handleCancel = () => {
    if (!dialogState) return;

    const { options, resolve, type } = dialogState;
    
    if (options.onCancel) {
      options.onCancel();
    }

    if (type === 'prompt') {
      resolve(null);
    } else if (type === 'alert') {
      resolve(undefined);
    } else {
      resolve(false);
    }
    
    setDialogState(null);
  };

  const getIcon = () => {
    if (!dialogState) return null;
    
    const variant = dialogState.options.variant || 'default';
    const iconClass = "h-6 w-6";
    
    switch (variant) {
      case 'destructive':
        return <Trash2 className={cn(iconClass, "text-destructive")} />;
      case 'warning':
        return <AlertTriangle className={cn(iconClass, "text-yellow-500")} />;
      case 'success':
        return <CheckCircle className={cn(iconClass, "text-green-500")} />;
      default:
        return <Info className={cn(iconClass, "text-primary")} />;
    }
  };

  return (
    <ConfirmationContext.Provider value={{ confirm, prompt, alert }}>
      {children}

      <AlertDialog open={!!dialogState} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              {getIcon()}
              <AlertDialogTitle>{dialogState?.options.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              {dialogState?.options.description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Input para confirmação com texto */}
          {dialogState?.options && 'requireInput' in dialogState.options && dialogState.options.requireInput && (
            <div className="py-4">
              <Label htmlFor="confirm-input" className="text-sm text-muted-foreground">
                Digite <span className="font-mono font-bold">{dialogState.options.requireInput}</span> para confirmar:
              </Label>
              <Input
                id="confirm-input"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setInputError(null);
                }}
                className={cn("mt-2", inputError && "border-destructive")}
                autoFocus
              />
              {inputError && (
                <p className="text-sm text-destructive mt-1">{inputError}</p>
              )}
            </div>
          )}

          {/* Input para prompt */}
          {dialogState?.type === 'prompt' && (
            <div className="py-4">
              {'inputLabel' in dialogState.options && dialogState.options.inputLabel && (
                <Label htmlFor="prompt-input">{dialogState.options.inputLabel}</Label>
              )}
              {'inputType' in dialogState.options && dialogState.options.inputType === 'textarea' ? (
                <Textarea
                  id="prompt-input"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setInputError(null);
                  }}
                  placeholder={'inputPlaceholder' in dialogState.options ? dialogState.options.inputPlaceholder : ''}
                  className={cn("mt-2", inputError && "border-destructive")}
                  rows={4}
                  autoFocus
                />
              ) : (
                <Input
                  id="prompt-input"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setInputError(null);
                  }}
                  placeholder={'inputPlaceholder' in dialogState.options ? dialogState.options.inputPlaceholder : ''}
                  className={cn("mt-2", inputError && "border-destructive")}
                  autoFocus
                />
              )}
              {inputError && (
                <p className="text-sm text-destructive mt-1">{inputError}</p>
              )}
            </div>
          )}

          <AlertDialogFooter>
            {dialogState?.type !== 'alert' && (
              <AlertDialogCancel onClick={handleCancel} disabled={loading}>
                {dialogState?.options.cancelText || 'Cancelar'}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={loading}
              className={cn(
                dialogState?.options.variant === 'destructive' && 'bg-destructive hover:bg-destructive/90'
              )}
            >
              {loading ? 'Processando...' : (dialogState?.options.confirmText || 'Confirmar')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmationContext.Provider>
  );
}

// Hook para usar confirmações
export function useConfirmation() {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within ConfirmationProvider');
  }
  return context;
}

// Componentes prontos para uso comum

interface DeleteConfirmProps {
  itemName: string;
  onConfirm: () => void | Promise<void>;
  children: React.ReactNode;
}

export function DeleteConfirmButton({ itemName, onConfirm, children }: DeleteConfirmProps) {
  const { confirm } = useConfirmation();

  const handleClick = async () => {
    const confirmed = await confirm({
      title: 'Confirmar Exclusão',
      description: `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'destructive',
      onConfirm,
    });
  };

  return <span onClick={handleClick}>{children}</span>;
}

interface ConfirmButtonProps {
  title: string;
  description: string;
  confirmText?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  onConfirm: () => void | Promise<void>;
  children: React.ReactNode;
}

export function ConfirmButton({
  title,
  description,
  confirmText,
  variant = 'default',
  onConfirm,
  children,
}: ConfirmButtonProps) {
  const { confirm } = useConfirmation();

  const handleClick = async () => {
    await confirm({
      title,
      description,
      confirmText,
      variant,
      onConfirm,
    });
  };

  return <span onClick={handleClick}>{children}</span>;
}

// Tooltip de confirmação inline
interface InlineConfirmProps {
  message: string;
  onConfirm: () => void;
  children: React.ReactNode;
}

export function InlineConfirm({ message, onConfirm, children }: InlineConfirmProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 animate-in fade-in">
        <span className="text-sm text-muted-foreground">{message}</span>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            onConfirm();
            setShowConfirm(false);
          }}
        >
          Sim
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowConfirm(false)}
        >
          Não
        </Button>
      </div>
    );
  }

  return <span onClick={() => setShowConfirm(true)}>{children}</span>;
}

// Double-click para confirmar
interface DoubleClickConfirmProps {
  children: React.ReactNode;
  onConfirm: () => void;
  className?: string;
}

export function DoubleClickConfirm({ children, onConfirm, className }: DoubleClickConfirmProps) {
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (clicked) {
      const timer = setTimeout(() => setClicked(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [clicked]);

  const handleClick = () => {
    if (clicked) {
      onConfirm();
      setClicked(false);
    } else {
      setClicked(true);
    }
  };

  return (
    <div 
      onClick={handleClick} 
      className={cn(
        className,
        clicked && "ring-2 ring-destructive ring-offset-2"
      )}
    >
      {clicked ? (
        <span className="text-destructive text-sm">Clique novamente para confirmar</span>
      ) : (
        children
      )}
    </div>
  );
}

// Import useEffect
import { useEffect } from 'react';
