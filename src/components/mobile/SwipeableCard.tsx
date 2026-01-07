import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Trash2, Archive, Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeAction {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  action: () => void;
  threshold?: number;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  className?: string;
  onSwipeComplete?: (direction: 'left' | 'right') => void;
}

export function SwipeableCard({
  children,
  leftAction,
  rightAction,
  className,
  onSwipeComplete,
}: SwipeableCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const x = useMotionValue(0);
  
  const leftOpacity = useTransform(x, [0, 100], [0, 1]);
  const rightOpacity = useTransform(x, [-100, 0], [1, 0]);
  const leftScale = useTransform(x, [0, 100], [0.5, 1]);
  const rightScale = useTransform(x, [-100, 0], [1, 0.5]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold && leftAction) {
      setIsRemoving(true);
      leftAction.action();
      onSwipeComplete?.('left');
    } else if (info.offset.x < -threshold && rightAction) {
      setIsRemoving(true);
      rightAction.action();
      onSwipeComplete?.('right');
    }
  };

  if (isRemoving) {
    return (
      <motion.div
        initial={{ height: 'auto', opacity: 1 }}
        animate={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      />
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Left Action Background */}
      {leftAction && (
        <motion.div
          className="absolute inset-y-0 left-0 flex items-center justify-start pl-4"
          style={{ 
            opacity: leftOpacity,
            backgroundColor: leftAction.bgColor,
          }}
        >
          <motion.div style={{ scale: leftScale }} className={leftAction.color}>
            {leftAction.icon}
          </motion.div>
        </motion.div>
      )}

      {/* Right Action Background */}
      {rightAction && (
        <motion.div
          className="absolute inset-y-0 right-0 flex items-center justify-end pr-4"
          style={{ 
            opacity: rightOpacity,
            backgroundColor: rightAction.bgColor,
          }}
        >
          <motion.div style={{ scale: rightScale }} className={rightAction.color}>
            {rightAction.icon}
          </motion.div>
        </motion.div>
      )}

      {/* Swipeable Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: rightAction ? -150 : 0, right: leftAction ? 150 : 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative bg-card cursor-grab active:cursor-grabbing touch-pan-y"
        whileTap={{ cursor: 'grabbing' }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Pull to Refresh Component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    setPullDistance(Math.min(distance, threshold * 1.5));
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
  };

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-10"
        style={{ top: pullDistance - 40 }}
        animate={{ opacity: pullDistance > 20 ? 1 : 0 }}
      >
        <motion.div
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
          animate={{ rotate: isRefreshing ? 360 : rotation }}
          transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
        >
          <RotateCcw className={cn(
            "w-5 h-5 text-primary",
            isRefreshing && "animate-spin"
          )} />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Drag to Reorder List
interface DragToReorderProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
}

export function DragToReorder<T>({
  items,
  onReorder,
  renderItem,
  keyExtractor,
  className,
}: DragToReorderProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, removed);
    
    onReorder(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <motion.div
          key={keyExtractor(item)}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          layout
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            opacity: draggedIndex === index ? 0.5 : 1,
            scale: draggedIndex === index ? 1.02 : 1,
          }}
          className="cursor-move touch-none"
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </div>
  );
}

// Preset swipe actions
export const swipeActions = {
  delete: {
    icon: <Trash2 className="w-6 h-6" />,
    color: 'text-white',
    bgColor: 'hsl(var(--destructive))',
    threshold: 100,
  },
  archive: {
    icon: <Archive className="w-6 h-6" />,
    color: 'text-white',
    bgColor: 'hsl(var(--warning))',
    threshold: 100,
  },
  complete: {
    icon: <Check className="w-6 h-6" />,
    color: 'text-white',
    bgColor: 'hsl(var(--success))',
    threshold: 100,
  },
};

export default SwipeableCard;
