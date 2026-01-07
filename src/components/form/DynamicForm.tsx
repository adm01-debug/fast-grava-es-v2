import React, { useState, useCallback, useMemo } from 'react';
import { useForm, Controller, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// FIELD TYPES
// ============================================

export type FieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'daterange'
  | 'slider'
  | 'file'
  | 'hidden';

export interface FieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FieldConfig {
  name: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  description?: string;
  defaultValue?: unknown;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean | ((values: Record<string, unknown>) => boolean);
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  accept?: string;
  multiple?: boolean;
  className?: string;
  validation?: z.ZodTypeAny;
  dependsOn?: string;
  showWhen?: (values: Record<string, unknown>) => boolean;
}

export interface FormSection {
  title?: string;
  description?: string;
  fields: FieldConfig[];
  columns?: 1 | 2 | 3 | 4;
}

// ============================================
// DYNAMIC FORM COMPONENT
// ============================================

interface DynamicFormProps {
  sections: FormSection[];
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  defaultValues?: Record<string, unknown>;
  className?: string;
  showReset?: boolean;
}

export function DynamicForm({
  sections,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  defaultValues = {},
  className,
  showReset = false
}: DynamicFormProps) {
  // Build schema from fields
  const schema = useMemo(() => {
    const shape: Record<string, z.ZodTypeAny> = {};
    
    sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.validation) {
          shape[field.name] = field.validation;
        } else {
          // Default validations
          let fieldSchema: z.ZodTypeAny = z.any();
          
          switch (field.type) {
            case 'email':
              fieldSchema = z.string().email('Email inválido');
              break;
            case 'number':
              fieldSchema = z.number();
              break;
            case 'date':
              fieldSchema = z.date();
              break;
            default:
              fieldSchema = z.string();
          }
          
          if (!field.required) {
            fieldSchema = fieldSchema.optional();
          }
          
          shape[field.name] = fieldSchema;
        }
      });
    });
    
    return z.object(shape);
  }, [sections]);

  // Build default values
  const formDefaults = useMemo(() => {
    const defaults: Record<string, unknown> = { ...defaultValues };
    
    sections.forEach(section => {
      section.fields.forEach(field => {
        if (!(field.name in defaults) && field.defaultValue !== undefined) {
          defaults[field.name] = field.defaultValue;
        }
      });
    });
    
    return defaults;
  }, [sections, defaultValues]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: formDefaults
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  const watchedValues = form.watch();

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {sections.map((section, sectionIndex) => (
        <FormSectionComponent
          key={sectionIndex}
          section={section}
          form={form}
          watchedValues={watchedValues}
        />
      ))}

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        {showReset && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => form.reset(formDefaults)}
            disabled={isLoading}
          >
            Limpar
          </Button>
        )}
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

// ============================================
// FORM SECTION COMPONENT
// ============================================

interface FormSectionComponentProps {
  section: FormSection;
  form: UseFormReturn<Record<string, unknown>>;
  watchedValues: Record<string, unknown>;
}

