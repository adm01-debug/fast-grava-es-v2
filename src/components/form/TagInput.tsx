import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxLength?: number;
  suggestions?: string[];
  allowCustom?: boolean;
  disabled?: boolean;
  className?: string;
  tagClassName?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onValidate?: (tag: string) => string | null;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  placeholder = 'Adicionar tag...',
  maxTags,
  maxLength = 30,
  suggestions = [],
  allowCustom = true,
  disabled = false,
  className = '',
  tagClassName = '',
  variant = 'default',
  size = 'md',
  onValidate,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions
  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(s)
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    
    if (!trimmedTag) return;
    if (value.includes(trimmedTag)) {
      setError('Tag já existe');
      return;
    }
    if (maxTags && value.length >= maxTags) {
      setError(`Máximo de ${maxTags} tags`);
      return;
    }
    if (trimmedTag.length > maxLength) {
      setError(`Máximo de ${maxLength} caracteres`);
      return;
    }

    // Custom validation
    if (onValidate) {
      const validationError = onValidate(trimmedTag);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    onChange([...value, trimmedTag]);
    setInputValue('');
    setError(null);
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue && allowCustom) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    outline: 'border border-input bg-background',
    secondary: 'bg-secondary text-secondary-foreground',
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        className={cn(
          'flex flex-wrap gap-2 p-2 rounded-md border border-input bg-background',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Tags */}
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className={cn(
              'inline-flex items-center gap-1',
              sizeClasses[size],
              variantClasses[variant],
              tagClassName
            )}
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}

        {/* Input */}
        {(!maxTags || value.length < maxTags) && !disabled && (
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={disabled}
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 py-1 bg-popover border rounded-md shadow-lg">
          {filteredSuggestions.slice(0, 10).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className={cn(
                'w-full px-3 py-2 text-left text-sm',
                'hover:bg-muted transition-colors',
                'flex items-center justify-between'
              )}
            >
              {suggestion}
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {/* Counter */}
      {maxTags && (
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {value.length}/{maxTags}
        </p>
      )}
    </div>
  );
};

// Preset tag selector
interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  options: string[];
  multiple?: boolean;
  className?: string;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  value,
  onChange,
  options,
  multiple = true,
  className = '',
}) => {
  const toggleTag = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange(multiple ? [...value, tag] : [tag]);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const isSelected = value.includes(option);
        return (
          <Button
            key={option}
            type="button"
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleTag(option)}
            className="gap-1"
          >
            {isSelected && <Check className="h-3 w-3" />}
            {option}
          </Button>
        );
      })}
    </div>
  );
};

// Color tag input
interface ColorTag {
  label: string;
  color: string;
}

interface ColorTagInputProps {
  value: ColorTag[];
  onChange: (tags: ColorTag[]) => void;
  presetColors?: string[];
  className?: string;
}

export const ColorTagInput: React.FC<ColorTagInputProps> = ({
  value,
  onChange,
  presetColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'],
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedColor, setSelectedColor] = useState(presetColors[0]);

  const addTag = () => {
    if (!inputValue.trim()) return;
    if (value.some((t) => t.label === inputValue.trim())) return;

    onChange([...value, { label: inputValue.trim(), color: selectedColor }]);
    setInputValue('');
  };

  const removeTag = (label: string) => {
    onChange(value.filter((t) => t.label !== label));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <Badge
            key={tag.label}
            style={{ backgroundColor: tag.color }}
            className="text-white gap-1"
          >
            {tag.label}
            <button
              type="button"
              onClick={() => removeTag(tag.label)}
              className="hover:opacity-75"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="flex gap-1">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={cn(
                'w-6 h-6 rounded-full transition-transform',
                selectedColor === color && 'ring-2 ring-offset-2 ring-ring scale-110'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          placeholder="Nova tag..."
          className="flex-1"
        />
        <Button onClick={addTag} size="icon" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
