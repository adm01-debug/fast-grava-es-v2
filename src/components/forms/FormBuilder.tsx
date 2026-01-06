// Dynamic Form Builder with Validation
import React, { useState, useCallback, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus, Trash2, GripVertical, Eye, EyeOff, Copy, Settings,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle, Info, Save,
  FileText, Type, Hash, Calendar, List, ToggleLeft, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// Types
type FieldType = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'switch' | 'date' | 'file' | 'radio';

interface FieldOption {
  label: string;
  value: string;
}

interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom';
  value?: any;
  message: string;
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: ValidationRule[];
  conditional?: {
    field: string;
    value: any;
    operator?: '=' | '!=' | '>' | '<' | 'contains';
  };
  grid?: {
    cols?: number;
    span?: number;
  };
  disabled?: boolean;
  hidden?: boolean;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

interface FormConfig {
  id: string;
  title: string;
  description?: string;
  sections: FormSection[];
  submitLabel?: string;
  layout?: 'default' | 'compact' | 'wizard';
}

// Field Type Icons
const fieldTypeIcons: Record<FieldType, React.ElementType> = {
  text: Type,
  email: FileText,
  password: EyeOff,
  number: Hash,
  textarea: FileText,
  select: List,
  checkbox: CheckCircle,
  switch: ToggleLeft,
  date: Calendar,
  file: Upload,
  radio: List
};

// Build Zod schema from field config
function buildZodSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach(field => {
    let schema: z.ZodTypeAny;

    switch (field.type) {
      case 'number':
        schema = z.coerce.number();
        break;
      case 'checkbox':
      case 'switch':
        schema = z.boolean();
        break;
      case 'date':
        schema = z.string();
        break;
      case 'email':
        schema = z.string().email('Email inválido');
        break;
      default:
        schema = z.string();
    }

    // Apply validation rules
    field.validation?.forEach(rule => {
      switch (rule.type) {
        case 'required':
          if (field.type === 'checkbox' || field.type === 'switch') {
            schema = (schema as z.ZodBoolean).refine(val => val === true, { message: rule.message });
          } else {
            schema = (schema as z.ZodString).min(1, rule.message);
          }
          break;
        case 'min':
          if (field.type === 'number') {
            schema = (schema as z.ZodNumber).min(rule.value, rule.message);
          }
          break;
        case 'max':
          if (field.type === 'number') {
            schema = (schema as z.ZodNumber).max(rule.value, rule.message);
          }
          break;
        case 'minLength':
          schema = (schema as z.ZodString).min(rule.value, rule.message);
          break;
        case 'maxLength':
          schema = (schema as z.ZodString).max(rule.value, rule.message);
          break;
        case 'pattern':
          schema = (schema as z.ZodString).regex(new RegExp(rule.value), rule.message);
          break;
      }
    });

    // Make optional if not required
    const isRequired = field.validation?.some(r => r.type === 'required');
    if (!isRequired) {
      schema = schema.optional();
    }

    shape[field.name] = schema;
  });

  return z.object(shape);
}

// Dynamic Form Component
interface DynamicFormProps {
  config: FormConfig;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  defaultValues?: Record<string, any>;
  isLoading?: boolean;
  className?: string;
}

