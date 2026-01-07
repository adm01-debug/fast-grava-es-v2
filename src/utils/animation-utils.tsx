import { motion, Variants, Transition, AnimatePresence } from 'framer-motion';
import React, { ReactNode } from 'react';

// Common transitions
export const transitions = {
  spring: { type: 'spring', stiffness: 300, damping: 30 } as Transition,
  springBouncy: { type: 'spring', stiffness: 400, damping: 10 } as Transition,
  springSmooth: { type: 'spring', stiffness: 200, damping: 25 } as Transition,
  easeOut: { duration: 0.3, ease: 'easeOut' } as Transition,
  easeInOut: { duration: 0.4, ease: 'easeInOut' } as Transition,
  linear: { duration: 0.2, ease: 'linear' } as Transition,
};

// Fade variants
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Slide variants
export const slideVariants = {
  up: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  } as Variants,
  down: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  } as Variants,
  left: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  } as Variants,
  right: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  } as Variants,
};

// Scale variants
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

// Pop variants
export const popVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.5 },
};

// Stagger container
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren, delayChildren },
  },
});

// Stagger item
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Animated components
interface AnimatedProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0 }: AnimatedProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeVariants}
      transition={{ ...transitions.easeOut, delay }}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({ 
  children, 
  className, 
  delay = 0, 
  direction = 'up' 
}: AnimatedProps & { direction?: 'up' | 'down' | 'left' | 'right' }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={slideVariants[direction]}
      transition={{ ...transitions.spring, delay }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, className, delay = 0 }: AnimatedProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={scaleVariants}
      transition={{ ...transitions.springBouncy, delay }}
    >
      {children}
    </motion.div>
  );
}

export function PopIn({ children, className, delay = 0 }: AnimatedProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={popVariants}
      transition={{ ...transitions.springBouncy, delay }}
    >
      {children}
    </motion.div>
  );
}

// Stagger list
interface StaggerListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function StaggerList({ children, className, staggerDelay = 0.1 }: StaggerListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={staggerContainer(staggerDelay)}
    >
      {children.map((child, i) => (
        <motion.div key={i} variants={staggerItem} transition={transitions.spring}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Animated list item
export function AnimatedListItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={transitions.spring}
    >
      {children}
    </motion.div>
  );
}

// Page transition wrapper
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={transitions.easeOut}
    >
      {children}
    </motion.div>
  );
}

// Hover/tap animations
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: transitions.spring,
};

export const hoverLift = {
  whileHover: { y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
  transition: transitions.spring,
};

export const tapShrink = {
  whileTap: { scale: 0.95 },
  transition: transitions.spring,
};

// Skeleton loader
export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      className={`bg-muted rounded ${className}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// Pulse animation
export function Pulse({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

// Shake animation
export function useShake() {
  const [isShaking, setIsShaking] = React.useState(false);

  const shake = React.useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, []);

  const shakeProps = {
    animate: isShaking ? { x: [-5, 5, -5, 5, 0] } : {},
    transition: { duration: 0.4 },
  };

  return { shake, shakeProps, isShaking };
}

// Number counter animation
export function AnimatedNumber({ 
  value, 
  duration = 1,
  className 
}: { 
  value: number; 
  duration?: number; 
  className?: string;
}) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const startValue = displayValue;
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (endTime - startTime), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out
      const currentValue = startValue + (value - startValue) * easeProgress;
      
      setDisplayValue(Math.round(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{displayValue.toLocaleString()}</span>;
}

// Animated presence wrapper
export function AnimatedPresenceWrapper({ 
  children, 
  mode = 'wait' 
}: { 
  children: ReactNode; 
  mode?: 'wait' | 'sync' | 'popLayout';
}) {
  return <AnimatePresence mode={mode}>{children}</AnimatePresence>;
}

// Draw SVG path
export function DrawPath({ 
  d, 
  duration = 2, 
  className 
}: { 
  d: string; 
  duration?: number; 
  className?: string;
}) {
  return (
    <motion.path
      d={d}
      className={className}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration, ease: 'easeInOut' }}
    />
  );
}

// Reveal on scroll
export function RevealOnScroll({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={transitions.spring}
    >
      {children}
    </motion.div>
  );
}
