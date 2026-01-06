import React from 'react';
import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// MICRO-INTERACTION VARIANTS
// ============================================

// Scale animations
export const scaleVariants: Variants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
  focus: { scale: 1.01 },
};

export const scaleSmallVariants: Variants = {
  idle: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

export const scaleLargeVariants: Variants = {
  idle: { scale: 1 },
  hover: { scale: 1.03 },
  tap: { scale: 0.97 },
};

// Glow animations
export const glowVariants: Variants = {
  idle: { boxShadow: '0 0 0 0 rgba(var(--primary), 0)' },
  hover: { boxShadow: '0 0 20px 2px rgba(var(--primary), 0.3)' },
  focus: { boxShadow: '0 0 30px 4px rgba(var(--primary), 0.4)' },
};

// Slide animations
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// Bounce animation
export const bounceVariants: Variants = {
  idle: { y: 0 },
  bounce: {
    y: [0, -10, 0],
    transition: { duration: 0.4, times: [0, 0.5, 1] },
  },
};

// Shake animation
export const shakeVariants: Variants = {
  idle: { x: 0 },
  shake: {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.4 },
  },
};

// Pulse animation
export const pulseVariants: Variants = {
  idle: { scale: 1, opacity: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: { duration: 0.6, repeat: Infinity },
  },
};

// Rotate animation
export const rotateVariants: Variants = {
  idle: { rotate: 0 },
  hover: { rotate: 180 },
  spin: { rotate: 360, transition: { duration: 1, repeat: Infinity, ease: 'linear' } },
};

// ============================================
// ANIMATED COMPONENTS
// ============================================

// Animated Card with hover effects
interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  variant?: 'scale' | 'glow' | 'lift' | 'border';
  children: React.ReactNode;
}

export function AnimatedCard({ 
  variant = 'scale', 
  children, 
  className,
  ...props 
}: AnimatedCardProps) {
  const getVariants = () => {
    switch (variant) {
      case 'glow':
        return {
          idle: { boxShadow: '0 0 0 0 transparent' },
          hover: { boxShadow: '0 0 30px -5px hsl(var(--primary) / 0.3)' },
        };
      case 'lift':
        return {
          idle: { y: 0, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
          hover: { y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' },
        };
      case 'border':
        return {
          idle: { borderColor: 'transparent' },
          hover: { borderColor: 'hsl(var(--primary))' },
        };
      default:
        return scaleVariants;
    }
  };

  return (
    <motion.div
      className={cn("rounded-xl border bg-card", className)}
      variants={getVariants()}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated Button with micro-interactions
interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'bounce' | 'glow' | 'shake' | 'scale';
  children: React.ReactNode;
}

export function AnimatedButton({ 
  variant = 'scale', 
  children, 
  className,
  ...props 
}: AnimatedButtonProps) {
  const getAnimation = () => {
    switch (variant) {
      case 'bounce':
        return { whileHover: { y: -2 }, whileTap: { y: 2 } };
      case 'glow':
        return { 
          whileHover: { boxShadow: '0 0 20px 2px hsl(var(--primary) / 0.5)' },
          whileTap: { boxShadow: '0 0 10px 1px hsl(var(--primary) / 0.3)' }
        };
      case 'shake':
        return { whileTap: { x: [0, -2, 2, -2, 2, 0] } };
      default:
        return { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } };
    }
  };

  return (
    <motion.button
      className={className}
      transition={{ duration: 0.15 }}
      {...getAnimation()}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Animated Icon with hover rotation/scale
interface AnimatedIconProps extends HTMLMotionProps<'span'> {
  icon: React.ReactNode;
  animation?: 'rotate' | 'scale' | 'bounce' | 'pulse';
}

export function AnimatedIcon({ 
  icon, 
  animation = 'scale', 
  className,
  ...props 
}: AnimatedIconProps) {
  const getAnimation = () => {
    switch (animation) {
      case 'rotate':
        return { whileHover: { rotate: 180 } };
      case 'bounce':
        return { whileHover: { y: -3 } };
      case 'pulse':
        return { animate: { scale: [1, 1.1, 1] }, transition: { repeat: Infinity, duration: 1 } };
      default:
        return { whileHover: { scale: 1.2 } };
    }
  };

  return (
    <motion.span
      className={cn("inline-flex", className)}
      transition={{ duration: 0.2 }}
      {...getAnimation()}
      {...props}
    >
      {icon}
    </motion.span>
  );
}

// Animated List Item with stagger
interface AnimatedListItemProps extends HTMLMotionProps<'div'> {
  index?: number;
  children: React.ReactNode;
}

export function AnimatedListItem({ 
  index = 0, 
  children, 
  className,
  ...props 
}: AnimatedListItemProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated Number Counter
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedNumber({ 
  value, 
  duration = 1, 
  className,
  prefix = '',
  suffix = '',
  decimals = 0,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const startValue = displayValue;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * easeOut;
      
      setDisplayValue(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <motion.span 
      className={className}
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </motion.span>
  );
}

// Animated Progress Ring
interface AnimatedProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  showValue?: boolean;
}

export function AnimatedProgressRing({
  progress,
  size = 60,
  strokeWidth = 4,
  className,
  color = 'hsl(var(--primary))',
  showValue = true,
}: AnimatedProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="hsl(var(--muted))"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      {showValue && (
        <motion.span 
          className="absolute text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(progress)}%
        </motion.span>
      )}
    </div>
  );
}

// Animated Checkmark
interface AnimatedCheckmarkProps {
  checked: boolean;
  size?: number;
  className?: string;
}

export function AnimatedCheckmark({ 
  checked, 
  size = 24, 
  className 
}: AnimatedCheckmarkProps) {
  return (
    <motion.svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      initial={false}
    >
      <motion.circle
        cx={12}
        cy={12}
        r={10}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: checked ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.path
        d="M7 13l3 3 7-7"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: checked ? 1 : 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
    </motion.svg>
  );
}

// Animated Badge/Notification Dot
interface AnimatedDotProps {
  active?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

export function AnimatedDot({ 
  active = true, 
  color = 'primary',
  size = 'md',
  pulse = true,
  className,
}: AnimatedDotProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  if (!active) return null;

  return (
    <motion.span
      className={cn(
        "rounded-full",
        sizeClasses[size],
        colorClasses[color],
        pulse && "animate-pulse",
        className
      )}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  );
}

// Stagger Container for list animations
interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  staggerChildren?: number;
  delayChildren?: number;
  children: React.ReactNode;
}

export function StaggerContainer({
  staggerChildren = 0.05,
  delayChildren = 0,
  children,
  className,
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren,
            delayChildren,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stagger Item for use with StaggerContainer
interface StaggerItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
