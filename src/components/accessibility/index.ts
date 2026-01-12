// ============= ACCESSIBILITY - CENTRALIZED EXPORTS =============

// Skip Links
export { 
  SkipLinks, 
  MainContent,
  AccessibilityProvider,
  useLiveAnnounce,
  FocusTrap,
  LiveRegion,
  VisuallyHidden,
  AccessibleIconButton,
  usePrefersReducedMotion,
  useKeyboardNavigation,
} from './SkipLinks';

// Live Region / Announcements (from separate file)
export {
  LiveRegionProvider,
  useLiveAnnouncer,
  StatusAnnouncer,
  RouteAnnouncer,
  FormErrorAnnouncer,
} from './LiveRegion';

// Focus Management - re-exported from ui
export {
  useFocusManagement,
  useFocusVisible,
} from '@/components/ui/focus-trap';
