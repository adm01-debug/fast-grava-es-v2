import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, ChevronUp, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

// #45 - Multi-Select Avançado

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxSelected?: number;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecionar...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum resultado encontrado.',
  maxSelected,
  className,
  disabled
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedOptions = options.filter(opt => value.includes(opt.value));

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      if (maxSelected && value.length >= maxSelected) return;
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between h-auto min-h-10',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedOptions.map(opt => (
                <Badge
                  key={opt.value}
                  variant="secondary"
                  className="gap-1"
                >
                  {opt.icon}
                  {opt.label}
                  <button
                    type="button"
                    onClick={(e) => removeOption(opt.value, e)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {selectedOptions.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="p-1 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {open ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map(option => {
                const isSelected = value.includes(option.value);
                const isDisabled = option.disabled || 
                  (maxSelected && !isSelected && value.length >= maxSelected);

                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => !isDisabled && toggleOption(option.value)}
                    className={cn(
                      'cursor-pointer',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className={cn(
                      'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                      isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50'
                    )}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                      {option.description && (
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Simpler checkbox list version
export function CheckboxList({
  options,
  value,
  onChange,
  columns = 1,
  className
}: {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3'
  };

  return (
    <div className={cn('grid gap-2', gridCols[columns], className)}>
      {options.map(option => {
        const isSelected = value.includes(option.value);
        return (
          <label
            key={option.value}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
              isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
              option.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className={cn(
              'flex h-5 w-5 items-center justify-center rounded border-2 transition-colors',
              isSelected 
                ? 'border-primary bg-primary text-primary-foreground' 
                : 'border-muted-foreground'
            )}>
              {isSelected && <Check className="h-3 w-3" />}
            </div>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => !option.disabled && toggleOption(option.value)}
              disabled={option.disabled}
              className="sr-only"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {option.icon}
                <span className="font-medium">{option.label}</span>
              </div>
              {option.description && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}

// Searchable select single
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecionar...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum resultado.',
  className
}: {
  options: Option[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn('w-full justify-between', className)}
        >
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon}
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value === value ? null : option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.icon}
                  <span className="ml-2">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
