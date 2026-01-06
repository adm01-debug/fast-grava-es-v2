import React, { ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Transition types
type TransitionType = 
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'scale'
  | 'flip'
  | 'rotate'
  | 'morph';

interface PageTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  duration?: number;
  delay?: number;
  className?: string;
  exitBeforeEnter?: boolean;
}

// Animation variants for each transition type
const transitionVariants: Record<TransitionType, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  'slide-left': {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  },
  'slide-right': {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  },
  'slide-up': {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  },
  'slide-down': {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  flip: {
    initial: { opacity: 0, rotateY: 90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: -90 },
  },
  rotate: {
    initial: { opacity: 0, rotate: -10, scale: 0.95 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 10, scale: 0.95 },
  },
  morph: {
    initial: { opacity: 0, scale: 0.9, borderRadius: '50%' },
    animate: { opacity: 1, scale: 1, borderRadius: '0%' },
    exit: { opacity: 0, scale: 0.9, borderRadius: '50%' },
  },
};

export function PageTransition({
  children,
  type = 'fade',
  duration = 0.3,
  delay = 0,
  className,
  exitBeforeEnter = true,
}: PageTransitionProps) {
  const location = useLocation();
  const variants = transitionVariants[type];

  return (
    <AnimatePresence mode={exitBeforeEnter ? 'wait' : 'sync'}>
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className={cn("w-full", className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Staggered children animation
interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={{
        ...staggerContainerVariants,
        visible: {
          ...staggerContainerVariants.visible,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

// Section reveal animation
interface RevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className,
  once = true,
}: RevealProps) {
  const directionOffset = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directionOffset[direction],
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{ once, margin: '-50px' }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Parallax scroll effect
interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.5, className }: ParallaxProps) {
  return (
    <motion.div
      initial={{ y: 0 }}
      whileInView={{ y: 0 }}
      viewport={{ once: false }}
      style={{
        y: `calc(var(--scroll-y, 0) * ${speed})`,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// List animation with individual item control
interface AnimatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
  itemClassName?: string;
  animation?: 'fade' | 'slide' | 'scale' | 'none';
}

export function AnimatedList<T>({
  items,
  renderItem,
  keyExtractor,
  className,
  itemClassName,
  animation = 'slide',
}: AnimatedListProps<T>) {
  const animations = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    },
    none: {
      initial: {},
      animate: {},
      exit: {},
    },
  };

  return (
    <div className={className}>
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={keyExtractor(item)}
            layout
            {...animations[animation]}
            transition={{
              duration: 0.2,
              delay: index * 0.03,
              layout: { duration: 0.2 },
            }}
            className={itemClassName}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Shared layout animation
interface SharedLayoutProps {
  layoutId: string;
  children: ReactNode;
  className?: string;
}

export function SharedLayout({ layoutId, children, className }: SharedLayoutProps) {
  return (
    <motion.div
      layoutId={layoutId}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 30,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Route-aware transition selector
export function usePageTransition(): TransitionType {
  const location = useLocation();
  const path = location.pathname;

  // Customize transitions based on route patterns
  if (path.includes('/calendar')) return 'slide-up';
  if (path.includes('/kanban')) return 'scale';
  if (path.includes('/jobs')) return 'slide-left';
  if (path.includes('/dashboard')) return 'fade';
  if (path.includes('/settings')) return 'slide-right';
  if (path.includes('/operators')) return 'slide-up';
  
  return 'fade';
}

// Presets for common page layouts
export const TransitionPresets = {
  Dashboard: (children: ReactNode) => (
    <PageTransition type="fade" duration={0.3}>
      <StaggerContainer staggerDelay={0.05}>
        {children}
      </StaggerContainer>
    </PageTransition>
  ),
  
  List: (children: ReactNode) => (
    <PageTransition type="slide-up" duration={0.25}>
      {children}
    </PageTransition>
  ),
  
  Detail: (children: ReactNode) => (
    <PageTransition type="scale" duration={0.3}>
      {children}
    </PageTransition>
  ),
  
  Modal: (children: ReactNode) => (
    <PageTransition type="scale" duration={0.2}>
      {children}
    </PageTransition>
  ),
  
  Sidebar: (children: ReactNode) => (
    <PageTransition type="slide-right" duration={0.25}>
      {children}
    </PageTransition>
  ),
};
