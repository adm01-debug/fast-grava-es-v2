import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X, GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  snapPoints?: number[]; // Array of heights in vh (e.g., [25, 50, 90])
  defaultSnapPoint?: number; // Index of default snap point
  showHandle?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  preventClose?: boolean;
}

const CLOSE_THRESHOLD = 100; // pixels to drag down to close

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  snapPoints = [50, 90],
  defaultSnapPoint = 0,
  showHandle = true,
  showCloseButton = true,
  className,
  overlayClassName,
  preventClose = false,
}: BottomSheetProps) {
  const { trigger } = useHapticFeedback();
  const [currentSnapIndex, setCurrentSnapIndex] = useState(defaultSnapPoint);
  const sheetRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0]);

  // Calculate sheet height based on current snap point
  const sheetHeight = `${snapPoints[currentSnapIndex]}vh`;

  // Handle drag end
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const velocity = info.velocity.y;
      const offset = info.offset.y;

      // Fast swipe down - close
      if (velocity > 500 && !preventClose) {
        trigger('light');
        onClose();
        return;
      }

      // Fast swipe up - expand to max
      if (velocity < -500 && currentSnapIndex < snapPoints.length - 1) {
        trigger('light');
        setCurrentSnapIndex(snapPoints.length - 1);
        return;
      }

      // Slow drag - check threshold
      if (offset > CLOSE_THRESHOLD && !preventClose) {
        trigger('light');
        onClose();
        return;
      }

      // Snap to nearest point based on drag direction
      if (offset > 50 && currentSnapIndex > 0) {
        trigger('selection');
        setCurrentSnapIndex(currentSnapIndex - 1);
      } else if (offset < -50 && currentSnapIndex < snapPoints.length - 1) {
        trigger('selection');
        setCurrentSnapIndex(currentSnapIndex + 1);
      }
    },
    [currentSnapIndex, snapPoints, onClose, trigger, preventClose]
  );

  // Reset snap point when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentSnapIndex(defaultSnapPoint);
      y.set(0);
    }
  }, [isOpen, defaultSnapPoint, y]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !preventClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, preventClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed inset-0 bg-black/60 backdrop-blur-sm z-50",
              overlayClassName
            )}
            onClick={() => !preventClose && onClose()}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0, height: sheetHeight }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ y, opacity }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50",
              "bg-background rounded-t-3xl shadow-2xl",
              "flex flex-col overflow-hidden",
              "touch-pan-y",
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "bottom-sheet-title" : undefined}
          >
            {/* Handle */}
            {showHandle && (
              <div
                className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
                aria-hidden="true"
              >
                <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
              </div>
            )}

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between px-4 pb-3">
                <div className="flex-1">
                  {title && (
                    <h2
                      id="bottom-sheet-title"
                      className="text-lg font-semibold text-foreground"
                    >
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
                {showCloseButton && !preventClose && (
                  <button
                    onClick={onClose}
                    className={cn(
                      "p-2 -mr-2 rounded-full",
                      "hover:bg-muted transition-colors",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    )}
                    aria-label="Fechar"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                )}
              </div>
            )}

            {/* Snap Points Indicator */}
            {snapPoints.length > 1 && (
              <div className="flex justify-center gap-1.5 pb-2" aria-hidden="true">
                {snapPoints.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      trigger('selection');
                      setCurrentSnapIndex(index);
                    }}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-200",
                      index === currentSnapIndex
                        ? "bg-primary scale-125"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                    aria-label={`Snap point ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-safe">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Quick action variant for common use cases
interface BottomSheetActionProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'success';
  disabled?: boolean;
}

export function BottomSheetAction({
  icon: Icon,
  label,
  description,
  onClick,
  variant = 'default',
  disabled = false,
}: BottomSheetActionProps) {
  const { trigger } = useHapticFeedback();

  const variantStyles = {
    default: 'hover:bg-muted',
    destructive: 'hover:bg-destructive/10 text-destructive',
    success: 'hover:bg-success/10 text-success',
  };

  return (
    <button
      onClick={() => {
        if (!disabled) {
          trigger('light');
          onClick();
        }
      }}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        variantStyles[variant],
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div
        className={cn(
          "p-3 rounded-full",
          variant === 'default' && "bg-muted",
          variant === 'destructive' && "bg-destructive/10",
          variant === 'success' && "bg-success/10"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </button>
  );
}

// Hook for managing bottom sheet state
export function useBottomSheet(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}