export function DynamicForm({ config, onSubmit, defaultValues, isLoading, className }: DynamicFormProps) {
  const allFields = config.sections.flatMap(s => s.fields);
  const schema = useMemo(() => buildZodSchema(allFields), [allFields]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || allFields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue ?? '';
      return acc;
    }, {} as Record<string, any>)
  });

  const watchedValues = form.watch();

  // Check if field should be visible based on conditional
  const isFieldVisible = useCallback((field: FormField) => {
    if (field.hidden) return false;
    if (!field.conditional) return true;

    const { field: condField, value, operator = '=' } = field.conditional;
    const fieldValue = watchedValues[condField];

    switch (operator) {
      case '=': return fieldValue === value;
      case '!=': return fieldValue !== value;
      case '>': return fieldValue > value;
      case '<': return fieldValue < value;
      case 'contains': return String(fieldValue).includes(value);
      default: return true;
    }
  }, [watchedValues]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      {config.title && (
        <div>
          <h2 className="text-xl font-semibold">{config.title}</h2>
          {config.description && (
            <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
          )}
        </div>
      )}

      {config.sections.map((section, sectionIndex) => (
        <FormSectionComponent
          key={section.id}
          section={section}
          form={form}
          isFieldVisible={isFieldVisible}
          sectionIndex={sectionIndex}
        />
      ))}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Limpar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {config.submitLabel || 'Salvar'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// Form Section Component
interface FormSectionComponentProps {
  section: FormSection;
  form: UseFormReturn<any>;
  isFieldVisible: (field: FormField) => boolean;
  sectionIndex: number;
}

function FormSectionComponent({ section, form, isFieldVisible, sectionIndex }: FormSectionComponentProps) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen !== false);

  const content = (
    <div className="grid gap-4" style={{ 
      gridTemplateColumns: `repeat(${Math.max(...section.fields.map(f => f.grid?.cols || 1), 1)}, minmax(0, 1fr))` 
    }}>
      <AnimatePresence>
        {section.fields.filter(isFieldVisible).map((field, fieldIndex) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: fieldIndex * 0.05 }}
            style={{ gridColumn: `span ${field.grid?.span || 1}` }}
          >
            <FormFieldComponent field={field} form={form} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  if (section.collapsible) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>{content}</CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  return (
    <Card>
      {section.title && (
        <CardHeader>
          <CardTitle className="text-base">{section.title}</CardTitle>
          {section.description && (
            <CardDescription>{section.description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent>{content}</CardContent>
    </Card>
  );
}

// Form Field Component
interface FormFieldComponentProps {
  field: FormField;
  form: UseFormReturn<any>;
}

function FormFieldComponent({ field, form }: FormFieldComponentProps) {
  const error = form.formState.errors[field.name];
  const isRequired = field.validation?.some(v => v.type === 'required');

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={field.name} className={cn(error && 'text-destructive')}>
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
        {field.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{field.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <Controller
        name={field.name}
        control={form.control}
        render={({ field: formField }) => (
          <FieldInput field={field} formField={formField} error={!!error} />
        )}
      />

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive flex items-center gap-1"
        >
          <AlertCircle className="h-3 w-3" />
          {error.message as string}
        </motion.p>
      )}
    </div>
  );
}

// Field Input Component
interface FieldInputProps {
  field: FormField;
  formField: any;
  error: boolean;
}

function FieldInput({ field, formField, error }: FieldInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          {...formField}
          id={field.name}
          placeholder={field.placeholder}
          disabled={field.disabled}
          className={cn(error && 'border-destructive')}
        />
      );

    case 'select':
      return (
        <Select
          value={formField.value}
          onValueChange={formField.onChange}
          disabled={field.disabled}
        >
          <SelectTrigger className={cn(error && 'border-destructive')}>
            <SelectValue placeholder={field.placeholder || 'Selecione...'} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'checkbox':
      return (
        <div className="flex items-center gap-2">
          <Checkbox
            id={field.name}
            checked={formField.value}
            onCheckedChange={formField.onChange}
            disabled={field.disabled}
          />
          {field.placeholder && (
            <Label htmlFor={field.name} className="text-sm font-normal cursor-pointer">
              {field.placeholder}
            </Label>
          )}
        </div>
      );

    case 'switch':
      return (
        <div className="flex items-center gap-2">
          <Switch
            id={field.name}
            checked={formField.value}
            onCheckedChange={formField.onChange}
            disabled={field.disabled}
          />
          {field.placeholder && (
            <Label htmlFor={field.name} className="text-sm font-normal cursor-pointer">
              {field.placeholder}
            </Label>
          )}
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          {field.options?.map(option => (
            <div key={option.value} className="flex items-center gap-2">
              <input
                type="radio"
                id={`${field.name}-${option.value}`}
                name={field.name}
                value={option.value}
                checked={formField.value === option.value}
                onChange={() => formField.onChange(option.value)}
                disabled={field.disabled}
                className="h-4 w-4"
              />
              <Label htmlFor={`${field.name}-${option.value}`} className="text-sm font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      );

    case 'password':
      return (
        <div className="relative">
          <Input
            {...formField}
            id={field.name}
            type={showPassword ? 'text' : 'password'}
            placeholder={field.placeholder}
            disabled={field.disabled}
            className={cn('pr-10', error && 'border-destructive')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      );

    case 'date':
      return (
        <Input
          {...formField}
          id={field.name}
          type="date"
          placeholder={field.placeholder}
          disabled={field.disabled}
          className={cn(error && 'border-destructive')}
        />
      );

    case 'file':
      return (
        <Input
          id={field.name}
          type="file"
          onChange={(e) => formField.onChange(e.target.files?.[0])}
          disabled={field.disabled}
          className={cn(error && 'border-destructive')}
        />
      );

    default:
      return (
        <Input
          {...formField}
          id={field.name}
          type={field.type}
          placeholder={field.placeholder}
          disabled={field.disabled}
          className={cn(error && 'border-destructive')}
        />
      );
  }
}

// Form Preview Component
interface FormPreviewProps {
  config: FormConfig;
}

export function FormPreview({ config }: FormPreviewProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm">Preview</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <DynamicForm
          config={config}
          onSubmit={(data) => console.log('Preview submit:', data)}
        />
      </CardContent>
    </Card>
  );
}

// Export field types for external use
export const FIELD_TYPES: { value: FieldType; label: string; icon: React.ElementType }[] = [
  { value: 'text', label: 'Texto', icon: Type },
  { value: 'email', label: 'Email', icon: FileText },
  { value: 'password', label: 'Senha', icon: EyeOff },
  { value: 'number', label: 'Número', icon: Hash },
  { value: 'textarea', label: 'Texto longo', icon: FileText },
  { value: 'select', label: 'Seleção', icon: List },
  { value: 'checkbox', label: 'Checkbox', icon: CheckCircle },
  { value: 'switch', label: 'Switch', icon: ToggleLeft },
  { value: 'date', label: 'Data', icon: Calendar },
  { value: 'file', label: 'Arquivo', icon: Upload },
  { value: 'radio', label: 'Radio', icon: List }
];

// Helper to create form config
export function createFormConfig(
  title: string,
  fields: Omit<FormField, 'id'>[],
  options?: Partial<FormConfig>
): FormConfig {
  return {
    id: `form-${Date.now()}`,
    title,
    sections: [{
      id: 'main',
      title: '',
      fields: fields.map((f, i) => ({ ...f, id: `field-${i}` }))
    }],
    ...options
  };
}
