import { motion, Variants, Transition } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: 20,
    filter: "blur(4px)",
  },
  in: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
  },
  out: {
    opacity: 0,
    x: -20,
    filter: "blur(4px)",
  },
};

const pageTransition: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
  mass: 0.5,
};

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
