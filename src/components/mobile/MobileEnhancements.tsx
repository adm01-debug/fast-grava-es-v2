import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Loader2, RefreshCw } from 'lucide-react';

// ============= HAPTIC FEEDBACK =============

type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

export function useHaptic() {
  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    // Check if vibration API is available
    if (!('vibrate' in navigator)) return;

    const patterns: Record<HapticType, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      selection: 5,
      success: [10, 50, 10],
      warning: [20, 50, 20],
      error: [30, 50, 30, 50, 30],
    };

    try {
      navigator.vibrate(patterns[type]);
    } catch (e) {
      // Vibration not supported
    }
  }, []);

  return { triggerHaptic };
}

// ============= PULL TO REFRESH =============

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const { triggerHaptic } = useHaptic();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing || startY.current === 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    if (distance > 0 && containerRef.current?.scrollTop === 0) {
      // Apply resistance
      const resistedDistance = Math.min(distance * 0.5, threshold * 1.5);
      setPullDistance(resistedDistance);

      // Trigger haptic when reaching threshold
      if (resistedDistance >= threshold && pullDistance < threshold) {
        triggerHaptic('medium');
      }
    }
  }, [disabled, isRefreshing, threshold, pullDistance, triggerHaptic]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      triggerHaptic('success');
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    startY.current = 0;
  }, [disabled, isRefreshing, pullDistance, threshold, onRefresh, triggerHaptic]);

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: 1, 
              height: isRefreshing ? 60 : pullDistance 
            }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center overflow-hidden"
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : rotation }}
              transition={isRefreshing ? { 
                duration: 1, 
                repeat: Infinity, 
                ease: 'linear' 
              } : undefined}
            >
              {isRefreshing ? (
                <Loader2 className="h-6 w-6 text-primary" />
              ) : (
                <RefreshCw 
                  className={cn(
                    'h-6 w-6 transition-colors',
                    progress >= 1 ? 'text-primary' : 'text-muted-foreground'
                  )} 
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}

// ============= SWIPE ACTIONS =============

interface SwipeAction {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

interface SwipeActionsProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
}

export function SwipeActions({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className,
}: SwipeActionsProps) {
  const x = useMotionValue(0);
  const { triggerHaptic } = useHaptic();
  const [isActionsVisible, setIsActionsVisible] = useState<'left' | 'right' | null>(null);

  const leftOpacity = useTransform(x, [0, threshold], [0, 1]);
  const rightOpacity = useTransform(x, [-threshold, 0], [1, 0]);

  const handleDragEnd = useCallback((_: never, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > threshold || velocity > 500) {
      // Trigger left action
      if (leftActions.length > 0) {
        triggerHaptic('medium');
        leftActions[0].onClick();
      }
    } else if (offset < -threshold || velocity < -500) {
      // Trigger right action
      if (rightActions.length > 0) {
        triggerHaptic('medium');
        rightActions[0].onClick();
      }
    }
  }, [leftActions, rightActions, threshold, triggerHaptic]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Left actions background */}
      {leftActions.length > 0 && (
        <motion.div 
          style={{ opacity: leftOpacity }}
          className="absolute inset-y-0 left-0 flex items-center px-4"
        >
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: leftActions[0].color }}
          >
            {leftActions[0].icon}
            <span className="text-sm font-medium text-white">{leftActions[0].label}</span>
          </div>
        </motion.div>
      )}

      {/* Right actions background */}
      {rightActions.length > 0 && (
        <motion.div 
          style={{ opacity: rightOpacity }}
          className="absolute inset-y-0 right-0 flex items-center px-4"
        >
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: rightActions[0].color }}
          >
            {rightActions[0].icon}
            <span className="text-sm font-medium text-white">{rightActions[0].label}</span>
          </div>
        </motion.div>
      )}

      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.2}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="relative bg-card z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============= BOTTOM ACTION SHEET =============

interface BottomActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function BottomActionSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
}: BottomActionSheetProps) {
  const { triggerHaptic } = useHaptic();

  useEffect(() => {
    if (isOpen) {
      triggerHaptic('light');
    }
  }, [isOpen, triggerHaptic]);

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        {(title || description) && (
          <DrawerHeader>
            {title && <DrawerTitle>{title}</DrawerTitle>}
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
        )}
        
        <div className="px-4 pb-4">
          {children}
        </div>

        {footer && (
          <DrawerFooter>
            {footer}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}

// ============= FLOATING ACTION BUTTON =============

interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  label?: string;
  variant?: 'primary' | 'secondary';
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  className?: string;
}

export function FloatingActionButton({
  icon,
  onClick,
  label,
  variant = 'primary',
  position = 'bottom-right',
  className,
}: FloatingActionButtonProps) {
  const { triggerHaptic } = useHaptic();

  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-20 left-4',
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90',
    secondary: 'bg-card text-foreground border border-border shadow-lg hover:bg-muted',
  };

  const handleClick = () => {
    triggerHaptic('light');
    onClick();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={cn(
        'fixed z-40 flex items-center gap-2 rounded-full transition-colors',
        label ? 'px-5 py-3' : 'p-4',
        positionClasses[position],
        variantClasses[variant],
        className
      )}
    >
      {icon}
      {label && <span className="font-medium">{label}</span>}
    </motion.button>
  );
}

// ============= TOUCH FEEDBACK WRAPPER =============

interface TouchFeedbackProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  hapticType?: HapticType;
}

export function TouchFeedback({ 
  children, 
  onPress, 
  className,
  hapticType = 'light',
}: TouchFeedbackProps) {
  const { triggerHaptic } = useHaptic();

  const handlePress = () => {
    triggerHaptic(hapticType);
    onPress?.();
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98, opacity: 0.9 }}
      onClick={handlePress}
      className={cn('cursor-pointer select-none', className)}
    >
      {children}
    </motion.div>
  );
}

export default {
  useHaptic,
  PullToRefresh,
  SwipeActions,
  BottomActionSheet,
  FloatingActionButton,
  TouchFeedback,
};
