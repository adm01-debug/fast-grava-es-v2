import { useState, useEffect, useCallback, useRef } from 'react';

interface UseScrollDirectionOptions {
  threshold?: number;
  initialVisible?: boolean;
}

/**
 * Hook to detect scroll direction for hiding/showing UI elements
 * Returns whether UI should be visible based on scroll direction
 */
export function useScrollDirection({
  threshold = 10,
  initialVisible = true,
}: UseScrollDirectionOptions = {}) {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [scrollY, setScrollY] = useState(0);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const updateScrollDirection = useCallback(() => {
    const currentScrollY = window.scrollY;
    const diff = currentScrollY - lastScrollY.current;

    // Show when scrolling up or at top
    if (currentScrollY < threshold) {
      setIsVisible(true);
    } else if (diff > threshold) {
      // Scrolling down
      setIsVisible(false);
    } else if (diff < -threshold) {
      // Scrolling up
      setIsVisible(true);
    }

    lastScrollY.current = currentScrollY;
    setScrollY(currentScrollY);
    ticking.current = false;
  }, [threshold]);

  const onScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(updateScrollDirection);
      ticking.current = true;
    }
  }, [updateScrollDirection]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [onScroll]);

  return { isVisible, scrollY, isAtTop: scrollY < threshold };
}

export default useScrollDirection;
