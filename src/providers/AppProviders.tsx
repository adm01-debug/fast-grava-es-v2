import { ReactNode, ComponentType } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReauthProvider } from "@/contexts/ReauthContext";
import { EfficiencyNotificationProvider } from "@/components/notifications/EfficiencyNotificationProvider";
import { RealtimeNotificationsProvider } from "@/components/notifications/RealtimeNotificationsProvider";
import { OfflineSyncProvider } from "@/contexts/OfflineSyncContext";
import { SessionManager } from "@/hooks/useSessionManager";
import { ProductDesignProvider } from "@/components/design-system/ProductDesignProvider";
import { CelebrationProvider } from "@/components/ui/celebration";
import { FeedbackProvider } from "@/components/feedback/FeedbackProvider";
import { NetworkStatusProvider } from "@/hooks/useNetworkStatus";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { NavigationListener } from "@/components/navigation/NavigationListener";
import { InAppNotificationWatcher } from "@/components/notifications/InAppNotificationWatcher";
import { SmartAlertsWatcher } from "@/components/notifications/SmartAlertsWatcher";

import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import { ConfirmationProvider } from "@/contexts/ConfirmationContext";
import { FeatureFlagsProvider } from "@/contexts/FeatureFlagsContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ThemeContextProvider } from "@/contexts/ThemeContext";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";

import { createQueryClient } from "@/lib/queryConfig";

const queryClient = createQueryClient();

/**
 * Composes an array of providers into a single wrapper, eliminating deep nesting.
 * Each entry is either a Provider component or a tuple [Provider, props].
 */
type ProviderEntry =
  | ComponentType<{ children: ReactNode }>
  | [ComponentType<any>, Record<string, unknown>];

function composeProviders(entries: ProviderEntry[]): ComponentType<{ children: ReactNode }> {
  return function ComposedProviders({ children }: { children: ReactNode }) {
    return entries.reduceRight<ReactNode>((acc, entry) => {
      if (Array.isArray(entry)) {
        const [Provider, props] = entry;
        return <Provider {...props}>{acc}</Provider>;
      }
      const Provider = entry;
      return <Provider>{acc}</Provider>;
    }, children);
  };
}

// Standalone observer components (no children)
function Observers() {
  return (
    <>
      <NavigationListener />
      <InAppNotificationWatcher />
      <SmartAlertsWatcher />
    </>
  );
}

// Build the composed tree – order matters (outermost first)
const ComposedProviders = composeProviders([
  // Infrastructure layer (no auth dependency)
  ThemeContextProvider,
  [TooltipProvider, {}],
  UserPreferencesProvider,
  FeatureFlagsProvider,
  // Router-dependent layer
  BreadcrumbProvider,
  SearchProvider,
  SidebarProvider,
  ConfirmationProvider,
  NotificationsProvider,
  // Auth layer
  AuthProvider,
  ReauthProvider,
  PermissionsProvider,
  SessionManager,
  // Data & sync layer
  OfflineSyncProvider,
  NetworkStatusProvider,
  WebSocketProvider,
  // Feature layer
  EfficiencyNotificationProvider,
  RealtimeNotificationsProvider,
  [ProductDesignProvider, {
    enableOnboarding: true,
    enableCommandPalette: true,
    enableKeyboardShortcuts: true,
    enableToastWithUndo: true,
  }],
  CelebrationProvider,
  FeedbackProvider,
]);

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Observers />
          <ComposedProviders>
            {children}
          </ComposedProviders>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
