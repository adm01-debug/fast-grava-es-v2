import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface ReducedMotionContextType {
  prefersReducedMotion: boolean;
}

const ReducedMotionContext = createContext<ReducedMotionContextType>({ prefersReducedMotion: false });

export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <ReducedMotionContext.Provider value={{ prefersReducedMotion }}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

export function useReducedMotion() {
  return useContext(ReducedMotionContext);
}

interface MotionSafeProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function MotionSafe({ children, fallback }: MotionSafeProps) {
  const { prefersReducedMotion } = useReducedMotion();
  return <>{prefersReducedMotion ? (fallback || null) : children}</>;
}
