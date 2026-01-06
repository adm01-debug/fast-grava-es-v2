import React, { useRef, useCallback, ReactNode, useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';
import { cn } from '@/lib/utils';

// Gesture types
type GestureType = 'tap' | 'longPress' | 'swipe' | 'pinch' | 'pan';
type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface GestureHandlerProps {
  children: ReactNode;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onSwipe?: (direction: SwipeDirection, velocity: number) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPanStart?: () => void;
  onPan?: (info: { x: number; y: number }) => void;
  onPanEnd?: () => void;
  
  // Configuration
  longPressDelay?: number;
  swipeThreshold?: number;
  swipeVelocityThreshold?: number;
  doubleTapDelay?: number;
  disabled?: boolean;
  hapticFeedback?: boolean;
  
  // Styling
  className?: string;
  activeClassName?: string;
}

export function GestureHandler({
  children,
  onTap,
  onDoubleTap,
  onLongPress,
  onSwipe,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPanStart,
  onPan,
  onPanEnd,
  longPressDelay = 500,
  swipeThreshold = 50,
  swipeVelocityThreshold = 500,
  doubleTapDelay = 300,
  disabled = false,
  hapticFeedback = true,
  className,
  activeClassName,
}: GestureHandlerProps) {
  const { trigger } = useHapticFeedback();
  const [isActive, setIsActive] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTapTime = useRef<number>(0);
  const isPanning = useRef(false);

  // Clear timers
  const clearTimers = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Handle tap start
  const handleTapStart = useCallback(() => {
    if (disabled) return;
    
    setIsActive(true);

    // Long press detection
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        if (hapticFeedback) trigger('heavy');
        onLongPress();
        setIsActive(false);
      }, longPressDelay);
    }
  }, [disabled, onLongPress, longPressDelay, hapticFeedback, trigger]);

  // Handle tap end
  const handleTapEnd = useCallback(() => {
    clearTimers();
    setIsActive(false);

    if (disabled || isPanning.current) return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime.current;

    // Double tap detection
    if (onDoubleTap && timeSinceLastTap < doubleTapDelay) {
      if (hapticFeedback) trigger('medium');
      onDoubleTap();
      lastTapTime.current = 0;
      return;
    }

    lastTapTime.current = now;

    // Single tap (delayed to check for double tap)
    if (onTap && !onDoubleTap) {
      if (hapticFeedback) trigger('light');
      onTap();
    } else if (onTap) {
      setTimeout(() => {
        if (Date.now() - lastTapTime.current >= doubleTapDelay) {
          if (hapticFeedback) trigger('light');
          onTap();
        }
      }, doubleTapDelay);
    }
  }, [disabled, onTap, onDoubleTap, doubleTapDelay, hapticFeedback, trigger, clearTimers]);

  // Handle drag/swipe
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      isPanning.current = false;
      clearTimers();
      setIsActive(false);

      if (disabled) return;

      const { offset, velocity } = info;
      const absX = Math.abs(offset.x);
      const absY = Math.abs(offset.y);
      const absVelocityX = Math.abs(velocity.x);
      const absVelocityY = Math.abs(velocity.y);

      // Determine swipe direction
      if (absX > swipeThreshold || absVelocityX > swipeVelocityThreshold) {
        if (offset.x > 0) {
          if (hapticFeedback) trigger('light');
          onSwipeRight?.();
          onSwipe?.('right', velocity.x);
        } else {
          if (hapticFeedback) trigger('light');
          onSwipeLeft?.();
          onSwipe?.('left', velocity.x);
        }
      } else if (absY > swipeThreshold || absVelocityY > swipeVelocityThreshold) {
        if (offset.y > 0) {
          if (hapticFeedback) trigger('light');
          onSwipeDown?.();
          onSwipe?.('down', velocity.y);
        } else {
          if (hapticFeedback) trigger('light');
          onSwipeUp?.();
          onSwipe?.('up', velocity.y);
        }
      }

      onPanEnd?.();
    },
    [
      disabled,
      swipeThreshold,
      swipeVelocityThreshold,
      hapticFeedback,
      trigger,
      onSwipe,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      onPanEnd,
      clearTimers,
    ]
  );

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!isPanning.current) {
        isPanning.current = true;
        clearTimers();
        onPanStart?.();
      }
      onPan?.({ x: info.offset.x, y: info.offset.y });
    },
    [onPan, onPanStart, clearTimers]
  );

  const hasSwipeHandlers = onSwipe || onSwipeLeft || onSwipeRight || onSwipeUp || onSwipeDown;
  const hasPanHandlers = onPan || onPanStart || onPanEnd;

  return (
    <motion.div
      className={cn(className, isActive && activeClassName)}
      onTapStart={handleTapStart}
      onTap={handleTapEnd}
      onTapCancel={() => {
        clearTimers();
        setIsActive(false);
      }}
      drag={hasSwipeHandlers || hasPanHandlers ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{ touchAction: 'none' }}
    >
      {children}
    </motion.div>
  );
}

