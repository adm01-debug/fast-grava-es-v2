import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Undo2, Check, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type ToastType = "success" | "error" | "warning" | "info" | "default";

interface UndoableToast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
  onUndo?: () => void;
  undoLabel?: string;
}

interface ToastWithUndoProps extends UndoableToast {
  onDismiss: (id: string) => void;
}

const typeConfig: Record<
  ToastType,
  { icon: React.ReactNode; className: string; progressColor: string }
> = {
  success: {
    icon: <Check className="h-5 w-5 text-success" />,
    className: "border-success/30 bg-success/5",
    progressColor: "bg-success",
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 text-destructive" />,
    className: "border-destructive/30 bg-destructive/5",
    progressColor: "bg-destructive",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-warning" />,
    className: "border-warning/30 bg-warning/5",
    progressColor: "bg-warning",
  },
  info: {
    icon: <Info className="h-5 w-5 text-info" />,
    className: "border-info/30 bg-info/5",
    progressColor: "bg-info",
  },
  default: {
    icon: <Info className="h-5 w-5 text-muted-foreground" />,
    className: "border-border",
    progressColor: "bg-primary",
  },
};

function ToastItem({
  id,
  title,
  description,
  type = "default",
  duration = 5000,
  onUndo,
  undoLabel = "Desfazer",
  onDismiss,
}: ToastWithUndoProps) {
  const [progress, setProgress] = React.useState(100);
  const [isPaused, setIsPaused] = React.useState(false);
  const config = typeConfig[type];

  React.useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 100 / (duration / 100);
        if (newProgress <= 0) {
          onDismiss(id);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [id, duration, isPaused, onDismiss]);

  const handleUndo = () => {
    onUndo?.();
    onDismiss(id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative overflow-hidden rounded-lg border shadow-lg bg-card ${config.className}`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
          
          {onUndo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              className="mt-2 -ml-2 h-8 text-primary hover:text-primary/80"
            >
              <Undo2 className="h-4 w-4 mr-1" />
              {undoLabel}
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={() => onDismiss(id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
        <motion.div
          className={`h-full ${config.progressColor}`}
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </motion.div>
  );
}

// Toast container and manager
interface ToastContainerProps {
  position?:
    | "top-left"
    | "top-right"
    | "top-center"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center";
  maxToasts?: number;
}

export function ToastContainer({
  position = "bottom-right",
  maxToasts = 5,
}: ToastContainerProps) {
  const [toasts, setToasts] = React.useState<UndoableToast[]>([]);

  // Expose toast methods globally
  React.useEffect(() => {
    const addToast = (toast: Omit<UndoableToast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev.slice(-(maxToasts - 1)), { ...toast, id }]);
      return id;
    };

    const dismissToast = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const clearToasts = () => {
      setToasts([]);
    };

    // @ts-ignore
    window.__toastManager = { addToast, dismissToast, clearToasts };

    return () => {
      // @ts-ignore
      delete window.__toastManager;
    };
  }, [maxToasts]);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className={`fixed z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none ${positionClasses[position]}`}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem {...toast} onDismiss={handleDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Helper function to show toasts
export function showToast(
  options: Omit<UndoableToast, "id"> & { type?: ToastType }
) {
  // @ts-ignore
  if (window.__toastManager) {
    // @ts-ignore
    return window.__toastManager.addToast(options);
  }
  console.warn("Toast container not mounted");
  return null;
}

// Convenience methods
export const toast = {
  success: (title: string, options?: Partial<Omit<UndoableToast, "id" | "type">>) =>
    showToast({ title, type: "success", ...options }),

  error: (title: string, options?: Partial<Omit<UndoableToast, "id" | "type">>) =>
    showToast({ title, type: "error", ...options }),

  warning: (title: string, options?: Partial<Omit<UndoableToast, "id" | "type">>) =>
    showToast({ title, type: "warning", ...options }),

  info: (title: string, options?: Partial<Omit<UndoableToast, "id" | "type">>) =>
    showToast({ title, type: "info", ...options }),

  undo: (
    title: string,
    onUndo: () => void,
    options?: Partial<Omit<UndoableToast, "id" | "type" | "onUndo">>
  ) =>
    showToast({
      title,
      type: "success",
      onUndo,
      duration: 8000,
      ...options,
    }),
};
