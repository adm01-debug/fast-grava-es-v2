import * as React from "react";
import { OnboardingTour, useOnboarding } from "@/components/onboarding/OnboardingTour";
import { CommandPalette } from "@/components/navigation/CommandPalette";
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
      {enableCommandPalette && <CommandPalette />}

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
export { CommandPalette, CommandPaletteTrigger } from "@/components/navigation/CommandPalette";
export { FavoriteButton, FavoritesDropdown, useFavorites } from "@/components/navigation/FavoritesManager";
export { GlobalSearch, CompactSearch } from "@/components/navigation/GlobalSearch";
export { SwipeActions, SwipeActionPresets } from "@/components/mobile/SwipeActions";
export { PullToRefresh, MobilePullToRefresh } from "@/components/mobile/PullToRefresh";
export { EmptyState, EmptyStates } from "@/components/ui/empty-state";
export { Skeleton, SkeletonCard, SkeletonList, SkeletonTable, SkeletonDashboard, SkeletonChart, SkeletonForm } from "@/components/ui/skeleton-screens";
export { ToastContainer, toast as toastWithUndo } from "@/components/notifications/ToastWithUndo";
export { NotificationCenter } from "@/components/notifications/NotificationCenter";
export { CelebrationOverlay, AnimatedXPBar, MiniCelebration } from "@/components/gamification/CelebrationAnimations";
export { KeyboardShortcutsProvider, useKeyboardShortcuts, useRegisterShortcut } from "@/components/shortcuts/KeyboardShortcuts";
export { SessionManagement, ConfirmationDialog } from "@/components/security/SessionManagement";
export { MultiStepForm, ValidatedInput } from "@/components/forms/MultiStepForm";
export { EnhancedTable } from "@/components/tables/EnhancedTable";
export { DashboardCustomizer, useDashboardConfig, AnimatedWidget, DashboardGrid } from "@/components/dashboard/DashboardCustomizer";
export { useBreakpoint, useDeviceCapabilities, ResponsiveContainer, Show, TouchOptimized, AdaptiveText, AdaptiveGrid, ResponsiveStack, SafeArea, ScrollContainer } from "@/components/responsive/AdaptiveContent";
export { AIAssistantWidget, AISuggestions } from "@/components/ai/AIAssistantWidget";
export { FloatingAIAssistant } from "@/components/ai/FloatingAIAssistant";
export { LivePresence, CursorPresence, ActivityIndicator, WhosHereBanner, useLivePresence } from "@/components/collaboration/LivePresence";
export { WorkflowAutomation, AutomationTrigger } from "@/components/automation/WorkflowAutomation";
export { AutomationBuilder } from "@/components/automation/AutomationBuilder";
export { ActivityLog, useActivityLog } from "@/components/activity/ActivityLog";
export { useFocusTrap, SkipToContent, useLiveRegion, AccessibleIconButton, useReducedMotion, useKeyboardNavigation, VisuallyHidden, FocusRing } from "@/components/accessibility/AccessibilityUtils";
export { useLocale, useNumberFormat, useDateFormat, useListFormat, usePlural, useFileSizeFormat, useDurationFormat, formatPhoneNumber, formatDocument } from "@/lib/formatters";
export { useOptimisticUpdate } from "@/hooks/useOptimisticUpdates";
export { default as confetti } from "@/lib/confetti";
export { usePushNotifications } from "@/hooks/usePushNotifications";
export { useRoutePrefetch, usePrefetchRoute } from "@/hooks/useRoutePrefetch";
export { PushNotificationPrompt, PushNotificationToggle } from "@/components/notifications/PushNotificationPrompt";
export { KioskMode, KioskModeButton } from "@/components/kiosk/KioskMode";
