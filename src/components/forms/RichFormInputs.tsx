import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, Check, X, AlertCircle, Info, 
  Calendar, Clock, Upload, Image as ImageIcon, 
  File, Trash2, Plus, Minus, ChevronDown,
  Copy, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// ============================================
// PASSWORD INPUT WITH STRENGTH INDICATOR
// ============================================

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  showStrength?: boolean;
  minStrength?: number;
  className?: string;
  error?: string;
}

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

function calculateStrength(password: string): { score: number; strength: PasswordStrength; feedback: string[] } {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 1;
  else feedback.push('Mínimo de 8 caracteres');

  if (password.length >= 12) score += 1;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  else feedback.push('Letras maiúsculas e minúsculas');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Pelo menos um número');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Caractere especial (!@#$%...)');

  const strength: PasswordStrength = 
    score <= 1 ? 'weak' :
    score <= 2 ? 'fair' :
    score <= 3 ? 'good' : 'strong';

  return { score, strength, feedback };
}

export function PasswordInput({
  value,
  onChange,
  label = 'Senha',
  placeholder = 'Digite sua senha',
  showStrength = true,
  minStrength = 3,
  className,
  error,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { score, strength, feedback } = calculateStrength(value);

  const strengthColors = {
    weak: 'bg-destructive',
    fair: 'bg-warning',
    good: 'bg-blue-500',
    strong: 'bg-success',
  };

  const strengthLabels = {
    weak: 'Fraca',
    fair: 'Razoável',
    good: 'Boa',
    strong: 'Forte',
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "pr-10",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Strength indicator */}
      {showStrength && value && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          {/* Progress bar */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  level <= score ? strengthColors[strength] : 'bg-muted'
                )}
              />
            ))}
          </div>

          {/* Label and feedback */}
          <div className="flex items-center justify-between text-xs">
            <span className={cn(
              "font-medium",
              strength === 'weak' && "text-destructive",
              strength === 'fair' && "text-warning",
              strength === 'good' && "text-blue-500",
              strength === 'strong' && "text-success"
            )}>
              Força: {strengthLabels[strength]}
            </span>
            
            {isFocused && feedback.length > 0 && (
              <span className="text-muted-foreground">
                Falta: {feedback[0]}
              </span>
            )}
          </div>
        </motion.div>
      )}

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================
// NUMBER INPUT WITH INCREMENT/DECREMENT
// ============================================

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  className?: string;
  disabled?: boolean;
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  label,
  unit,
  className,
  disabled = false,
}: NumberInputProps) {
  const increment = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    onChange(Math.max(min, Math.min(max, newValue)));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={decrement}
          disabled={disabled || value <= min}
          className="h-10 w-10"
        >
          <Minus className="w-4 h-4" />
        </Button>

        <div className="relative flex-1">
          <Input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className="text-center pr-10"
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {unit}
            </span>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={increment}
          disabled={disabled || value >= max}
          className="h-10 w-10"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================
// FILE UPLOAD INPUT
// ============================================

interface FileUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
  description?: string;
  preview?: boolean;
  className?: string;
}

export function FileUpload({
  value,
  onChange,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  label = 'Upload de arquivo',
  description = 'Arraste ou clique para selecionar',
  preview = true,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value && preview && value.type.startsWith('image/')) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [value, preview]);

  const handleFile = (file: File) => {
    setError(null);

    if (file.size > maxSize) {
      setError(`Arquivo muito grande. Máximo: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragging && "border-primary bg-primary/10",
          error && "border-destructive",
          value && "border-success bg-success/5"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="flex items-center gap-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{value?.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(value?.size || 0)}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ) : value ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <File className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{value.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(value.size)}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">{description}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Máximo: {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================
// COPY INPUT
// ============================================

interface CopyInputProps {
  value: string;
  label?: string;
  className?: string;
  onCopy?: () => void;
}

export function CopyInput({ value, label, className, onCopy }: CopyInputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <div className="flex gap-2">
        <Input
          value={value}
          readOnly
          className="font-mono text-sm bg-muted"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleCopy}
          className="shrink-0"
        >
          {copied ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================
// OTP INPUT
// ============================================

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  label,
  error,
  className,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;

    const newValue = value.split('');
    newValue[index] = char;
    const joined = newValue.join('').slice(0, length);
    onChange(joined);

    // Auto focus next
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Trigger complete
    if (joined.length === length) {
      onComplete?.(joined);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    
    if (pasted.length === length) {
      onComplete?.(pasted);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <div className="flex gap-2 justify-center">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              "w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all",
              "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
              error && "border-destructive",
              value[index] && "border-primary bg-primary/5"
            )}
          />
        ))}
      </div>

      {error && (
        <p className="text-xs text-destructive text-center flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

export default PasswordInput;
