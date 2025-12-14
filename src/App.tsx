import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EfficiencyNotificationProvider } from "@/components/notifications/EfficiencyNotificationProvider";
import { PageTransition } from "@/components/layout/PageTransition";
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
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

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
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['coordinator']}>
            <PageTransition>
              <Suspense fallback={<DashboardPageSkeleton />}>
                <SettingsPage />
              </Suspense>
            </PageTransition>
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
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <EfficiencyNotificationProvider>
            <AnimatedRoutes />
          </EfficiencyNotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
