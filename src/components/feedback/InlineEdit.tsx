import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => Promise<void> | void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  validate?: (value: string) => string | null;
  renderValue?: (value: string) => React.ReactNode;
  showEditIcon?: boolean;
  autoFocus?: boolean;
  selectOnEdit?: boolean;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  placeholder = 'Clique para editar',
  className = '',
  inputClassName = '',
  disabled = false,
  required = false,
  maxLength,
  minLength,
  validate,
  renderValue,
  showEditIcon = true,
  autoFocus = true,
  selectOnEdit = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && autoFocus && inputRef.current) {
      inputRef.current.focus();
      if (selectOnEdit) {
        inputRef.current.select();
      }
    }
  }, [isEditing, autoFocus, selectOnEdit]);

  const validateValue = useCallback((val: string): string | null => {
    if (required && !val.trim()) {
      return 'Campo obrigatório';
    }
    if (minLength && val.length < minLength) {
      return `Mínimo ${minLength} caracteres`;
    }
    if (maxLength && val.length > maxLength) {
      return `Máximo ${maxLength} caracteres`;
    }
    if (validate) {
      return validate(val);
    }
    return null;
  }, [required, minLength, maxLength, validate]);

  const handleSave = async () => {
    const validationError = validateValue(editValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (disabled) {
    return (
      <span className={cn('text-muted-foreground', className)}>
        {renderValue ? renderValue(value) : value || placeholder}
      </span>
    );
  }

  if (isEditing) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex-1">
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Small delay to allow button clicks
              setTimeout(() => {
                if (!isSaving) handleCancel();
              }, 150);
            }}
            className={cn(
              'h-8',
              error && 'border-destructive',
              inputClassName
            )}
            maxLength={maxLength}
            disabled={isSaving}
          />
          {error && (
            <p className="text-xs text-destructive mt-1">{error}</p>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Check className="h-4 w-4 text-green-500" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        'group inline-flex items-center gap-2 text-left cursor-pointer',
        'hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1',
        'transition-colors duration-200',
        !value && 'text-muted-foreground italic',
        className
      )}
    >
      <span>{renderValue ? renderValue(value) : value || placeholder}</span>
      {showEditIcon && (
        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      )}
    </button>
  );
};

// Textarea variant
interface InlineTextareaProps extends Omit<InlineEditProps, 'renderValue'> {
  rows?: number;
}

export const InlineTextarea: React.FC<InlineTextareaProps> = ({
  value,
  onSave,
  placeholder = 'Clique para editar',
  className = '',
  disabled = false,
  rows = 3,
  ...props
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (disabled) {
    return (
      <p className={cn('text-muted-foreground whitespace-pre-wrap', className)}>
        {value || placeholder}
      </p>
    );
  }

  if (isEditing) {
    return (
      <div className={cn('space-y-2', className)}>
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          rows={rows}
          className={cn(
            'w-full px-3 py-2 rounded-md border border-input bg-background',
            'focus:outline-none focus:ring-2 focus:ring-ring resize-none'
          )}
          disabled={isSaving}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Check className="h-4 w-4 mr-1" />
            Salvar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditValue(value);
              setIsEditing(false);
            }}
            disabled={isSaving}
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        'block w-full text-left p-2 -m-2 rounded',
        'hover:bg-muted/50 transition-colors cursor-pointer',
        'whitespace-pre-wrap',
        !value && 'text-muted-foreground italic',
        className
      )}
    >
      {value || placeholder}
    </button>
  );
};

// Number edit variant
interface InlineNumberProps {
  value: number;
  onSave: (value: number) => Promise<void> | void;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
  className?: string;
  disabled?: boolean;
}

export const InlineNumber: React.FC<InlineNumberProps> = ({
  value,
  onSave,
  min,
  max,
  step = 1,
  format = (v) => v.toString(),
  className = '',
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const numValue = parseFloat(editValue);
    if (isNaN(numValue)) {
      setEditValue(value.toString());
      setIsEditing(false);
      return;
    }

    const clampedValue = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, numValue));
    
    if (clampedValue === value) {
      setIsEditing(false);
      return;
    }

    await onSave(clampedValue);
    setIsEditing(false);
  };

  if (disabled) {
    return <span className={cn('text-muted-foreground', className)}>{format(value)}</span>;
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') {
            setEditValue(value.toString());
            setIsEditing(false);
          }
        }}
        min={min}
        max={max}
        step={step}
        className={cn('h-8 w-24', className)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 -mx-2 -my-1 rounded',
        'hover:bg-muted/50 transition-colors cursor-pointer group',
        className
      )}
    >
      {format(value)}
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
    </button>
  );
};
