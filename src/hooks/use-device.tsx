import * as React from "react";

// Extend Navigator for legacy touch detection
interface NavigatorWithTouch extends Navigator {
  msMaxTouchPoints?: number;
  standalone?: boolean;
}

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const RESIZE_THROTTLE_MS = 150;

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  isStandalone: boolean;
  prefersReducedMotion: boolean;
  isOnline: boolean;
}

/**
 * Parse a CSS env() value to a number. The computed style resolves env()
 * to a pixel value (e.g. "44px") on supported devices, or returns the
 * raw string "env(...)" / empty on unsupported ones.
 */
function parseSafeAreaValue(raw: string): number {
  if (!raw) return 0;
  const num = parseFloat(raw);
  return Number.isFinite(num) ? num : 0;
}

function getDeviceInfo(): DeviceInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const nav = navigator as NavigatorWithTouch;
  const isTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (nav.msMaxTouchPoints ?? 0) > 0;

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // Read safe-area insets via CSS custom properties that resolve env()
  // Check if getComputedStyle and document.documentElement are available (SSR safety)
  let safeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 };
  if (typeof window !== 'undefined' && document.documentElement) {
    const cs = getComputedStyle(document.documentElement);
    safeAreaInsets = {
      top: parseSafeAreaValue(cs.getPropertyValue('--safe-area-top')),
      bottom: parseSafeAreaValue(cs.getPropertyValue('--safe-area-bottom')),
      left: parseSafeAreaValue(cs.getPropertyValue('--safe-area-left')),
      right: parseSafeAreaValue(cs.getPropertyValue('--safe-area-right')),
    };
  }

  return {
    isMobile: width < MOBILE_BREAKPOINT,
    isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
    isDesktop: width >= TABLET_BREAKPOINT,
    isTouch,
    orientation: width > height ? 'landscape' : 'portrait',
    safeAreaInsets,
    screenWidth: width,
    screenHeight: height,
    pixelRatio: window.devicePixelRatio,
    isStandalone,
    prefersReducedMotion,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };
}

export function useDevice(): DeviceInfo {
  const [device, setDevice] = React.useState<DeviceInfo>(getDeviceInfo);

  React.useEffect(() => {
    let rafId: number | null = null;
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;

    const update = () => {
      // Use rAF for layout-safe reads
      rafId = requestAnimationFrame(() => {
        setDevice((prev) => {
          const next = getDeviceInfo();
          // Bail out of state update if breakpoint-relevant values haven't changed
          if (
            prev.isMobile === next.isMobile &&
            prev.isTablet === next.isTablet &&
            prev.isDesktop === next.isDesktop &&
            prev.orientation === next.orientation &&
            prev.isStandalone === next.isStandalone &&
            prev.prefersReducedMotion === next.prefersReducedMotion &&
            prev.isOnline === next.isOnline &&
            prev.screenWidth === next.screenWidth &&
            prev.screenHeight === next.screenHeight
          ) {
            return prev; // no re-render
          }
          return next;
        });
      });
    };

    const throttledUpdate = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
        update();
      }, RESIZE_THROTTLE_MS);
    };

    window.addEventListener('resize', throttledUpdate);
    window.addEventListener('orientationchange', () =>
      setTimeout(throttledUpdate, 100)
    );

    const handleOnline = () =>
      setDevice((prev) => (prev.isOnline ? prev : { ...prev, isOnline: true }));
    const handleOffline = () =>
      setDevice((prev) => (!prev.isOnline ? prev : { ...prev, isOnline: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setDevice((prev) =>
        prev.prefersReducedMotion === e.matches
          ? prev
          : { ...prev, prefersReducedMotion: e.matches }
      );
    };
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', throttledUpdate);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      motionQuery.removeEventListener('change', handleMotionChange);
      if (throttleTimer) clearTimeout(throttleTimer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return device;
}

// Convenience hooks
export function useIsMobile(): boolean {
  const { isMobile } = useDevice();
  return isMobile;
}

export function useIsTablet(): boolean {
  const { isTablet } = useDevice();
  return isTablet;
}

export function useIsDesktop(): boolean {
  const { isDesktop } = useDevice();
  return isDesktop;
}

export function useIsTouch(): boolean {
  const { isTouch } = useDevice();
  return isTouch;
}

export function useOrientation(): 'portrait' | 'landscape' {
  const { orientation } = useDevice();
  return orientation;
}

export function usePrefersReducedMotion(): boolean {
  const { prefersReducedMotion } = useDevice();
  return prefersReducedMotion;
}
