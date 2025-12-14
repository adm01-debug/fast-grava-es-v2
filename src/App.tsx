import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EfficiencyNotificationProvider } from "@/components/notifications/EfficiencyNotificationProvider";
import { Skeleton } from "@/components/ui/skeleton";

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

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <EfficiencyNotificationProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={
                  <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/calendar/daily" element={
                  <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
                    <DailyCalendar />
                  </ProtectedRoute>
                } />
                <Route path="/calendar/weekly" element={
                  <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
                    <WeeklyCalendar />
                  </ProtectedRoute>
                } />
                <Route path="/pending" element={
                  <ProtectedRoute allowedRoles={['coordinator']}>
                    <PendingQueue />
                  </ProtectedRoute>
                } />
                <Route path="/alerts" element={
                  <ProtectedRoute>
                    <AlertsDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/kanban" element={
                  <ProtectedRoute allowedRoles={['coordinator']}>
                    <KanbanBoard />
                  </ProtectedRoute>
                } />
                <Route path="/kpis" element={
                  <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
                    <KPIDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/operator" element={
                  <ProtectedRoute>
                    <OperatorView />
                  </ProtectedRoute>
                } />
                <Route path="/efficiency" element={
                  <ProtectedRoute allowedRoles={['coordinator', 'manager']}>
                    <EfficiencyDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/assistant" element={
                  <ProtectedRoute>
                    <TechnicalAssistantPage />
                  </ProtectedRoute>
                } />
                <Route path="/scanner" element={
                  <ProtectedRoute>
                    <QRScannerPage />
                  </ProtectedRoute>
                } />
                <Route path="/integrations/bitrix24" element={
                  <ProtectedRoute allowedRoles={['coordinator']}>
                    <Bitrix24ConfigPage />
                  </ProtectedRoute>
                } />
                <Route path="/knowledge" element={
                  <ProtectedRoute>
                    <TechnicalKnowledgeBase />
                  </ProtectedRoute>
                } />
                <Route path="/design-system" element={<DesignSystemPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </EfficiencyNotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
