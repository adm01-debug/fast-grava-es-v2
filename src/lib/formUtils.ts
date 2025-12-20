/**
 * Form utilities for integrating Zod schemas with React Hook Form
 * Provides type-safe form handling with validation
 */

import { useForm, UseFormReturn, FieldErrors, Path, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

// Re-export schemas for convenience
export * from '@/lib/schemas';

/**
 * Type-safe form hook with Zod validation
 */
export function useZodForm<TSchema extends z.ZodType>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
): UseFormReturn<z.infer<TSchema>> {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    ...options,
  });
}

/**
 * Get field error message
 */
export function getFieldError<T extends Record<string, any>>(
  errors: FieldErrors<T>,
  field: Path<T>
): string | undefined {
  const error = errors[field];
  return error?.message as string | undefined;
}

/**
 * Check if field has error
 */
export function hasFieldError<T extends Record<string, any>>(
  errors: FieldErrors<T>,
  field: Path<T>
): boolean {
  return !!errors[field];
}

/**
 * Format all form errors for display
 */
export function formatFormErrors<T extends Record<string, any>>(
  errors: FieldErrors<T>
): string[] {
  const messages: string[] = [];
  
  const extractErrors = (obj: any, prefix = ''): void => {
    for (const key in obj) {
      const error = obj[key];
      if (error?.message) {
        messages.push(prefix ? `${prefix}.${key}: ${error.message}` : `${key}: ${error.message}`);
      } else if (typeof error === 'object') {
        extractErrors(error, prefix ? `${prefix}.${key}` : key);
      }
    }
  };

  extractErrors(errors);
  return messages;
}

/**
 * Form submission wrapper with error handling
 */
