import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReauthProvider } from "@/contexts/ReauthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EfficiencyNotificationProvider } from "@/components/notifications/EfficiencyNotificationProvider";
import { RealtimeNotificationsProvider } from "@/components/notifications/RealtimeNotificationsProvider";
import { OfflineSyncProvider } from "@/contexts/OfflineSyncContext";
import { SessionManager } from "@/hooks/useSessionManager";
import { PageTransition } from "@/components/layout/PageTransition";
import { NavigationListener } from "@/components/navigation/NavigationListener";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ProductDesignProvider } from "@/components/design-system/ProductDesignProvider";
import { PushNotificationPrompt } from "@/components/notifications/PushNotificationPrompt";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch";
import {
  DashboardPageSkeleton,
  CalendarPageSkeleton,
  KanbanPageSkeleton,
  ListPageSkeleton,
  KPIPageSkeleton,
  EfficiencyPageSkeleton,
  AuthPageSkeleton,
  TablePageSkeleton,
} from "@/components/ui/page-skeletons";

// Lazy load all pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const DailyCalendar = lazy(() => import("./pages/DailyCalendar"));
const WeeklyCalendar = lazy(() => import("./pages/WeeklyCalendar"));
const PendingQueue = lazy(() => import("./pages/PendingQueue"));
const AlertsDashboard = lazy(() => import("./pages/AlertsDashboard"));
const KanbanBoard = lazy(() => import("./pages/KanbanBoard"));
const KPIDashboard = lazy(() => import("./pages/KPIDashboard"));
const OperatorView = lazy(() => import("./pages/OperatorView"));
const EfficiencyDashboard = lazy(() => import("./pages/EfficiencyDashboard"));
const TechnicalAssistantPage = lazy(() => import("./pages/TechnicalAssistantPage"));
const QRScannerPage = lazy(() => import("./pages/QRScannerPage"));
const Bitrix24ConfigPage = lazy(() => import("./pages/Bitrix24ConfigPage"));
const TechnicalKnowledgeBase = lazy(() => import("./pages/TechnicalKnowledgeBase"));
const DesignSystemPage = lazy(() => import("./pages/DesignSystemPage"));
const NewJobPage = lazy(() => import("./pages/NewJobPage"));
const MachinesPage = lazy(() => import("./pages/MachinesPage"));
const OperatorsPage = lazy(() => import("./pages/OperatorsPage"));
const OperatorProductivityPage = lazy(() => import("./pages/OperatorProductivityPage"));
const OEEDashboard = lazy(() => import("./pages/OEEDashboard"));
const ABCCostingDashboard = lazy(() => import("./pages/ABCCostingDashboard"));
const TPMDashboard = lazy(() => import("./pages/TPMDashboard"));
const MLPredictionsDashboard = lazy(() => import("./pages/MLPredictionsDashboard"));
const BIDashboard = lazy(() => import("./pages/BIDashboard"));
const CodeQualityDashboard = lazy(() => import("./pages/CodeQualityDashboard"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const TraceabilityPage = lazy(() => import("./pages/TraceabilityPage"));
const SPCDashboard = lazy(() => import("./pages/SPCDashboard"));
const ShiftHandoverPage = lazy(() => import("./pages/ShiftHandoverPage"));
const ExecutiveDashboard = lazy(() => import("./pages/ExecutiveDashboard"));
const GamificationPage = lazy(() => import("./pages/GamificationPage"));
const EnergyDashboard = lazy(() => import("./pages/EnergyDashboard"));
const DocumentsPage = lazy(() => import("./pages/DocumentsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const SecurityDashboard = lazy(() => import("./pages/SecurityDashboard"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const InstallAppPage = lazy(() => import("./pages/InstallAppPage"));
const KioskPage = lazy(() => import("./pages/KioskPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  
  // Prefetch de rotas críticas
  useRoutePrefetch();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={
          <PageTransition>
            <Suspense fallback={<AuthPageSkeleton />}>
              <AuthPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/reset-password" element={
          <PageTransition>
            <Suspense fallback={<AuthPageSkeleton />}>
              <ResetPasswordPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
            <PageTransition>
              <Suspense fallback={<DashboardPageSkeleton />}>
                <Index />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/calendar/daily" element={
          <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
            <PageTransition>
              <Suspense fallback={<CalendarPageSkeleton />}>
                <DailyCalendar />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/calendar/weekly" element={
          <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
            <PageTransition>
              <Suspense fallback={<CalendarPageSkeleton />}>
                <WeeklyCalendar />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/pending" element={
          <ProtectedRoute allowedRoles={['coordinator']}>
            <PageTransition>
              <Suspense fallback={<ListPageSkeleton />}>
                <PendingQueue />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/alerts" element={
          <ProtectedRoute>
            <PageTransition>
              <Suspense fallback={<DashboardPageSkeleton />}>
                <AlertsDashboard />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/kanban" element={
          <ProtectedRoute allowedRoles={['coordinator']}>
            <PageTransition>
              <Suspense fallback={<KanbanPageSkeleton />}>
                <KanbanBoard />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/kpis" element={
          <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
            <PageTransition>
              <Suspense fallback={<KPIPageSkeleton />}>
                <KPIDashboard />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/operator" element={
          <ProtectedRoute>
            <PageTransition>
              <Suspense fallback={<ListPageSkeleton />}>
                <OperatorView />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/efficiency" element={
          <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
            <PageTransition>
              <Suspense fallback={<EfficiencyPageSkeleton />}>
                <EfficiencyDashboard />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/assistant" element={
          <ProtectedRoute>
            <PageTransition>
              <Suspense fallback={<DashboardPageSkeleton />}>
                <TechnicalAssistantPage />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/scanner" element={
          <ProtectedRoute>
            <PageTransition>
              <Suspense fallback={<DashboardPageSkeleton />}>
                <QRScannerPage />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/integrations/bitrix24" element={
          <ProtectedRoute allowedRoles={['coordinator']}>
            <PageTransition>
              <Suspense fallback={<TablePageSkeleton />}>
                <Bitrix24ConfigPage />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/knowledge" element={
          <ProtectedRoute>
            <PageTransition>
              <Suspense fallback={<ListPageSkeleton />}>
                <TechnicalKnowledgeBase />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/design-system" element={
          <PageTransition>
            <Suspense fallback={<DashboardPageSkeleton />}>
              <DesignSystemPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/new-job" element={
          <ProtectedRoute allowedRoles={['coordinator']}>
            <PageTransition>
              <Suspense fallback={<DashboardPageSkeleton />}>
                <NewJobPage />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/machines" element={
          <ProtectedRoute allowedRoles={['coordinator']}>
            <PageTransition>
              <Suspense fallback={<ListPageSkeleton />}>
                <MachinesPage />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/operators" element={
          <ProtectedRoute allowedRoles={['coordinator']}>
            <PageTransition>
              <Suspense fallback={<ListPageSkeleton />}>
                <OperatorsPage />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/operators/productivity" element={
          <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
            <PageTransition>
              <Suspense fallback={<KPIPageSkeleton />}>
                <OperatorProductivityPage />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/oee" element={
          <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
            <PageTransition>
              <Suspense fallback={<KPIPageSkeleton />}>
                <OEEDashboard />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/abc" element={
          <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
            <PageTransition>
              <Suspense fallback={<KPIPageSkeleton />}>
                <ABCCostingDashboard />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/tpm" element={
          <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
            <PageTransition>
              <Suspense fallback={<KPIPageSkeleton />}>
                <TPMDashboard />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/ml-predictions" element={
          <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
            <PageTransition>
              <Suspense fallback={<KPIPageSkeleton />}>
                <MLPredictionsDashboard />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/bi" element={
          <ProtectedRoute allowedRoles={['manager', 'coordinator']}>
            <PageTransition>
              <Suspense fallback={<KPIPageSkeleton />}>
                <BIDashboard />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/code-quality" element={
          <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
            <PageTransition>
              <Suspense fallback={<KPIPageSkeleton />}>
                <CodeQualityDashboard />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <PageTransition>
              <Suspense fallback={<DashboardPageSkeleton />}>
                <NotificationsPage />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/shift-handover" element={
          <ProtectedRoute>
            <PageTransition>
              <Suspense fallback={<DashboardPageSkeleton />}>
                <ShiftHandoverPage />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/traceability" element={
          <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
            <PageTransition>
              <Suspense fallback={<ListPageSkeleton />}>
                <TraceabilityPage />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/spc" element={
          <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
            <PageTransition>
              <Suspense fallback={<KPIPageSkeleton />}>
                <SPCDashboard />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/executive" element={
          <ProtectedRoute allowedRoles={['manager', 'coordinator']}>
            <PageTransition>
              <Suspense fallback={<KPIPageSkeleton />}>
                <ExecutiveDashboard />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/energy" element={
          <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
            <PageTransition>
              <Suspense fallback={<KPIPageSkeleton />}>
                <EnergyDashboard />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/gamification" element={
          <ProtectedRoute>
            <PageTransition>
              <Suspense fallback={<KPIPageSkeleton />}>
                <GamificationPage />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/documents" element={
          <ProtectedRoute>
            <PageTransition>
              <Suspense fallback={<ListPageSkeleton />}>
                <DocumentsPage />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['coordinator']}>
            <PageTransition>
              <Suspense fallback={<DashboardPageSkeleton />}>
                <SettingsPage />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/security" element={
          <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
            <PageTransition>
              <Suspense fallback={<DashboardPageSkeleton />}>
                <SecurityDashboard />
              </Suspense>
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/install" element={
          <PageTransition>
            <Suspense fallback={<DashboardPageSkeleton />}>
              <InstallAppPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/kiosk" element={
          <ProtectedRoute>
            <Suspense fallback={<DashboardPageSkeleton />}>
              <KioskPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="*" element={
          <PageTransition>
            <Suspense fallback={<AuthPageSkeleton />}>
              <NotFound />
            </Suspense>
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <NavigationListener />
          <AuthProvider>
            <ReauthProvider>
              <SessionManager>
                <OfflineSyncProvider>
                  <EfficiencyNotificationProvider>
                    <RealtimeNotificationsProvider>
                      <ProductDesignProvider
                        enableOnboarding={true}
                        enableCommandPalette={true}
                        enableKeyboardShortcuts={true}
                        enableToastWithUndo={true}
                      >
                        <AnimatedRoutes />
                        <PushNotificationPrompt delay={15000} />
                        <AnimatedRoutes />
                      </ProductDesignProvider>
                    </RealtimeNotificationsProvider>
                  </EfficiencyNotificationProvider>
                </OfflineSyncProvider>
              </SessionManager>
            </ReauthProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
