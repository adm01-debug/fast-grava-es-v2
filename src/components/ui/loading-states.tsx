import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

// ===== LOADING SPINNER VARIANTS =====
interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
}

export function Spinner({ size = "md", className, label }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {label && (
        <span className="text-sm text-muted-foreground animate-pulse">{label}</span>
      )}
    </div>
  );
}

// ===== DOTS LOADING =====
interface DotsLoadingProps {
  className?: string;
  dotClassName?: string;
}

export function DotsLoading({ className, dotClassName }: DotsLoadingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn("h-2 w-2 rounded-full bg-primary", dotClassName)}
          animate={{
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ===== PULSE LOADING =====
interface PulseLoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PulseLoading({ className, size = "md" }: PulseLoadingProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <motion.div
        className={cn("absolute rounded-full bg-primary/30", sizeClasses[size])}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={cn("rounded-full bg-primary", sizeClasses[size])}
        style={{ transform: "scale(0.5)" }}
        animate={{
          scale: [0.5, 0.6, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// ===== PROGRESS BAR =====
interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "destructive";
  animated?: boolean;
}

export function ProgressBar({
  progress,
  className,
  showLabel = false,
  variant = "default",
  animated = true,
}: ProgressBarProps) {
  const variantClasses = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", variantClasses[variant])}
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-muted-foreground text-right">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  );
}

// ===== FULL PAGE LOADING =====
interface FullPageLoadingProps {
  message?: string;
  submessage?: string;
}

export function FullPageLoading({ message = "Carregando...", submessage }: FullPageLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <motion.div
            className="h-16 w-16 rounded-full border-4 border-primary/20"
            style={{ borderTopColor: "hsl(var(--primary))" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">{message}</p>
          {submessage && (
            <p className="mt-1 text-sm text-muted-foreground">{submessage}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ===== INLINE LOADING STATE =====
interface InlineLoadingProps {
  isLoading: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  className?: string;
}

export function InlineLoading({
  isLoading,
  isSuccess,
  isError,
  loadingText = "Carregando...",
  successText = "Concluído!",
  errorText = "Erro",
  className,
}: InlineLoadingProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="loading"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className={cn("flex items-center gap-2 text-muted-foreground", className)}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{loadingText}</span>
        </motion.div>
      )}
      {isSuccess && !isLoading && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className={cn("flex items-center gap-2 text-success", className)}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm">{successText}</span>
        </motion.div>
      )}
      {isError && !isLoading && (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className={cn("flex items-center gap-2 text-destructive", className)}
        >
          <XCircle className="h-4 w-4" />
          <span className="text-sm">{errorText}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ===== CONTENT PLACEHOLDER =====
interface ContentPlaceholderProps {
  className?: string;
  lines?: number;
  showAvatar?: boolean;
}

export function ContentPlaceholder({ className, lines = 3, showAvatar = false }: ContentPlaceholderProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="flex items-start gap-4">
        {showAvatar && (
          <div className="h-10 w-10 rounded-full bg-muted animate-skeleton" />
        )}
        <div className="flex-1 space-y-3">
          <div className="h-4 w-1/3 rounded bg-muted animate-skeleton" />
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-3 rounded bg-muted animate-skeleton",
                i === lines - 1 ? "w-2/3" : "w-full"
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== BUTTON LOADING STATE =====
interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export function ButtonLoading({ isLoading, children, loadingText }: ButtonLoadingProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {isLoading ? (
        <motion.span
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText && <span>{loadingText}</span>}
        </motion.span>
      ) : (
        <motion.span
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ===== STEP LOADING INDICATOR =====
interface StepLoadingProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepLoading({ steps, currentStep, className }: StepLoadingProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors",
                isCompleted && "bg-success text-success-foreground",
                isCurrent && "bg-primary text-primary-foreground",
                isPending && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : isCurrent ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                "text-sm transition-colors",
                isCompleted && "text-success",
                isCurrent && "text-foreground font-medium",
                isPending && "text-muted-foreground"
              )}
            >
              {step}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ===== DATA LOADING WRAPPER =====
interface DataLoadingWrapperProps {
  isLoading: boolean;
  isEmpty?: boolean;
  error?: Error | null;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  className?: string;
}

export function DataLoadingWrapper({
  isLoading,
  isEmpty,
  error,
  children,
  loadingComponent,
  emptyComponent,
  errorComponent,
  className,
}: DataLoadingWrapperProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        {loadingComponent || <Spinner size="lg" label="Carregando dados..." />}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
        {errorComponent || (
          <>
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium text-destructive">Erro ao carregar dados</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
        {emptyComponent || (
          <p className="text-muted-foreground">Nenhum dado encontrado</p>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
