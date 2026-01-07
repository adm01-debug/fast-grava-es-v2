import { useState, useEffect, useCallback, useRef } from 'react';
import { useSystemPreferences } from '@/hooks/use-media';

// Hook para animação de contagem
export function useCountUp(
  end: number,
  options?: {
    start?: number;
    duration?: number;
    delay?: number;
    decimals?: number;
    easing?: 'linear' | 'easeOut' | 'easeInOut';
  }
) {
  const { start = 0, duration = 2000, delay = 0, decimals = 0, easing = 'easeOut' } = options || {};
  const [count, setCount] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);
  const { prefersReducedMotion } = useSystemPreferences();

  const easingFunctions = {
    linear: (t: number) => t,
    easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
    easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  };

  const animate = useCallback(() => {
    if (prefersReducedMotion) {
      setCount(end);
      return;
    }

    setIsAnimating(true);
    const startTime = Date.now();
    const diff = end - start;

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunctions[easing](progress);
      
      setCount(Number((start + diff * easedProgress).toFixed(decimals)));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setIsAnimating(false);
      }
    };

    if (delay > 0) {
      setTimeout(() => requestAnimationFrame(step), delay);
    } else {
      requestAnimationFrame(step);
    }
  }, [end, start, duration, delay, decimals, easing, prefersReducedMotion]);

  useEffect(() => {
    animate();
  }, [animate]);

  return { count, isAnimating, restart: animate };
}

// Hook para animação de typing
export function useTypewriter(
  text: string,
  options?: {
    speed?: number;
    delay?: number;
    loop?: boolean;
    cursor?: boolean;
  }
) {
  const { speed = 50, delay = 0, loop = false, cursor = true } = options || {};
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(cursor);
  const { prefersReducedMotion } = useSystemPreferences();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayText(text);
      return;
    }

    let timeout: NodeJS.Timeout;
    let charIndex = 0;
    setIsTyping(true);

    const type = () => {
      if (charIndex < text.length) {
        setDisplayText(text.slice(0, charIndex + 1));
        charIndex++;
        timeout = setTimeout(type, speed);
      } else {
        setIsTyping(false);
        if (loop) {
          timeout = setTimeout(() => {
            charIndex = 0;
            setDisplayText('');
            setIsTyping(true);
            type();
          }, 2000);
        }
      }
    };

    timeout = setTimeout(type, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay, loop, prefersReducedMotion]);

  // Cursor blink
  useEffect(() => {
    if (!cursor) return;
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, [cursor]);

  return { 
    displayText, 
    isTyping, 
    cursor: showCursor && cursor ? '|' : '',
    fullText: displayText + (showCursor && cursor ? '|' : '')
  };
}

// Hook para animação de scroll reveal
export function useScrollReveal(options?: {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}) {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options || {};
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

// Hook para animação de spring
export function useSpring(
  targetValue: number,
  config?: { stiffness?: number; damping?: number; mass?: number }
) {
  const { stiffness = 170, damping = 26, mass = 1 } = config || {};
  const [value, setValue] = useState(targetValue);
  const velocity = useRef(0);
  const { prefersReducedMotion } = useSystemPreferences();

  useEffect(() => {
    if (prefersReducedMotion) {
      setValue(targetValue);
      return;
    }

    let animationId: number;
    const animate = () => {
      const displacement = targetValue - value;
      const springForce = stiffness * displacement;
      const dampingForce = damping * velocity.current;
      const acceleration = (springForce - dampingForce) / mass;
      
      velocity.current += acceleration * 0.016;
      const newValue = value + velocity.current * 0.016;
      
      if (Math.abs(displacement) < 0.01 && Math.abs(velocity.current) < 0.01) {
        setValue(targetValue);
        velocity.current = 0;
      } else {
        setValue(newValue);
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [targetValue, stiffness, damping, mass, prefersReducedMotion, value]);

  return value;
}

// Hook para parallax
export function useParallax(speed: number = 0.5) {
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const { prefersReducedMotion } = useSystemPreferences();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const elementTop = rect.top + scrolled;
      const relativeScroll = scrolled - elementTop + window.innerHeight;
      setOffset(relativeScroll * speed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, prefersReducedMotion]);

  return { ref, offset, style: { transform: `translateY(${offset}px)` } };
}

// Hook para animação de morph entre valores
export function useMorph<T extends Record<string, number>>(
  values: T,
  duration: number = 300
) {
  const [currentValues, setCurrentValues] = useState(values);
  const { prefersReducedMotion } = useSystemPreferences();

  useEffect(() => {
    if (prefersReducedMotion) {
      setCurrentValues(values);
      return;
    }

    const startValues = { ...currentValues };
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const newValues = {} as T;
      for (const key in values) {
        const start = startValues[key] || 0;
        const end = values[key];
        newValues[key] = (start + (end - start) * eased) as T[typeof key];
      }

      setCurrentValues(newValues);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [values, duration, prefersReducedMotion]);

  return currentValues;
}

// Hook para stagger animation
export function useStagger(
  itemCount: number,
  options?: { delay?: number; duration?: number }
) {
  const { delay = 100, duration = 500 } = options || {};
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const { prefersReducedMotion } = useSystemPreferences();

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleItems(Array.from({ length: itemCount }, (_, i) => i));
      return;
    }

    setVisibleItems([]);
    const timeouts: NodeJS.Timeout[] = [];

    for (let i = 0; i < itemCount; i++) {
      const timeout = setTimeout(() => {
        setVisibleItems(prev => [...prev, i]);
      }, i * delay);
      timeouts.push(timeout);
    }

    return () => timeouts.forEach(clearTimeout);
  }, [itemCount, delay, prefersReducedMotion]);

  const isVisible = (index: number) => visibleItems.includes(index);
  const getDelay = (index: number) => index * delay;
  
  return { visibleItems, isVisible, getDelay, duration };
}

// Hook para shake animation
export function useShake() {
  const [isShaking, setIsShaking] = useState(false);
  const { prefersReducedMotion } = useSystemPreferences();

  const shake = useCallback(() => {
    if (prefersReducedMotion) return;
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, [prefersReducedMotion]);

  const shakeStyle = isShaking ? {
    animation: 'shake 0.5s ease-in-out'
  } : {};

  return { isShaking, shake, shakeStyle };
}

// Hook para pulse animation
export function usePulse(interval: number = 2000) {
  const [isPulsing, setIsPulsing] = useState(false);
  const { prefersReducedMotion } = useSystemPreferences();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const pulse = () => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 300);
    };

    const intervalId = setInterval(pulse, interval);
    pulse();

    return () => clearInterval(intervalId);
  }, [interval, prefersReducedMotion]);

  return { isPulsing };
}
