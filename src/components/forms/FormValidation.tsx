import React, { ReactNode, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Eye, 
  EyeOff,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid' | 'warning';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  warning?: string;
  success?: string;
  hint?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  validationState?: ValidationState;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  inputClassName?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  value = '',
  onChange,
  onBlur,
  error,
  warning,
  success,
  hint,
  helpText,
  required = false,
  disabled = false,
  readOnly = false,
  autoFocus = false,
  maxLength,
  showCharCount = false,
  validationState = 'idle',
  leftIcon,
  rightIcon,
  className,
  inputClassName,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const getValidationIcon = () => {
    if (error || validationState === 'invalid') {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    if (warning || validationState === 'warning') {
      return <AlertCircle className="h-4 w-4 text-warning" />;
    }
    if (success || validationState === 'valid') {
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
    return null;
  };

  const getMessage = () => {
    if (error) return { text: error, type: 'error' as const };
    if (warning) return { text: warning, type: 'warning' as const };
    if (success) return { text: success, type: 'success' as const };
    if (hint && isFocused) return { text: hint, type: 'hint' as const };
    return null;
  };

  const message = getMessage();

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Label
            htmlFor={name}
            className={cn(
              'text-sm font-medium',
              disabled && 'text-muted-foreground'
            )}
          >
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </Label>

          {helpText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  {helpText}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {showCharCount && maxLength && (
          <span
            className={cn(
              'text-xs',
              value.length > maxLength * 0.9
                ? 'text-warning'
                : 'text-muted-foreground'
            )}
          >
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}

        <Input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onFocus={() => setIsFocused(true)}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={autoFocus}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={message ? `${name}-message` : undefined}
          className={cn(
            leftIcon && 'pl-10',
            (rightIcon || isPassword || getValidationIcon()) && 'pr-10',
            error && 'border-destructive focus-visible:ring-destructive',
            warning && 'border-warning focus-visible:ring-warning',
            success && 'border-success focus-visible:ring-success',
            inputClassName
          )}
        />

        {/* Right side icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {getValidationIcon()}

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}

          {rightIcon && !isPassword && rightIcon}
        </div>
      </div>

      {/* Message */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.p
            id={`${name}-message`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={cn(
              'text-xs flex items-center gap-1',
              message.type === 'error' && 'text-destructive',
              message.type === 'warning' && 'text-warning',
              message.type === 'success' && 'text-success',
              message.type === 'hint' && 'text-muted-foreground'
            )}
          >
            {message.type === 'hint' && <Info className="h-3 w-3" />}
            {message.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// Textarea variant
interface FormTextareaProps extends Omit<FormFieldProps, 'type' | 'leftIcon' | 'rightIcon'> {
  rows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export function FormTextarea({
  label,
  name,
  placeholder,
  value = '',
  onChange,
  onBlur,
  error,
  warning,
  success,
  hint,
  helpText,
  required = false,
  disabled = false,
  readOnly = false,
  maxLength,
  showCharCount = false,
  rows = 4,
  resize = 'vertical',
  className,
  inputClassName,
}: FormTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);

  const getMessage = () => {
    if (error) return { text: error, type: 'error' as const };
    if (warning) return { text: warning, type: 'warning' as const };
    if (success) return { text: success, type: 'success' as const };
    if (hint && isFocused) return { text: hint, type: 'hint' as const };
    return null;
  };

  const message = getMessage();

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Label htmlFor={name} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </Label>

          {helpText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  {helpText}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {showCharCount && maxLength && (
          <span
            className={cn(
              'text-xs',
              value.length > maxLength * 0.9
                ? 'text-warning'
                : 'text-muted-foreground'
            )}
          >
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      <Textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        onFocus={() => setIsFocused(true)}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={message ? `${name}-message` : undefined}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive',
          warning && 'border-warning focus-visible:ring-warning',
          success && 'border-success focus-visible:ring-success',
          resize === 'none' && 'resize-none',
          resize === 'vertical' && 'resize-y',
          resize === 'horizontal' && 'resize-x',
          resize === 'both' && 'resize',
          inputClassName
        )}
      />

      {/* Message */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.p
            id={`${name}-message`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={cn(
              'text-xs flex items-center gap-1',
              message.type === 'error' && 'text-destructive',
              message.type === 'warning' && 'text-warning',
              message.type === 'success' && 'text-success',
              message.type === 'hint' && 'text-muted-foreground'
            )}
          >
            {message.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// Form section wrapper
interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// Form error summary
interface FormErrorSummaryProps {
  errors: Record<string, string>;
  className?: string;
}

export function FormErrorSummary({ errors, className }: FormErrorSummaryProps) {
  const errorList = Object.entries(errors).filter(([_, value]) => value);

  if (errorList.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-lg border border-destructive/20 bg-destructive/5',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-destructive">
            {errorList.length === 1
              ? 'Há um erro no formulário'
              : `Há ${errorList.length} erros no formulário`}
          </p>
          <ul className="mt-2 space-y-1">
            {errorList.map(([field, error]) => (
              <li key={field} className="text-sm text-destructive/80">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

// Validation hook
export function useFormValidation<T extends Record<string, string>>(
  initialValues: T,
  validators: Partial<Record<keyof T, (value: string) => string | undefined>>
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback((field: keyof T, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    
    // Validate on change if field was touched
    if (touched[field] && validators[field]) {
      const error = validators[field]!(value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  }, [touched, validators]);

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    // Validate on blur
    if (validators[field]) {
      const error = validators[field]!(values[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  }, [validators, values]);

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const field of Object.keys(values) as (keyof T)[]) {
      if (validators[field]) {
        const error = validators[field]!(values[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    setTouched(
      Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      )
    );

    return isValid;
  }, [values, validators]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    isValid: Object.values(errors).every((e) => !e),
  };
}

// Common validators
export const validators = {
  required: (message = 'Este campo é obrigatório') => (value: string) =>
    value.trim() ? undefined : message,

  email: (message = 'E-mail inválido') => (value: string) =>
    !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : message,

  minLength: (min: number, message?: string) => (value: string) =>
    !value || value.length >= min
      ? undefined
      : message || `Mínimo de ${min} caracteres`,

  maxLength: (max: number, message?: string) => (value: string) =>
    !value || value.length <= max
      ? undefined
      : message || `Máximo de ${max} caracteres`,

  pattern: (regex: RegExp, message: string) => (value: string) =>
    !value || regex.test(value) ? undefined : message,

  match: (getValue: () => string, message = 'Os valores não coincidem') => (value: string) =>
    !value || value === getValue() ? undefined : message,

  compose: (...fns: ((value: string) => string | undefined)[]) => (value: string) => {
    for (const fn of fns) {
      const error = fn(value);
      if (error) return error;
    }
    return undefined;
  },
};
