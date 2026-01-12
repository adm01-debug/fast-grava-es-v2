import * as React from "react";

// Extend Navigator for legacy touch detection
interface NavigatorWithTouch extends Navigator {
  msMaxTouchPoints?: number;
  standalone?: boolean;
}

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

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
  isStandalone: boolean; // PWA mode
  prefersReducedMotion: boolean;
  isOnline: boolean;
}

export function useDevice(): DeviceInfo {
  const [device, setDevice] = React.useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    orientation: 'portrait',
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    isStandalone: false,
    prefersReducedMotion: false,
    isOnline: true,
  });

  React.useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Detect touch capability
      const nav = navigator as NavigatorWithTouch;
      const isTouch = 'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        (nav.msMaxTouchPoints ?? 0) > 0;

      // Detect PWA standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        nav.standalone === true;

      // Detect reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Get safe area insets from CSS environment variables
      const computedStyle = getComputedStyle(document.documentElement);
      const safeAreaInsets = {
        top: parseInt(computedStyle.getPropertyValue('--safe-area-top') || '0', 10) || 0,
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-bottom') || '0', 10) || 0,
        left: parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0', 10) || 0,
        right: parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0', 10) || 0,
      };

      setDevice({
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
        isOnline: navigator.onLine,
      });
    };

    checkDevice();

    // Listen for resize events
    const handleResize = () => checkDevice();
    window.addEventListener('resize', handleResize);

    // Listen for orientation change
    const handleOrientationChange = () => {
      // Delay to ensure dimensions are updated
      setTimeout(checkDevice, 100);
    };
    window.addEventListener('orientationchange', handleOrientationChange);

    // Listen for online/offline
    const handleOnline = () => setDevice(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setDevice(prev => ({ ...prev, isOnline: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for reduced motion preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setDevice(prev => ({ ...prev, prefersReducedMotion: e.matches }));
    };
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return device;
}

// Convenience hooks for specific device checks
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
