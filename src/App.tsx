import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EfficiencyNotificationProvider } from "@/components/notifications/EfficiencyNotificationProvider";
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
const AuthPage = lazy(() => import("./pages/AuthPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <EfficiencyNotificationProvider>
            <Routes>
              <Route path="/auth" element={
                <Suspense fallback={<AuthPageSkeleton />}>
                  <AuthPage />
                </Suspense>
              } />
              <Route path="/" element={
                <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
                  <Suspense fallback={<DashboardPageSkeleton />}>
                    <Index />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/calendar/daily" element={
                <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
                  <Suspense fallback={<CalendarPageSkeleton />}>
                    <DailyCalendar />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/calendar/weekly" element={
                <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
                  <Suspense fallback={<CalendarPageSkeleton />}>
                    <WeeklyCalendar />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/pending" element={
                <ProtectedRoute allowedRoles={['coordinator']}>
                  <Suspense fallback={<ListPageSkeleton />}>
                    <PendingQueue />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/alerts" element={
                <ProtectedRoute>
                  <Suspense fallback={<DashboardPageSkeleton />}>
                    <AlertsDashboard />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/kanban" element={
                <ProtectedRoute allowedRoles={['coordinator']}>
                  <Suspense fallback={<KanbanPageSkeleton />}>
                    <KanbanBoard />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/kpis" element={
                <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
                  <Suspense fallback={<KPIPageSkeleton />}>
                    <KPIDashboard />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/operator" element={
                <ProtectedRoute>
                  <Suspense fallback={<ListPageSkeleton />}>
                    <OperatorView />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/efficiency" element={
                <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
                  <Suspense fallback={<EfficiencyPageSkeleton />}>
                    <EfficiencyDashboard />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/assistant" element={
                <ProtectedRoute>
                  <Suspense fallback={<DashboardPageSkeleton />}>
                    <TechnicalAssistantPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/scanner" element={
                <ProtectedRoute>
                  <Suspense fallback={<DashboardPageSkeleton />}>
                    <QRScannerPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/integrations/bitrix24" element={
                <ProtectedRoute allowedRoles={['coordinator']}>
                  <Suspense fallback={<TablePageSkeleton />}>
                    <Bitrix24ConfigPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/knowledge" element={
                <ProtectedRoute>
                  <Suspense fallback={<ListPageSkeleton />}>
                    <TechnicalKnowledgeBase />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/design-system" element={
                <Suspense fallback={<DashboardPageSkeleton />}>
                  <DesignSystemPage />
                </Suspense>
              } />
              <Route path="*" element={
                <Suspense fallback={<AuthPageSkeleton />}>
                  <NotFound />
                </Suspense>
              } />
            </Routes>
          </EfficiencyNotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
