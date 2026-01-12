/**
 * Advanced Interaction Components - Enhanced UX patterns
 * Tooltips, popovers, context menus, and interactive elements
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X, ChevronRight, Check, Copy, ExternalLink } from 'lucide-react';

// ============= MAGNETIC BUTTON =============

interface MagneticButtonProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  onClick?: () => void;
}

export function MagneticButton({ 
  children, 
  strength = 0.3, 
  className,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
    >
      {children}
    </motion.button>
  );
}

// ============= TILT CARD =============

interface TiltCardProps {
  children: React.ReactNode;
  maxTilt?: number;
  scale?: number;
  className?: string;
}

export function TiltCard({ children, maxTilt = 10, scale = 1.02, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    x.set((e.clientX - rect.left) / width - 0.5);
    y.set((e.clientY - rect.top) / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, perspective: 1000 }}
      whileHover={{ scale }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('transform-gpu', className)}
    >
      {children}
    </motion.div>
  );
}

// ============= COPY TO CLIPBOARD =============

interface CopyButtonProps {
  text: string;
  className?: string;
  onCopy?: () => void;
}

export function CopyButton({ text, className, onCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.button
      onClick={handleCopy}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm',
        'bg-muted hover:bg-muted/80 transition-colors',
        className
      )}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="text-green-500"
          >
            <Check className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Copy className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
    </motion.button>
  );
}

// ============= EXPANDABLE TEXT =============

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  className?: string;
}

export function ExpandableText({ text, maxLines = 3, className }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseFloat(getComputedStyle(textRef.current).lineHeight);
      const maxHeight = lineHeight * maxLines;
      setNeedsExpansion(textRef.current.scrollHeight > maxHeight);
    }
  }, [text, maxLines]);

  return (
    <div className={className}>
      <motion.p
        ref={textRef}
        animate={{ height: isExpanded ? 'auto' : `${maxLines * 1.5}em` }}
        className={cn(
          'overflow-hidden transition-all',
          !isExpanded && needsExpansion && 'line-clamp-3'
        )}
        style={{ lineHeight: '1.5em' }}
      >
        {text}
      </motion.p>
      {needsExpansion && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm text-primary hover:underline"
        >
          {isExpanded ? 'Mostrar menos' : 'Mostrar mais'}
        </button>
      )}
    </div>
  );
}

// ============= SPOTLIGHT EFFECT =============

interface SpotlightProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function Spotlight({ 
  children, 
  className,
  spotlightColor = 'rgba(var(--primary-rgb), 0.15)',
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn('relative overflow-hidden', className)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 60%)`,
            }}
          />
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}

// ============= ANIMATED LIST =============

interface AnimatedListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export function AnimatedList({ children, staggerDelay = 0.05, className }: AnimatedListProps) {
  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {React.Children.map(children, (child, i) => (
        <motion.li
          key={i}
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 },
          }}
          transition={{ duration: 0.3 }}
        >
          {child}
        </motion.li>
      ))}
    </motion.ul>
  );
}

// ============= HIGHLIGHT TEXT =============

interface HighlightTextProps {
  text: string;
  highlight: string;
  highlightClassName?: string;
  className?: string;
}

export function HighlightText({ 
  text, 
  highlight, 
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-800',
  className,
}: HighlightTextProps) {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) => (
        regex.test(part) ? (
          <mark key={i} className={cn('rounded px-0.5', highlightClassName)}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      ))}
    </span>
  );
}

// ============= MORPHING NUMBER =============

interface MorphingNumberProps {
  value: number;
  duration?: number;
  formatFn?: (value: number) => string;
  className?: string;
}

export function MorphingNumber({ 
  value, 
  duration = 1, 
  formatFn = (v) => Math.round(v).toString(),
  className,
}: MorphingNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const startValue = prevValue.current;
    const endValue = value;
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const animate = () => {
      const now = Date.now();
      if (now >= endTime) {
        setDisplayValue(endValue);
        prevValue.current = endValue;
        return;
      }

      const progress = (now - startTime) / (duration * 1000);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const current = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(current);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <motion.span
      key={value}
      initial={{ opacity: 0.5, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {formatFn(displayValue)}
    </motion.span>
  );
}

// ============= NOTIFICATION DOT =============

interface NotificationDotProps {
  count?: number;
  max?: number;
  show?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function NotificationDot({ 
  count, 
  max = 99, 
  show = true, 
  className,
  children,
}: NotificationDotProps) {
  const displayCount = count && count > max ? `${max}+` : count;

  return (
    <div className="relative inline-flex">
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={cn(
              'absolute -top-1 -right-1 flex items-center justify-center',
              'min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground',
              'text-[10px] font-bold',
              !count && 'w-2 h-2 min-w-0',
              className
            )}
          >
            {count && displayCount}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============= SWIPEABLE =============

interface SwipeableProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
}

export function Swipeable({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  className,
}: SwipeableProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, opacity }}
      onDragEnd={(_, info) => {
        if (info.offset.x > threshold && onSwipeRight) {
          onSwipeRight();
        } else if (info.offset.x < -threshold && onSwipeLeft) {
          onSwipeLeft();
        }
      }}
      className={cn('touch-pan-y', className)}
    >
      {children}
    </motion.div>
  );
}

// ============= TYPEWRITER =============

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  className?: string;
}

export function Typewriter({ 
  text, 
  speed = 50, 
  delay = 0,
  onComplete,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);

    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-[1em] bg-current ml-0.5"
        />
      )}
    </span>
  );
}

export default {
  MagneticButton,
  TiltCard,
  CopyButton,
  ExpandableText,
  Spotlight,
  AnimatedList,
  HighlightText,
  MorphingNumber,
  NotificationDot,
  Swipeable,
  Typewriter,
};
