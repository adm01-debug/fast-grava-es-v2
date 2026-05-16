import { motion, Variants, Transition } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  direction?: 'forward' | 'backward';
}

const getVariants = (direction: 'forward' | 'backward'): Variants => ({
  initial: {
    opacity: 0,
    x: direction === 'forward' ? 30 : -30,
    filter: "blur(8px)",
  },
  in: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
  },
  out: {
    opacity: 0,
    x: direction === 'forward' ? -30 : 30,
    filter: "blur(8px)",
  },
});

const pageTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 1,
};

export function PageTransition({ children, direction = 'forward' }: PageTransitionProps) {
  const variants = getVariants(direction);

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={pageTransition}
      className="h-full w-full will-change-transform"
    >
      {children}
    </motion.div>
  );
}
