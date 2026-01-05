/**
 * Advanced Filters Component
 * 
 * @module components/AdvancedFilters
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Filter, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
}

export interface FilterValue {
  key: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike';
  value: unknown;
}

interface AdvancedFiltersProps {
  filters: FilterConfig[];
  values: FilterValue[];
  onChange: (values: FilterValue[]) => void;
  className?: string;
}

const OPERATORS = [
  { value: 'eq', label: 'Igual a' },
  { value: 'neq', label: 'Diferente de' },
  { value: 'gt', label: 'Maior que' },
  { value: 'gte', label: 'Maior ou igual' },
  { value: 'lt', label: 'Menor que' },
  { value: 'lte', label: 'Menor ou igual' },
  { value: 'like', label: 'Contém' },
  { value: 'ilike', label: 'Contém (sem case)' },
];

export function AdvancedFilters({
  filters,
  values,
  onChange,
  className,
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);

  const addFilter = () => {
    if (filters.length === 0) return;
    onChange([
      ...values,
      { key: filters[0].key, operator: 'eq', value: '' },
    ]);
  };

  const removeFilter = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<FilterValue>) => {
    onChange(
      values.map((v, i) => (i === index ? { ...v, ...updates } : v))
    );
  };

  const clearAll = () => {
    onChange([]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-2', className)}
        >
          <Filter className="h-4 w-4" />
          Filtros
          {values.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
              {values.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtros Avançados</h4>
            {values.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Limpar
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {values.map((filter, index) => (
              <div key={index} className="flex items-center gap-2">
                <Select
                  value={filter.key}
                  onValueChange={(v) => updateFilter(index, { key: v })}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filter.operator}
                  onValueChange={(v) =>
                    updateFilter(index, { operator: v as FilterValue['operator'] })
                  }
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  value={String(filter.value || '')}
                  onChange={(e) => updateFilter(index, { value: e.target.value })}
                  placeholder="Valor"
                  className="flex-1"
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFilter(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={addFilter}
          >
            <Plus className="h-4 w-4" />
            Adicionar Filtro
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default AdvancedFilters;