// Touch ripple effect
interface TouchRippleProps {
  children: ReactNode;
  color?: string;
  duration?: number;
  disabled?: boolean;
  className?: string;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export function TouchRipple({
  children,
  color = 'currentColor',
  duration = 600,
  disabled = false,
  className,
}: TouchRippleProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  const addRipple = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (disabled || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      let x: number, y: number;

      if ('touches' in event) {
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
      } else {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
      }

      const id = nextId.current++;
      setRipples((prev) => [...prev, { x, y, id }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, duration);
    },
    [disabled, duration]
  );

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onMouseDown={addRipple}
      onTouchStart={addRipple}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: color,
            opacity: 0.3,
          }}
          initial={{ width: 0, height: 0, x: 0, y: 0 }}
          animate={{
            width: 200,
            height: 200,
            x: -100,
            y: -100,
            opacity: 0,
          }}
          transition={{ duration: duration / 1000, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// Swipeable card
interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  threshold?: number;
  className?: string;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100,
  className,
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const { trigger } = useHapticFeedback();
  
  const leftActionOpacity = useTransform(x, [-threshold, 0], [1, 0]);
  const rightActionOpacity = useTransform(x, [0, threshold], [0, 1]);
  const scale = useTransform(x, [-threshold, 0, threshold], [0.95, 1, 0.95]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -threshold && onSwipeLeft) {
      trigger('medium');
      onSwipeLeft();
    } else if (info.offset.x > threshold && onSwipeRight) {
      trigger('medium');
      onSwipeRight();
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Left action background */}
      {leftAction && (
        <motion.div
          className="absolute inset-y-0 left-0 flex items-center px-4"
          style={{ opacity: leftActionOpacity }}
        >
          {leftAction}
        </motion.div>
      )}

      {/* Right action background */}
      {rightAction && (
        <motion.div
          className="absolute inset-y-0 right-0 flex items-center px-4"
          style={{ opacity: rightActionOpacity }}
        >
          {rightAction}
        </motion.div>
      )}

      {/* Main content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        style={{ x, scale }}
        className="relative bg-card z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}

// Pull indicator
interface PullIndicatorProps {
  progress: number;
  isRefreshing: boolean;
  className?: string;
}

export function PullIndicator({ progress, isRefreshing, className }: PullIndicatorProps) {
  const rotation = useTransform(() => progress * 360);
  const scale = useTransform(() => Math.min(1, progress));

  return (
    <motion.div
      className={cn(
        'flex items-center justify-center',
        className
      )}
      style={{ scale }}
    >
      <motion.div
        className={cn(
          'w-8 h-8 rounded-full border-2 border-primary border-t-transparent',
          isRefreshing && 'animate-spin'
        )}
        style={{ rotate: isRefreshing ? undefined : rotation }}
      />
    </motion.div>
  );
}

// Hook for gesture state
export function useGestureState() {
  const [gestureState, setGestureState] = useState<{
    type: GestureType | null;
    direction: SwipeDirection | null;
    isActive: boolean;
  }>({
    type: null,
    direction: null,
    isActive: false,
  });

  const startGesture = useCallback((type: GestureType) => {
    setGestureState({ type, direction: null, isActive: true });
  }, []);

  const endGesture = useCallback((direction?: SwipeDirection) => {
    setGestureState((prev) => ({
      ...prev,
      direction: direction || null,
      isActive: false,
    }));
  }, []);

  const resetGesture = useCallback(() => {
    setGestureState({ type: null, direction: null, isActive: false });
  }, []);

  return {
    ...gestureState,
    startGesture,
    endGesture,
    resetGesture,
  };
}
