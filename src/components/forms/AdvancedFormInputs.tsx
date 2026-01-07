import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// ENHANCED SELECT WITH SEARCH
// ============================================

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface EnhancedSelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  creatable?: boolean;
  onCreate?: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function EnhancedSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  searchable = false,
  creatable = false,
  onCreate,
  label,
  error,
  disabled = false,
  className,
}: EnhancedSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = searchable
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(search.toLowerCase()) ||
        opt.description?.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const showCreate = creatable && search && !filteredOptions.some(
    opt => opt.label.toLowerCase() === search.toLowerCase()
  );

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
    setSearch('');
  };

  const handleCreate = () => {
    onCreate?.(search);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 transition-all text-left",
          isOpen ? "border-primary ring-2 ring-primary/20" : "border-muted hover:border-muted-foreground/30",
          error && "border-destructive",
          disabled && "opacity-50 cursor-not-allowed bg-muted"
        )}
      >
        {selectedOption ? (
          <div className="flex items-center gap-2">
            {selectedOption.icon}
            <span>{selectedOption.label}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 py-2 bg-popover border rounded-xl shadow-xl z-50 max-h-64 overflow-hidden"
            >
              {/* Search */}
              {searchable && (
                <div className="px-3 pb-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="overflow-y-auto max-h-48">
                {filteredOptions.length === 0 && !showCreate && (
                  <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                    Nenhum resultado encontrado
                  </div>
                )}

                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left",
                      option.value === value && "bg-primary/10 text-primary",
                      option.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
                    )}
                  >
                    {option.icon && (
                      <div className="w-5 h-5 flex items-center justify-center">
                        {option.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {option.description}
                        </div>
                      )}
                    </div>
                    {option.value === value && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}

                {/* Create new option */}
                {showCreate && (
                  <button
                    onClick={handleCreate}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left text-primary"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Criar "{search}"</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}

// ============================================
// MULTI SELECT / TAG INPUT
// ============================================

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  maxTags?: number;
  label?: string;
  error?: string;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = 'Digite e pressione Enter...',
  maxTags,
  label,
  error,
  className,
}: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed)) return;
    if (maxTags && value.length >= maxTags) return;
    
    onChange([...value, trimmed]);
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="block text-sm font-medium">{label}</label>}
      
      <div className="relative">
        <div className={cn(
          "flex flex-wrap gap-2 p-3 rounded-xl border-2 transition-all min-h-[48px]",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
          error && "border-destructive"
        )}>
          {/* Tags */}
          <AnimatePresence mode="popLayout">
            {value.map((tag) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>

          {/* Input */}
          {(!maxTags || value.length < maxTags) && (
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={value.length === 0 ? placeholder : ''}
              className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
            />
          )}
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {showSuggestions && filteredSuggestions.length > 0 && input && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 py-2 bg-popover border rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto"
            >
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addTag(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-muted transition-colors text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Counter */}
      {maxTags && (
        <p className="text-xs text-muted-foreground text-right">
          {value.length} / {maxTags}
        </p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ============================================
// RATING INPUT
// ============================================

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}

export function RatingInput({
  value,
  onChange,
  max = 5,
  size = 'md',
  label,
  showValue = true,
  disabled = false,
  className,
}: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="block text-sm font-medium">{label}</label>}
      
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayValue;

          return (
            <motion.button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => onChange(starValue)}
              onMouseEnter={() => !disabled && setHoverValue(starValue)}
              onMouseLeave={() => setHoverValue(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "transition-colors",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className={cn(
                  sizeClasses[size],
                  isFilled ? "fill-warning text-warning" : "fill-none text-muted-foreground"
                )}
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </motion.button>
          );
        })}

        {showValue && (
          <span className="ml-2 text-sm font-medium text-muted-foreground">
            {value} / {max}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// TOGGLE GROUP
// ============================================

interface ToggleOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ToggleGroupProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ToggleGroup({
  options,
  value,
  onChange,
  label,
  size = 'md',
  className,
}: ToggleGroupProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="block text-sm font-medium">{label}</label>}
      
      <div className="inline-flex rounded-xl bg-muted p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-lg font-medium transition-all",
              sizeClasses[size],
              option.value === value
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.value === value && (
              <motion.div
                layoutId="toggle-active"
                className="absolute inset-0 bg-background rounded-lg shadow-sm"
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {option.icon}
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default EnhancedSelect;