function FormSectionComponent({
  section,
  form,
  watchedValues
}: FormSectionComponentProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className="space-y-4">
      {(section.title || section.description) && (
        <div className="space-y-1">
          {section.title && (
            <h3 className="text-lg font-semibold">{section.title}</h3>
          )}
          {section.description && (
            <p className="text-sm text-muted-foreground">{section.description}</p>
          )}
        </div>
      )}

      <div className={cn('grid gap-4', gridCols[section.columns || 1])}>
        {section.fields.map((field) => {
          // Check visibility
          const isHidden = typeof field.hidden === 'function'
            ? field.hidden(watchedValues)
            : field.hidden;

          const shouldShow = field.showWhen
            ? field.showWhen(watchedValues)
            : true;

          if (isHidden || !shouldShow) return null;

          return (
            <AnimatePresence key={field.name} mode="wait">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DynamicField field={field} form={form} />
              </motion.div>
            </AnimatePresence>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// DYNAMIC FIELD COMPONENT
// ============================================

interface DynamicFieldProps {
  field: FieldConfig;
  form: UseFormReturn<Record<string, unknown>>;
}

function DynamicField({ field, form }: DynamicFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const error = form.formState.errors[field.name];

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            disabled={field.disabled}
            min={field.min}
            max={field.max}
            step={field.step}
            {...form.register(field.name, {
              valueAsNumber: field.type === 'number'
            })}
          />
        );

      case 'password':
        return (
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={field.placeholder}
              disabled={field.disabled}
              {...form.register(field.name)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            disabled={field.disabled}
            rows={field.rows || 3}
            {...form.register(field.name)}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.name}
            control={form.control}
            render={({ field: controllerField }) => (
              <Select
                value={controllerField.value as string}
                onValueChange={controllerField.onChange}
                disabled={field.disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || 'Selecione...'} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map(option => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );

      case 'radio':
        return (
          <Controller
            name={field.name}
            control={form.control}
            render={({ field: controllerField }) => (
              <RadioGroup
                value={controllerField.value as string}
                onValueChange={controllerField.onChange}
                disabled={field.disabled}
                className="flex flex-col gap-2"
              >
                {field.options?.map(option => (
                  <div key={option.value} className="flex items-center gap-2">
                    <RadioGroupItem 
                      value={option.value} 
                      id={`${field.name}-${option.value}`}
                      disabled={option.disabled}
                    />
                    <Label htmlFor={`${field.name}-${option.value}`}>
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.name}
            control={form.control}
            render={({ field: controllerField }) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id={field.name}
                  checked={controllerField.value as boolean}
                  onCheckedChange={controllerField.onChange}
                  disabled={field.disabled}
                />
                {field.description && (
                  <Label htmlFor={field.name} className="font-normal cursor-pointer">
                    {field.description}
                  </Label>
                )}
              </div>
            )}
          />
        );

      case 'switch':
        return (
          <Controller
            name={field.name}
            control={form.control}
            render={({ field: controllerField }) => (
              <div className="flex items-center gap-3">
                <Switch
                  id={field.name}
                  checked={controllerField.value as boolean}
                  onCheckedChange={controllerField.onChange}
                  disabled={field.disabled}
                />
                {field.description && (
                  <Label htmlFor={field.name} className="font-normal cursor-pointer">
                    {field.description}
                  </Label>
                )}
              </div>
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={field.name}
            control={form.control}
            render={({ field: controllerField }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !controllerField.value && 'text-muted-foreground'
                    )}
                    disabled={field.disabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {controllerField.value ? (
                      format(controllerField.value as Date, 'PPP', { locale: ptBR })
                    ) : (
                      field.placeholder || 'Selecione uma data'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={controllerField.value as Date}
                    onSelect={controllerField.onChange}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        );

      case 'slider':
        return (
          <Controller
            name={field.name}
            control={form.control}
            render={({ field: controllerField }) => (
              <div className="space-y-2">
                <Slider
                  value={[controllerField.value as number || field.min || 0]}
                  onValueChange={([value]) => controllerField.onChange(value)}
                  min={field.min || 0}
                  max={field.max || 100}
                  step={field.step || 1}
                  disabled={field.disabled}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{field.min || 0}</span>
                  <span className="font-medium text-foreground">
                    {String(controllerField.value ?? field.min ?? 0)}
                  </span>
                  <span>{field.max || 100}</span>
                </div>
              </div>
            )}
          />
        );

      case 'hidden':
        return <input type="hidden" {...form.register(field.name)} />;

      default:
        return null;
    }
  };

  if (field.type === 'hidden') {
    return renderField();
  }

  return (
    <div className={cn('space-y-2', field.className)}>
      {field.label && field.type !== 'checkbox' && field.type !== 'switch' && (
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      {renderField()}

      {field.description && field.type !== 'checkbox' && field.type !== 'switch' && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-destructive flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {String(error.message || 'Campo inválido')}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// HOOK FOR DYNAMIC FORM
// ============================================

export function useDynamicForm(sections: FormSection[]) {
  const [formSections, setFormSections] = useState(sections);

  const addField = useCallback((sectionIndex: number, field: FieldConfig) => {
    setFormSections(prev => {
      const updated = [...prev];
      updated[sectionIndex].fields.push(field);
      return updated;
    });
  }, []);

  const removeField = useCallback((sectionIndex: number, fieldName: string) => {
    setFormSections(prev => {
      const updated = [...prev];
      updated[sectionIndex].fields = updated[sectionIndex].fields.filter(
        f => f.name !== fieldName
      );
      return updated;
    });
  }, []);

  const updateField = useCallback((
    sectionIndex: number,
    fieldName: string,
    updates: Partial<FieldConfig>
  ) => {
    setFormSections(prev => {
      const updated = [...prev];
      const fieldIndex = updated[sectionIndex].fields.findIndex(
        f => f.name === fieldName
      );
      if (fieldIndex !== -1) {
        updated[sectionIndex].fields[fieldIndex] = {
          ...updated[sectionIndex].fields[fieldIndex],
          ...updates
        };
      }
      return updated;
    });
  }, []);

  return {
    sections: formSections,
    addField,
    removeField,
    updateField
  };
}
