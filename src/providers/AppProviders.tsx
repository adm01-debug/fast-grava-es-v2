import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

// Contextos de infraestrutura
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

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeContextProvider>
          <TooltipProvider>
            <UserPreferencesProvider>
              <FeatureFlagsProvider>
                <BrowserRouter>
                  <NavigationListener />
                  <BreadcrumbProvider>
                    <SearchProvider>
                      <SidebarProvider>
                        <ConfirmationProvider>
                          <NotificationsProvider>
                            <AuthProvider>
                              <ReauthProvider>
                                <PermissionsProvider>
                                  <SessionManager>
                                    <OfflineSyncProvider>
                                      <NetworkStatusProvider>
                                        <WebSocketProvider>
                                          <EfficiencyNotificationProvider>
                                            <RealtimeNotificationsProvider>
                                              <InAppNotificationWatcher />
                                              <SmartAlertsWatcher />
                                              <ProductDesignProvider
                                                enableOnboarding={true}
                                                enableCommandPalette={true}
                                                enableKeyboardShortcuts={true}
                                                enableToastWithUndo={true}
                                              >
                                                <CelebrationProvider>
                                                  <FeedbackProvider>
                                                    {children}
                                                  </FeedbackProvider>
                                                </CelebrationProvider>
                                              </ProductDesignProvider>
                                            </RealtimeNotificationsProvider>
                                          </EfficiencyNotificationProvider>
                                        </WebSocketProvider>
                                      </NetworkStatusProvider>
                                    </OfflineSyncProvider>
                                  </SessionManager>
                                </PermissionsProvider>
                              </ReauthProvider>
                            </AuthProvider>
                          </NotificationsProvider>
                        </ConfirmationProvider>
                      </SidebarProvider>
                    </SearchProvider>
                  </BreadcrumbProvider>
                </BrowserRouter>
              </FeatureFlagsProvider>
            </UserPreferencesProvider>
          </TooltipProvider>
        </ThemeContextProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
