import { Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { type AppRole } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/layout/PageTransition";
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

// Lazy load all pages
const Index = lazy(() => import("@/pages/Index"));
const DailyCalendar = lazy(() => import("@/pages/DailyCalendar"));
const WeeklyCalendar = lazy(() => import("@/pages/WeeklyCalendar"));
const PendingQueue = lazy(() => import("@/pages/PendingQueue"));
const AlertsDashboard = lazy(() => import("@/pages/AlertsDashboard"));
const KanbanBoard = lazy(() => import("@/pages/KanbanBoard"));
const KPIDashboard = lazy(() => import("@/pages/KPIDashboard"));
const OperatorView = lazy(() => import("@/pages/OperatorView"));
const EfficiencyDashboard = lazy(() => import("@/pages/EfficiencyDashboard"));
const TechnicalAssistantPage = lazy(() => import("@/pages/TechnicalAssistantPage"));
const QRScannerPage = lazy(() => import("@/pages/QRScannerPage"));
const Bitrix24ConfigPage = lazy(() => import("@/pages/Bitrix24ConfigPage"));
const TechnicalKnowledgeBase = lazy(() => import("@/pages/TechnicalKnowledgeBase"));
const DesignSystemPage = lazy(() => import("@/pages/DesignSystemPage"));
const NewJobPage = lazy(() => import("@/pages/NewJobPage"));
const MachinesPage = lazy(() => import("@/pages/MachinesPage"));
const OperatorsPage = lazy(() => import("@/pages/OperatorsPage"));
const OperatorProductivityPage = lazy(() => import("@/pages/OperatorProductivityPage"));
const OEEDashboard = lazy(() => import("@/pages/OEEDashboard"));
const ABCCostingDashboard = lazy(() => import("@/pages/ABCCostingDashboard"));
const TPMDashboard = lazy(() => import("@/pages/TPMDashboard"));
const MLPredictionsDashboard = lazy(() => import("@/pages/MLPredictionsDashboard"));
const BIDashboard = lazy(() => import("@/pages/BIDashboard"));
const CodeQualityDashboard = lazy(() => import("@/pages/CodeQualityDashboard"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const TraceabilityPage = lazy(() => import("@/pages/TraceabilityPage"));
const SPCDashboard = lazy(() => import("@/pages/SPCDashboard"));
const ShiftHandoverPage = lazy(() => import("@/pages/ShiftHandoverPage"));
const ExecutiveDashboard = lazy(() => import("@/pages/ExecutiveDashboard"));
const GamificationPage = lazy(() => import("@/pages/GamificationPage"));
const EnergyDashboard = lazy(() => import("@/pages/EnergyDashboard"));
const DocumentsPage = lazy(() => import("@/pages/DocumentsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const SecurityDashboard = lazy(() => import("@/pages/SecurityDashboard"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const InstallAppPage = lazy(() => import("@/pages/InstallAppPage"));
const KioskPage = lazy(() => import("@/pages/KioskPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Helper para rotas protegidas com Suspense
function ProtectedPage({
  children,
  fallback,
  allowedRoles,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  allowedRoles?: string[];
}) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <PageTransition>
        <Suspense fallback={fallback}>{children}</Suspense>
      </PageTransition>
    </ProtectedRoute>
  );
}

function PublicPage({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  return (
    <PageTransition>
      <Suspense fallback={fallback}>{children}</Suspense>
    </PageTransition>
  );
}

export function AnimatedRoutes() {
  const location = useLocation();
  useRoutePrefetch();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/auth" element={<PublicPage fallback={<AuthPageSkeleton />}><AuthPage /></PublicPage>} />
        <Route path="/reset-password" element={<PublicPage fallback={<AuthPageSkeleton />}><ResetPasswordPage /></PublicPage>} />
        <Route path="/design-system" element={<PublicPage fallback={<DashboardPageSkeleton />}><DesignSystemPage /></PublicPage>} />
        <Route path="/install" element={<PublicPage fallback={<DashboardPageSkeleton />}><InstallAppPage /></PublicPage>} />

        {/* Dashboard */}
        <Route path="/" element={<ProtectedPage fallback={<DashboardPageSkeleton />} allowedRoles={['coordinator', 'manager']}><Index /></ProtectedPage>} />

        {/* Calendar */}
        <Route path="/calendar/daily" element={<ProtectedPage fallback={<CalendarPageSkeleton />} allowedRoles={['coordinator', 'manager']}><DailyCalendar /></ProtectedPage>} />
        <Route path="/calendar/weekly" element={<ProtectedPage fallback={<CalendarPageSkeleton />} allowedRoles={['coordinator', 'manager']}><WeeklyCalendar /></ProtectedPage>} />

        {/* Operations */}
        <Route path="/pending" element={<ProtectedPage fallback={<ListPageSkeleton />} allowedRoles={['coordinator']}><PendingQueue /></ProtectedPage>} />
        <Route path="/alerts" element={<ProtectedPage fallback={<DashboardPageSkeleton />}><AlertsDashboard /></ProtectedPage>} />
        <Route path="/kanban" element={<ProtectedPage fallback={<KanbanPageSkeleton />} allowedRoles={['coordinator', 'manager']}><KanbanBoard /></ProtectedPage>} />
        <Route path="/new-job" element={<ProtectedPage fallback={<DashboardPageSkeleton />} allowedRoles={['coordinator', 'manager']}><NewJobPage /></ProtectedPage>} />

        {/* KPIs & Analytics */}
        <Route path="/kpis" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><KPIDashboard /></ProtectedPage>} />
        <Route path="/efficiency" element={<ProtectedPage fallback={<EfficiencyPageSkeleton />} allowedRoles={['coordinator', 'manager']}><EfficiencyDashboard /></ProtectedPage>} />
        <Route path="/oee" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><OEEDashboard /></ProtectedPage>} />
        <Route path="/spc" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><SPCDashboard /></ProtectedPage>} />
        <Route path="/executive" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['manager', 'coordinator']}><ExecutiveDashboard /></ProtectedPage>} />
        <Route path="/bi" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['manager', 'coordinator']}><BIDashboard /></ProtectedPage>} />

        {/* ABC Costing — canonical + alias */}
        <Route path="/abc-costing" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><ABCCostingDashboard /></ProtectedPage>} />
        <Route path="/abc" element={<Navigate to="/abc-costing" replace />} />

        {/* TPM & ML */}
        <Route path="/tpm" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><TPMDashboard /></ProtectedPage>} />
        <Route path="/ml-predictions" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><MLPredictionsDashboard /></ProtectedPage>} />

        {/* Operators */}
        <Route path="/operator" element={<ProtectedPage fallback={<ListPageSkeleton />}><OperatorView /></ProtectedPage>} />
        <Route path="/operators" element={<ProtectedPage fallback={<ListPageSkeleton />} allowedRoles={['coordinator', 'manager']}><OperatorsPage /></ProtectedPage>} />
        <Route path="/operator-productivity" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><OperatorProductivityPage /></ProtectedPage>} />
        <Route path="/operators/productivity" element={<Navigate to="/operator-productivity" replace />} />

        {/* Resources */}
        <Route path="/machines" element={<ProtectedPage fallback={<ListPageSkeleton />} allowedRoles={['coordinator', 'manager']}><MachinesPage /></ProtectedPage>} />
        <Route path="/energy" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><EnergyDashboard /></ProtectedPage>} />

        {/* Quality & Traceability */}
        <Route path="/traceability" element={<ProtectedPage fallback={<ListPageSkeleton />} allowedRoles={['coordinator', 'manager']}><TraceabilityPage /></ProtectedPage>} />

        {/* Knowledge & Documents */}
        <Route path="/assistant" element={<ProtectedPage fallback={<DashboardPageSkeleton />}><TechnicalAssistantPage /></ProtectedPage>} />
        <Route path="/knowledge" element={<ProtectedPage fallback={<ListPageSkeleton />}><TechnicalKnowledgeBase /></ProtectedPage>} />
        <Route path="/documents" element={<ProtectedPage fallback={<ListPageSkeleton />}><DocumentsPage /></ProtectedPage>} />

        {/* Tools */}
        <Route path="/scanner" element={<ProtectedPage fallback={<DashboardPageSkeleton />}><QRScannerPage /></ProtectedPage>} />
        <Route path="/shift-handover" element={<ProtectedPage fallback={<DashboardPageSkeleton />}><ShiftHandoverPage /></ProtectedPage>} />
        <Route path="/gamification" element={<ProtectedPage fallback={<KPIPageSkeleton />}><GamificationPage /></ProtectedPage>} />
        <Route path="/notifications" element={<ProtectedPage fallback={<DashboardPageSkeleton />}><NotificationsPage /></ProtectedPage>} />

        {/* Admin */}
        <Route path="/integrations/bitrix24" element={<ProtectedPage fallback={<TablePageSkeleton />} allowedRoles={['coordinator']}><Bitrix24ConfigPage /></ProtectedPage>} />
        <Route path="/settings" element={<ProtectedPage fallback={<DashboardPageSkeleton />} allowedRoles={['coordinator', 'manager']}><SettingsPage /></ProtectedPage>} />
        <Route path="/security" element={<ProtectedPage fallback={<DashboardPageSkeleton />} allowedRoles={['coordinator', 'manager']}><SecurityDashboard /></ProtectedPage>} />
        <Route path="/code-quality" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><CodeQualityDashboard /></ProtectedPage>} />

        {/* Kiosk */}
        <Route path="/kiosk" element={<ProtectedPage fallback={<DashboardPageSkeleton />}><KioskPage /></ProtectedPage>} />

        {/* 404 */}
        <Route path="*" element={<PublicPage fallback={<AuthPageSkeleton />}><NotFound /></PublicPage>} />
      </Routes>
    </AnimatePresence>
  );
}
