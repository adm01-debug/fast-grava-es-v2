import { ReactNode } from "react";
import { ProviderComposer } from "./ProviderComposer";
import { ThemeProvider } from "next-themes";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/features/auth";
import { ReauthProvider } from "@/contexts/ReauthContext";
import { EfficiencyNotificationProvider } from "@/features/notifications/components/EfficiencyNotificationProvider";
import { RealtimeNotificationsProvider } from "@/features/notifications/components/RealtimeNotificationsProvider";
import { OfflineSyncProvider } from "@/contexts/OfflineSyncContext";
import { ProductDesignProvider } from "@/components/design-system/ProductDesignProvider";
import { CelebrationProvider } from "@/components/ui/celebration";
import { FeedbackProvider } from "@/components/feedback/FeedbackProvider";
import { NetworkStatusProvider } from "@/hooks/useNetworkStatus";
import { OfflineProvider } from "@/hooks/useLocalStorage";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { NavigationListener } from "@/components/navigation/NavigationListener";
import { InAppNotificationWatcher } from "@/features/notifications/components/InAppNotificationWatcher";
import { SmartAlertsWatcher } from "@/features/notifications/components/SmartAlertsWatcher";
import { BIAlertsWatcher } from "@/features/analytics/components/bi/BIAlertsWatcher";

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

function ComposedProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <ProviderComposer
        providers={[
          ThemeContextProvider,
          TooltipProvider,
          UserPreferencesProvider,
          FeatureFlagsProvider,
          BreadcrumbProvider,
          SearchProvider,
          SidebarProvider,
          ConfirmationProvider,
          NotificationsProvider,
          AuthProvider,
          ReauthProvider,
          PermissionsProvider,
          OfflineSyncProvider,
          NetworkStatusProvider,
          OfflineProvider,
          WebSocketProvider,
          EfficiencyNotificationProvider,
          RealtimeNotificationsProvider,
          // Special case for ProductDesignProvider as it has props
          ({ children }) => (
            <ProductDesignProvider
              enableOnboarding
              enableCommandPalette
              enableKeyboardShortcuts
              enableToastWithUndo
            >
              {children}
            </ProductDesignProvider>
          ),
          CelebrationProvider,
          FeedbackProvider,
        ]}
      >
        {children}
      </ProviderComposer>
    </ThemeProvider>
  );
}

function Observers() {
  return (
    <>
      <NavigationListener />
      <InAppNotificationWatcher />
      <SmartAlertsWatcher />
      <BIAlertsWatcher />
    </>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ComposedProviders>
            <Observers />
            {children}
          </ComposedProviders>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
