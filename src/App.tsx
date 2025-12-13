import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EfficiencyNotificationProvider } from "@/components/notifications/EfficiencyNotificationProvider";
import Index from "./pages/Index";
import DailyCalendar from "./pages/DailyCalendar";
import WeeklyCalendar from "./pages/WeeklyCalendar";
import PendingQueue from "./pages/PendingQueue";
import AlertsDashboard from "./pages/AlertsDashboard";
import KanbanBoard from "./pages/KanbanBoard";
import KPIDashboard from "./pages/KPIDashboard";
import OperatorView from "./pages/OperatorView";
import EfficiencyDashboard from "./pages/EfficiencyDashboard";
import TechnicalAssistantPage from "./pages/TechnicalAssistantPage";
import QRScannerPage from "./pages/QRScannerPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </EfficiencyNotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
