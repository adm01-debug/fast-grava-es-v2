import * as React from "react";
import { OnboardingTour, useOnboarding } from "@/components/onboarding/OnboardingTour";
import { CommandPaletteAdvanced } from "@/components/navigation/CommandPaletteAdvanced";
import { KeyboardShortcutsProvider } from "@/components/shortcuts/KeyboardShortcuts";
import { ToastContainer } from "@/components/notifications/ToastWithUndo";
import { FloatingAIAssistant } from "@/components/ai/FloatingAIAssistant";

interface ProductDesignProviderProps {
  children: React.ReactNode;
  enableOnboarding?: boolean;
  enableCommandPalette?: boolean;
  enableKeyboardShortcuts?: boolean;
  enableToastWithUndo?: boolean;
  enableAIAssistant?: boolean;
}

/**
 * ProductDesignProvider - Wraps the app with all Product Design improvements
 * 
 * Features included:
 * - Onboarding Tour (first-time user experience)
 * - Command Palette (Cmd+K for quick navigation)
 * - Keyboard Shortcuts (vim-like navigation)
 * - Toast with Undo (undoable notifications)
 * - AI Assistant (floating chat widget)
 */
export function ProductDesignProvider({
  children,
  enableOnboarding = true,
  enableCommandPalette = true,
  enableKeyboardShortcuts = true,
  enableToastWithUndo = true,
  enableAIAssistant = true,
}: ProductDesignProviderProps) {
  const { showTour, setShowTour } = useOnboarding();

  const content = (
    <>
      {children}

      {/* Onboarding Tour */}
      {enableOnboarding && (
        <OnboardingTour
          isOpen={showTour}
          onClose={() => setShowTour(false)}
          onComplete={() => setShowTour(false)}
        />
      )}

      {/* Command Palette (Cmd+K) */}
      {enableCommandPalette && <CommandPaletteAdvanced />}

      {/* Toast Container for undoable notifications */}
      {enableToastWithUndo && <ToastContainer />}

      {/* Floating AI Assistant */}
      {enableAIAssistant && <FloatingAIAssistant />}
    </>
  );

  // Wrap with keyboard shortcuts provider if enabled
  if (enableKeyboardShortcuts) {
    return <KeyboardShortcutsProvider>{content}</KeyboardShortcutsProvider>;
  }

  return content;
}

// Export all design improvement components for individual use
export { OnboardingTour, useOnboarding } from "@/components/onboarding/OnboardingTour";
export { CommandPaletteAdvanced as CommandPalette, CommandPaletteTriggerAdvanced as CommandPaletteTrigger } from "@/components/navigation/CommandPaletteAdvanced";
export { FavoriteButton, FavoritesDropdown, useFavorites } from "@/components/navigation/FavoritesManager";
export { GlobalSearch as PopoverGlobalSearch, CompactSearch } from "@/components/navigation/GlobalSearch";
export { SwipeActions, SwipeActionPresets } from "@/components/mobile/SwipeActions";
export { PullToRefresh, MobilePullToRefresh } from "@/components/mobile/PullToRefresh";
export { BottomNavigation, BottomNavSpacer } from "@/components/mobile/BottomNavigation";
export { FloatingActionButton } from "@/components/mobile/FloatingActionButton";
export { CollapsibleNavGroup } from "@/components/navigation/CollapsibleNavGroup";
export { EmptyState, EmptyStates } from "@/components/ui/empty-state";
export { CelebrationMoment, useCelebration, MiniCelebration as InlineCelebration } from "@/components/feedback/CelebrationMoment";
export { FeedbackState, InlineLoader, SuccessCheck } from "@/components/feedback/FeedbackState";
export { ProgressRing, ProgressBar, StepProgress } from "@/components/feedback/ProgressIndicators";
export { Skeleton, SkeletonCard, SkeletonList, SkeletonTable, SkeletonDashboard, SkeletonChart, SkeletonForm } from "@/components/ui/skeleton-screens";
export { ToastContainer, toast as toastWithUndo } from "@/components/notifications/ToastWithUndo";
export { NotificationCenter } from "@/components/notifications/NotificationCenter";
export { CelebrationOverlay, AnimatedXPBar, MiniCelebration } from "@/components/gamification/CelebrationAnimations";
export { KeyboardShortcutsProvider, useKeyboardShortcuts, useRegisterShortcut } from "@/components/shortcuts/KeyboardShortcuts";
export { SessionManagement, ConfirmationDialog } from "@/components/security/SessionManagement";
export { DashboardCustomizer, useDashboardConfig, AnimatedWidget, DashboardGrid } from "@/components/dashboard/DashboardCustomizer";
// Responsive utilities now provided by layout/ResponsiveContainer and hooks/use-device
export { ResponsiveContainer, ResponsiveGrid, ResponsiveStack, HideOn, ShowOn, MobileOnly, DesktopOnly, TabletUp } from "@/components/layout/ResponsiveContainer";
export { FloatingAIAssistant } from "@/components/ai/FloatingAIAssistant";
export { ActivityLog, useActivityLog } from "@/components/activity/ActivityLog";
export { useFocusTrap, SkipToContent, useLiveRegion, AccessibleIconButton, useReducedMotion, useKeyboardNavigation, VisuallyHidden, FocusRing } from "@/components/accessibility/AccessibilityUtils";
export { useLocale, useNumberFormat, useDateFormat, useListFormat, usePlural, useFileSizeFormat, useDurationFormat, formatPhoneNumber, formatDocument } from "@/lib/formatters";
// Removed: useOptimisticUpdate (unused), confetti (using canvas-confetti directly)
export { usePushNotifications } from "@/hooks/usePushNotifications";
export { useRoutePrefetch, usePrefetchRoute } from "@/hooks/useRoutePrefetch";
export { PushNotificationPrompt, PushNotificationToggle } from "@/components/notifications/PushNotificationPrompt";
export { KioskMode, KioskModeButton } from "@/components/kiosk/KioskMode";
export { useDevice, useIsMobile, useIsTablet, useIsDesktop, useIsTouch, useOrientation, usePrefersReducedMotion } from "@/hooks/use-device";
