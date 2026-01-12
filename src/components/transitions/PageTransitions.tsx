/**
 * Page Transitions - Smooth page and component transitions
 * Fade, slide, scale, and custom transitions
 */

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

// ============= TRANSITION VARIANTS =============

export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideDownVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const slideLeftVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const slideRightVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const scaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const flipVariants: Variants = {
  initial: { opacity: 0, rotateY: 90 },
  animate: { opacity: 1, rotateY: 0 },
  exit: { opacity: 0, rotateY: -90 },
};

// ============= PAGE TRANSITION WRAPPER =============

type TransitionType = 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'flip';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  duration?: number;
  delay?: number;
  className?: string;
}

const variantMap: Record<TransitionType, Variants> = {
  fade: fadeVariants,
  slideUp: slideUpVariants,
  slideDown: slideDownVariants,
  slideLeft: slideLeftVariants,
  slideRight: slideRightVariants,
  scale: scaleVariants,
  flip: flipVariants,
};

export function PageTransition({
  children,
  type = 'fade',
  duration = 0.3,
  delay = 0,
  className,
}: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variantMap[type]}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration, delay, ease: 'easeInOut' }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============= ANIMATED PRESENCE =============

interface AnimatedPresenceProps {
  children: React.ReactNode;
  show: boolean;
  type?: TransitionType;
  duration?: number;
  className?: string;
}

export function AnimatedItem({
  children,
  show,
  type = 'fade',
  duration = 0.2,
  className,
}: AnimatedPresenceProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          variants={variantMap[type]}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============= STAGGER CONTAINER =============

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  type?: TransitionType;
  className?: string;
}

export function StaggerItem({
  children,
  type = 'slideUp',
  className,
}: StaggerItemProps) {
  return (
    <motion.div
      variants={variantMap[type]}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============= REVEAL ON SCROLL =============

interface RevealOnScrollProps {
  children: React.ReactNode;
  type?: TransitionType;
  delay?: number;
  threshold?: number;
  className?: string;
}

export function RevealOnScroll({
  children,
  type = 'slideUp',
  delay = 0,
  threshold = 0.1,
  className,
}: RevealOnScrollProps) {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: threshold }}
      variants={variantMap[type]}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============= MORPH TRANSITION =============

interface MorphTransitionProps {
  layoutId: string;
  children: React.ReactNode;
  className?: string;
}

export function MorphTransition({
  layoutId,
  children,
  className,
}: MorphTransitionProps) {
  return (
    <motion.div
      layoutId={layoutId}
      layout
      className={className}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============= CROSSFADE =============

interface CrossfadeProps {
  activeKey: string | number;
  children: React.ReactNode;
  duration?: number;
  className?: string;
}

export function Crossfade({
  activeKey,
  children,
  duration = 0.3,
  className,
}: CrossfadeProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============= COLLAPSE =============

interface CollapseProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Collapse({ isOpen, children, className }: CollapseProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn('overflow-hidden', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============= LOADING TRANSITION =============

interface LoadingTransitionProps {
  isLoading: boolean;
  loadingContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function LoadingTransition({
  isLoading,
  loadingContent,
  children,
  className,
}: LoadingTransitionProps) {
  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {loadingContent || (
              <div className="flex items-center justify-center p-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============= TABS TRANSITION =============

interface TabsTransitionProps {
  activeTab: string | number;
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export function TabsTransition({
  activeTab,
  children,
  direction = 'horizontal',
  className,
}: TabsTransitionProps) {
  const variants = direction === 'horizontal' ? slideLeftVariants : slideUpVariants;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default {
  PageTransition,
  AnimatedItem,
  StaggerContainer,
  StaggerItem,
  RevealOnScroll,
  MorphTransition,
  Crossfade,
  Collapse,
  LoadingTransition,
  TabsTransition,
  // Export variants for custom use
  fadeVariants,
  slideUpVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  scaleVariants,
  flipVariants,
};
