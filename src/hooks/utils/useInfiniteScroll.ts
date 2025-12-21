import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(callback: () => void, options: { threshold?: number; rootMargin?: string } = {}) {
  const { threshold = 0.1, rootMargin = '100px' } = options;
  const targetRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting) callback();
  }, [callback]);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, { threshold, rootMargin });
    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver, threshold, rootMargin]);

  return targetRef;
}
