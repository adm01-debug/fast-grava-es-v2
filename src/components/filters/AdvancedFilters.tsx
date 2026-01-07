import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Filter, X, ChevronDown, Plus, Trash2, 
  Save, RotateCcw, Check 
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// #48 - Sistema de Filtros Avançados

type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 
  'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in' | 'notIn' | 'isEmpty' | 'isNotEmpty';

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';
  options?: { value: string; label: string }[];
  operators?: FilterOperator[];
}

interface FilterValue {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

interface AdvancedFiltersProps {
  fields: FilterField[];
  filters: FilterValue[];
  onChange: (filters: FilterValue[]) => void;
  onClear?: () => void;
  className?: string;
}

const operatorLabels: Record<FilterOperator, string> = {
  equals: 'Igual a',
  contains: 'Contém',
  startsWith: 'Começa com',
  endsWith: 'Termina com',
  gt: 'Maior que',
  gte: 'Maior ou igual',
  lt: 'Menor que',
  lte: 'Menor ou igual',
  between: 'Entre',
  in: 'Em',
  notIn: 'Não em',
  isEmpty: 'Está vazio',
  isNotEmpty: 'Não está vazio'
};

const defaultOperators: Record<FilterField['type'], FilterOperator[]> = {
  text: ['contains', 'equals', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'],
  number: ['equals', 'gt', 'gte', 'lt', 'lte', 'between'],
  date: ['equals', 'gt', 'gte', 'lt', 'lte', 'between'],
  select: ['equals', 'in', 'notIn'],
  multiselect: ['in', 'notIn'],
  boolean: ['equals']
};

export function AdvancedFilters({
  fields,
  filters,
  onChange,
  onClear,
  className
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);

  const addFilter = () => {
    const firstField = fields[0];
    const operators = firstField.operators || defaultOperators[firstField.type];
    onChange([
      ...filters,
      { field: firstField.key, operator: operators[0], value: '' }
    ]);
  };

  const updateFilter = (index: number, updates: Partial<FilterValue>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    onChange(newFilters);
  };

  const removeFilter = (index: number) => {
    onChange(filters.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    onChange([]);
    if (onClear) onClear();
  };

  const getFieldConfig = (fieldKey: string) => {
    return fields.find(f => f.key === fieldKey);
  };

  const activeCount = filters.filter(f => f.value !== '' && f.value !== null).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('gap-2', className)}>
          <Filter className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeCount}
            </Badge>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtros</h4>
            <div className="flex gap-2">
              {filters.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={addFilter}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>

          {filters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum filtro aplicado. Clique em "Adicionar" para criar um filtro.
            </p>
          ) : (
            <div className="space-y-3">
              {filters.map((filter, index) => {
                const fieldConfig = getFieldConfig(filter.field);
                const operators = fieldConfig?.operators || 
                  defaultOperators[fieldConfig?.type || 'text'];

                return (
                  <div key={index} className="flex items-start gap-2">
                    {/* Field selector */}
                    <Select
                      value={filter.field}
                      onValueChange={(value) => {
                        const newField = getFieldConfig(value);
                        const newOperators = newField?.operators || 
                          defaultOperators[newField?.type || 'text'];
                        updateFilter(index, { 
                          field: value, 
                          operator: newOperators[0],
                          value: '' 
                        });
                      }}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.map(field => (
                          <SelectItem key={field.key} value={field.key}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Operator selector */}
                    <Select
                      value={filter.operator}
                      onValueChange={(value) => 
                        updateFilter(index, { operator: value as FilterOperator })
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map(op => (
                          <SelectItem key={op} value={op}>
                            {operatorLabels[op]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Value input */}
                    {!['isEmpty', 'isNotEmpty'].includes(filter.operator) && (
                      <div className="flex-1">
                        <FilterValueInput
                          field={fieldConfig!}
                          operator={filter.operator}
                          value={filter.value}
                          onChange={(value) => updateFilter(index, { value })}
                        />
                      </div>
                    )}

                    {/* Remove button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFilter(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t">
            <Button onClick={() => setOpen(false)}>
              <Check className="h-4 w-4 mr-1" />
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Filter value input component
function FilterValueInput({
  field,
  operator,
  value,
  onChange
}: {
  field: FilterField;
  operator: FilterOperator;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (field.type === 'select' && field.options) {
    return (
      <Select
        value={String(value || '')}
        onValueChange={onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          {field.options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === 'boolean') {
    return (
      <Select
        value={String(value || '')}
        onValueChange={(v) => onChange(v === 'true')}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Sim</SelectItem>
          <SelectItem value="false">Não</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  if (field.type === 'number') {
    return (
      <Input
        type="number"
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
        placeholder="Valor..."
      />
    );
  }

  if (field.type === 'date') {
    return (
      <Input
        type="date"
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <Input
      type="text"
      value={String(value || '')}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Valor..."
    />
  );
}

// Active filters display
export function ActiveFilters({
  filters,
  fields,
  onRemove,
  onClear,
  className
}: {
  filters: FilterValue[];
  fields: FilterField[];
  onRemove: (index: number) => void;
  onClear: () => void;
  className?: string;
}) {
  if (filters.length === 0) return null;

  const getFieldLabel = (key: string) => {
    return fields.find(f => f.key === key)?.label || key;
  };

  const formatValue = (filter: FilterValue) => {
    const field = fields.find(f => f.key === filter.field);
    if (field?.type === 'select' && field.options) {
      const option = field.options.find(o => o.value === filter.value);
      return option?.label || filter.value;
    }
    if (field?.type === 'boolean') {
      return filter.value ? 'Sim' : 'Não';
    }
    return String(filter.value);
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground">Filtros ativos:</span>
      {filters.map((filter, index) => (
        <Badge key={index} variant="secondary" className="gap-1">
          {getFieldLabel(filter.field)} {operatorLabels[filter.operator]}{' '}
          {!['isEmpty', 'isNotEmpty'].includes(filter.operator) && (
            <strong>{String(formatValue(filter))}</strong>
          )}
          <button
            onClick={() => onRemove(index)}
            className="ml-1 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" onClick={onClear}>
        Limpar todos
      </Button>
    </div>
  );
}

// Quick filter chips
export function QuickFilters({
  options,
  selected,
  onChange,
  className
}: {
  options: { value: string; label: string; icon?: React.ReactNode }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map(option => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            onClick={() => toggle(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors',
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {option.icon}
            {option.label}
            {isSelected && <Check className="h-3 w-3" />}
          </button>
        );
      })}
    </div>
  );
}