export function useFormSubmit<TSchema extends z.ZodType>(
  form: UseFormReturn<z.infer<TSchema>>,
  onSubmit: (data: z.infer<TSchema>) => Promise<void>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    resetOnSuccess?: boolean;
  }
) {
  const { toast } = useToast();

  const handleSubmit = useCallback(async (data: z.infer<TSchema>) => {
    try {
      await onSubmit(data);
      
      if (options?.successMessage) {
        toast({ title: options.successMessage });
      }
      
      if (options?.resetOnSuccess) {
        form.reset();
      }
      
      options?.onSuccess?.();
    } catch (error) {
      console.error('[useFormSubmit] Error:', error);
      
      toast({
        title: options?.errorMessage || 'Erro ao salvar',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
      
      options?.onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [form, onSubmit, options, toast]);

  return {
    onSubmit: form.handleSubmit(handleSubmit),
    isSubmitting: form.formState.isSubmitting,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
  };
}

/**
 * Field registration helper with error state
 */
export function useFieldRegistration<TSchema extends z.ZodType>(
  form: UseFormReturn<z.infer<TSchema>>
) {
  const { register, formState: { errors } } = form;

  return useMemo(() => ({
    registerField: <TFieldName extends Path<z.infer<TSchema>>>(
      name: TFieldName,
      options?: Parameters<typeof register>[1]
    ) => ({
      ...register(name, options),
      error: hasFieldError(errors, name),
      helperText: getFieldError(errors, name),
    }),
  }), [register, errors]);
}

/**
 * Schema-based default values generator
 */
export function getSchemaDefaults<TSchema extends z.ZodType>(
  schema: TSchema
): Partial<z.infer<TSchema>> {
  const shape = (schema as any)._def?.shape?.();
  if (!shape) return {};

  const defaults: Record<string, any> = {};

  for (const [key, value] of Object.entries(shape)) {
    const fieldSchema = value as z.ZodType;
    const def = (fieldSchema as any)._def;

    // Check for default value
    if (def?.defaultValue !== undefined) {
      defaults[key] = typeof def.defaultValue === 'function' 
        ? def.defaultValue() 
        : def.defaultValue;
    }
    // Check for optional with default
    else if (def?.innerType?._def?.defaultValue !== undefined) {
      const innerDefault = def.innerType._def.defaultValue;
      defaults[key] = typeof innerDefault === 'function' ? innerDefault() : innerDefault;
    }
  }

  return defaults as Partial<z.infer<TSchema>>;
}

/**
 * Transform form data before submission
 */
export function transformFormData<TInput, TOutput>(
  data: TInput,
  transforms: Partial<Record<keyof TInput, (value: any) => any>>
): TOutput {
  const result = { ...data } as any;

  for (const [key, transform] of Object.entries(transforms)) {
    if (transform && key in result) {
      result[key] = transform(result[key]);
    }
  }

  return result as TOutput;
}

/**
 * Sanitize string fields in form data
 */
export function sanitizeFormStrings<T extends Record<string, any>>(
  data: T,
  options?: {
    trim?: boolean;
    removeNullBytes?: boolean;
    maxLength?: number;
  }
): T {
  const { trim = true, removeNullBytes = true, maxLength } = options || {};
  const result = { ...data };

  for (const key in result) {
    if (typeof result[key] === 'string') {
      let value = result[key] as string;
      
      if (removeNullBytes) {
        value = value.replace(/\0/g, '');
      }
      
      if (trim) {
        value = value.trim();
      }
      
      if (maxLength && value.length > maxLength) {
        value = value.substring(0, maxLength);
      }
      
      result[key] = value as any;
    }
  }

  return result;
}

/**
 * Debounced form validation
 */
export function useDebouncedValidation<TSchema extends z.ZodType>(
  form: UseFormReturn<z.infer<TSchema>>,
  delay: number = 300
) {
  const { trigger } = form;
  const timeoutRef = { current: null as ReturnType<typeof setTimeout> | null };

  const debouncedTrigger = useCallback((field?: Path<z.infer<TSchema>>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (field) {
        trigger(field);
      } else {
        trigger();
      }
    }, delay);
  }, [trigger, delay]);

  return debouncedTrigger;
}

/**
 * Form field watcher with callback
 */
export function useFieldWatcher<TSchema extends z.ZodType>(
  form: UseFormReturn<z.infer<TSchema>>,
  field: Path<z.infer<TSchema>>,
  callback: (value: any, previousValue: any) => void
) {
  const { watch } = form;
  const value = watch(field);
  const previousValueRef = { current: value };

  useMemo(() => {
    if (value !== previousValueRef.current) {
      callback(value, previousValueRef.current);
      previousValueRef.current = value;
    }
  }, [value, callback]);

  return value;
}

/**
 * Conditional field validation
 */
export function createConditionalSchema<TSchema extends z.ZodObject<any>>(
  baseSchema: TSchema,
  condition: (data: z.infer<TSchema>) => boolean,
  additionalFields: z.ZodRawShape
): z.ZodType<z.infer<TSchema>> {
  return baseSchema.superRefine((data, ctx) => {
    if (condition(data)) {
      const additionalSchema = z.object(additionalFields);
      const result = additionalSchema.safeParse(data);
      
      if (!result.success) {
        result.error.issues.forEach(issue => {
          ctx.addIssue(issue);
        });
      }
    }
  }) as any;
}

/**
 * Type definitions for common form patterns
 */
export type FormMode = 'create' | 'edit' | 'view';

export interface FormConfig<TSchema extends z.ZodType> {
  schema: TSchema;
  mode: FormMode;
  defaultValues?: Partial<z.infer<TSchema>>;
  onSubmit: (data: z.infer<TSchema>) => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Create a complete form configuration
 */
export function createFormConfig<TSchema extends z.ZodType>(
  config: FormConfig<TSchema>
) {
  const defaults = getSchemaDefaults(config.schema);

  return {
    ...config,
    defaultValues: {
      ...defaults,
      ...config.defaultValues,
    },
    isReadOnly: config.mode === 'view',
    isEditing: config.mode === 'edit',
    isCreating: config.mode === 'create',
  };
}
