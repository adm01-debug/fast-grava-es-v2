import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

// ===== VALIDATION STATUS =====
type ValidationStatus = "idle" | "validating" | "valid" | "invalid" | "warning";

interface ValidationResult {
  status: ValidationStatus;
  message?: string;
}

// ===== VALIDATED INPUT =====
interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  validate?: (value: string) => ValidationResult | Promise<ValidationResult>;
  debounceMs?: number;
  showSuccessState?: boolean;
  hint?: string;
}

export function ValidatedInput({
  label,
  validate,
  debounceMs = 300,
  showSuccessState = true,
  hint,
  className,
  onChange,
  ...props
}: ValidatedInputProps) {
  const [value, setValue] = useState(props.value?.toString() || props.defaultValue?.toString() || "");
  const [validation, setValidation] = useState<ValidationResult>({ status: "idle" });
  const [isTouched, setIsTouched] = useState(false);

  const runValidation = useCallback(async (val: string) => {
    if (!validate || !val) {
      setValidation({ status: "idle" });
      return;
    }

    setValidation({ status: "validating" });
    
    try {
      const result = await validate(val);
      setValidation(result);
    } catch {
      setValidation({ status: "invalid", message: "Erro na validação" });
    }
  }, [validate]);

  useEffect(() => {
    if (!isTouched) return;

    const timer = setTimeout(() => {
      runValidation(value);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs, isTouched, runValidation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsTouched(true);
    runValidation(e.target.value);
    props.onBlur?.(e);
  };

  const statusIcon = {
    idle: null,
    validating: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
    valid: showSuccessState ? <CheckCircle2 className="h-4 w-4 text-success" /> : null,
    invalid: <XCircle className="h-4 w-4 text-destructive" />,
    warning: <AlertCircle className="h-4 w-4 text-warning" />,
  };

  const borderColor = {
    idle: "",
    validating: "border-muted-foreground/50",
    valid: showSuccessState ? "border-success focus:ring-success/20" : "",
    invalid: "border-destructive focus:ring-destructive/20",
    warning: "border-warning focus:ring-warning/20",
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          {...props}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            "pr-10 transition-colors",
            borderColor[validation.status],
            className
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <AnimatePresence mode="wait">
            {statusIcon[validation.status] && (
              <motion.div
                key={validation.status}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.15 }}
              >
                {statusIcon[validation.status]}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {validation.message && isTouched && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "text-xs",
              validation.status === "valid" && "text-success",
              validation.status === "invalid" && "text-destructive",
              validation.status === "warning" && "text-warning"
            )}
          >
            {validation.message}
          </motion.p>
        )}
        {hint && !validation.message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===== COMMON VALIDATORS =====
export const validators = {
  required: (message = "Campo obrigatório"): ((value: string) => ValidationResult) => 
    (value: string) => ({
      status: value.trim() ? "valid" : "invalid",
      message: value.trim() ? undefined : message,
    }),

  email: (message = "E-mail inválido"): ((value: string) => ValidationResult) =>
    (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(value);
      return {
        status: isValid ? "valid" : "invalid",
        message: isValid ? "E-mail válido" : message,
      };
    },

  minLength: (min: number, message?: string): ((value: string) => ValidationResult) =>
    (value: string) => ({
      status: value.length >= min ? "valid" : "invalid",
      message: value.length >= min ? undefined : message || `Mínimo ${min} caracteres`,
    }),

  maxLength: (max: number, message?: string): ((value: string) => ValidationResult) =>
    (value: string) => ({
      status: value.length <= max ? "valid" : "warning",
      message: value.length <= max ? undefined : message || `Máximo ${max} caracteres`,
    }),

  pattern: (regex: RegExp, message: string): ((value: string) => ValidationResult) =>
    (value: string) => ({
      status: regex.test(value) ? "valid" : "invalid",
      message: regex.test(value) ? undefined : message,
    }),

  password: (value: string): ValidationResult => {
    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    const score = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (score <= 2) {
      return { status: "invalid", message: "Senha fraca - adicione mais complexidade" };
    }
    if (score <= 3) {
      return { status: "warning", message: "Senha razoável - pode ser mais forte" };
    }
    return { status: "valid", message: "Senha forte!" };
  },

  phone: (value: string): ValidationResult => {
    const cleaned = value.replace(/\D/g, "");
    const isValid = cleaned.length >= 10 && cleaned.length <= 11;
    return {
      status: isValid ? "valid" : "invalid",
      message: isValid ? "Telefone válido" : "Telefone inválido",
    };
  },

  cpf: (value: string): ValidationResult => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length !== 11) {
      return { status: "invalid", message: "CPF deve ter 11 dígitos" };
    }
    // Basic validation (real implementation would check digits)
    return { status: "valid", message: "CPF válido" };
  },

  cnpj: (value: string): ValidationResult => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length !== 14) {
      return { status: "invalid", message: "CNPJ deve ter 14 dígitos" };
    }
    return { status: "valid", message: "CNPJ válido" };
  },

  combine: (...validators: ((value: string) => ValidationResult)[]): ((value: string) => ValidationResult) =>
    (value: string) => {
      for (const validator of validators) {
        const result = validator(value);
        if (result.status === "invalid") return result;
        if (result.status === "warning") return result;
      }
      return { status: "valid" };
    },
};

// ===== ASYNC VALIDATORS =====
export const asyncValidators = {
  checkAvailability: (
    checkFn: (value: string) => Promise<boolean>,
    messages = { available: "Disponível!", unavailable: "Já está em uso" }
  ): ((value: string) => Promise<ValidationResult>) =>
    async (value: string): Promise<ValidationResult> => {
      const isAvailable = await checkFn(value);
      return {
        status: isAvailable ? "valid" : "invalid",
        message: isAvailable ? messages.available : messages.unavailable,
      };
    },
};

// ===== FORM FIELD WITH ERROR =====
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, required, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-destructive flex items-center gap-1"
          >
            <XCircle className="h-3 w-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
