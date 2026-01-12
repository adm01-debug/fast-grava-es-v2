import * as React from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============= HERO GRADIENT =============

interface HeroGradientProps {
  variant?: 'primary' | 'success' | 'warning' | 'custom';
  customColors?: string[];
  animate?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function HeroGradient({
  variant = 'primary',
  customColors,
  animate = true,
  className,
  children,
}: HeroGradientProps) {
  const prefersReducedMotion = useReducedMotion();

  const gradients = {
    primary: ['from-primary/20', 'via-xp/10', 'to-transparent'],
    success: ['from-success/20', 'via-success/10', 'to-transparent'],
    warning: ['from-warning/20', 'via-warning/10', 'to-transparent'],
    custom: customColors || ['from-primary/20', 'to-transparent'],
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Animated Background Blobs */}
      {animate && !prefersReducedMotion && (
        <>
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={cn(
              'absolute -top-40 -left-40 w-80 h-80 rounded-full blur-3xl',
              'bg-gradient-to-br',
              ...gradients[variant],
            )}
          />
          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, 20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className={cn(
              'absolute -top-20 -right-40 w-96 h-96 rounded-full blur-3xl',
              'bg-gradient-to-bl',
              ...gradients[variant],
            )}
          />
        </>
      )}
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============= ELEVATED CARD =============

interface ElevatedCardProps {
  elevation?: 1 | 2 | 3 | 4;
  hover?: boolean;
  glow?: boolean;
  glowColor?: 'primary' | 'success' | 'warning' | 'custom';
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function ElevatedCard({
  elevation = 2,
  hover = true,
  glow = false,
  glowColor = 'primary',
  className,
  children,
  onClick,
}: ElevatedCardProps) {
  const shadows = {
    1: 'shadow-sm',
    2: 'shadow-md',
    3: 'shadow-lg',
    4: 'shadow-xl',
  };

  const hoverShadows = {
    1: 'hover:shadow-md',
    2: 'hover:shadow-lg',
    3: 'hover:shadow-xl',
    4: 'hover:shadow-2xl',
  };

  const glowStyles = {
    primary: 'shadow-primary/20 hover:shadow-primary/30',
    success: 'shadow-success/20 hover:shadow-success/30',
    warning: 'shadow-warning/20 hover:shadow-warning/30',
    custom: '',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
      className={cn(
        'rounded-xl bg-card border border-border',
        'transition-all duration-300',
        shadows[elevation],
        hover && hoverShadows[elevation],
        glow && glowStyles[glowColor],
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

// ============= GLASS CARD =============

interface GlassCardProps {
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  border?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function GlassCard({
  blur = 'md',
  opacity = 80,
  border = true,
  className,
  children,
}: GlassCardProps) {
  const blurValues = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  return (
    <div
      className={cn(
        'rounded-xl',
        blurValues[blur],
        `bg-card/${opacity}`,
        border && 'border border-border/50',
        className,
      )}
      style={{
        backgroundColor: `hsl(var(--card) / ${opacity / 100})`,
      }}
    >
      {children}
    </div>
  );
}

// ============= PARALLAX SECTION =============

interface ParallaxSectionProps {
  offset?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ParallaxSection({
  offset = 50,
  className,
  children,
}: ParallaxSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, offset]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

// ============= SHIMMER TEXT =============

interface ShimmerTextProps {
  text: string;
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
}

export function ShimmerText({ text, className, speed = 'normal' }: ShimmerTextProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const durations = {
    slow: 4,
    normal: 2,
    fast: 1,
  };

  if (prefersReducedMotion) {
    return <span className={cn('gradient-text', className)}>{text}</span>;
  }

  return (
    <motion.span
      className={cn(
        'inline-block bg-clip-text text-transparent',
        'bg-[linear-gradient(110deg,hsl(var(--primary)),hsl(var(--xp)),hsl(var(--primary)))]',
        'bg-[length:200%_100%]',
        className,
      )}
      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
      transition={{
        duration: durations[speed],
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {text}
    </motion.span>
  );
}

// ============= GRADIENT BORDER =============

interface GradientBorderProps {
  gradient?: 'primary' | 'success' | 'rainbow';
  borderWidth?: number;
  animate?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function GradientBorder({
  gradient = 'primary',
  borderWidth = 2,
  animate = false,
  className,
  children,
}: GradientBorderProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const gradients = {
    primary: 'from-primary via-xp to-primary',
    success: 'from-success via-success/50 to-success',
    rainbow: 'from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl',
        className,
      )}
      style={{ padding: borderWidth }}
    >
      {/* Gradient Background */}
      <motion.div
        animate={animate && !prefersReducedMotion ? { rotate: 360 } : undefined}
        transition={animate ? { duration: 3, repeat: Infinity, ease: 'linear' } : undefined}
        className={cn(
          'absolute inset-0 rounded-xl',
          'bg-gradient-to-r',
          gradients[gradient],
        )}
      />
      
      {/* Content */}
      <div className="relative rounded-lg bg-card">
        {children}
      </div>
    </div>
  );
}

// ============= FLOATING ELEMENT =============

interface FloatingElementProps {
  amplitude?: number;
  duration?: number;
  delay?: number;
  className?: string;
  children?: React.ReactNode;
}

export function FloatingElement({
  amplitude = 10,
  duration = 3,
  delay = 0,
  className,
  children,
}: FloatingElementProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate={{ y: [-amplitude, amplitude, -amplitude] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============= PULSE GLOW =============

interface PulseGlowProps {
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PulseGlow({ color = 'primary', size = 'md', className }: PulseGlowProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colors = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
  };

  return (
    <span className={cn('relative inline-flex', className)}>
      {!prefersReducedMotion && (
        <motion.span
          animate={{
            scale: [1, 2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className={cn(
            'absolute inset-0 rounded-full',
            colors[color],
          )}
        />
      )}
      <span className={cn('relative rounded-full', sizes[size], colors[color])} />
    </span>
  );
}

// ============= STAGGER CHILDREN =============

interface StaggerChildrenProps {
  staggerDelay?: number;
  className?: string;
  children: React.ReactNode;
}

export function StaggerChildren({
  staggerDelay = 0.1,
  className,
  children,
}: StaggerChildrenProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
          },
        },
      }}
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============= MORPHING BLOB =============

interface MorphingBlobProps {
  color?: string;
  size?: number;
  className?: string;
}

export function MorphingBlob({
  color = 'primary',
  size = 200,
  className,
}: MorphingBlobProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div
        className={cn('rounded-full blur-3xl', `bg-${color}/20`, className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <motion.div
      animate={{
        borderRadius: [
          '60% 40% 30% 70% / 60% 30% 70% 40%',
          '30% 60% 70% 40% / 50% 60% 30% 60%',
          '60% 40% 30% 70% / 60% 30% 70% 40%',
        ],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={cn('blur-3xl', `bg-${color}/20`, className)}
      style={{ width: size, height: size }}
    />
  );
}

// ============= EXPORTS =============

export const VisualPolishComponents = {
  HeroGradient,
  ElevatedCard,
  GlassCard,
  ParallaxSection,
  ShimmerText,
  GradientBorder,
  FloatingElement,
  PulseGlow,
  StaggerChildren,
  MorphingBlob,
};
