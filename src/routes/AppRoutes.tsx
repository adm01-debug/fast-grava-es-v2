import React, { Suspense, lazy, useState, useEffect } from "react";
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
} from "@/components/loading";

// Lazy load all pages
const Index = lazy(() => import("@/pages/Index"));
const DailyCalendar = lazy(() => import("@/pages/DailyCalendar"));
const WeeklyCalendar = lazy(() => import("@/pages/WeeklyCalendar"));
const MonthlyCalendar = lazy(() => import("@/pages/MonthlyCalendar"));
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
const InventoryPage = lazy(() => import("@/pages/InventoryPage"));
const ReportBuilderPage = lazy(() => import("@/pages/ReportBuilderPage"));
const MasterAPIPage = lazy(() => import("@/pages/MasterAPIPage"));
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
const MachineComparisonPage = lazy(() => import("@/pages/MachineComparisonPage"));
const OperatorHistoryPage = lazy(() => import("@/pages/OperatorHistoryPage"));
const AdminTelemetriaPage = lazy(() => import("@/pages/AdminTelemetriaPage"));
const AuditTrailPage = lazy(() => import("@/pages/AuditTrailPage"));
const DigitalTwin = lazy(() => import("@/pages/DigitalTwin"));
const LogisticsPage = lazy(() => import("@/pages/LogisticsPage"));
const PublicTrackingPage = lazy(() => import("@/pages/PublicTrackingPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Helper to determine transition direction based on path depth
function getNavigationDirection(prevPath: string, currentPath: string): 'forward' | 'backward' {
  if (!prevPath) return 'forward';
  
  const prevSegments = prevPath.split('/').filter(Boolean).length;
  const currentSegments = currentPath.split('/').filter(Boolean).length;
  
  if (currentSegments > prevSegments) return 'forward';
  if (currentSegments < prevSegments) return 'backward';
  
  // If segments are same, check if it's a sibling or same level
  return currentPath.length >= prevPath.length ? 'forward' : 'backward';
}

// Helper para rotas protegidas com Suspense
function ProtectedPage({
  children,
  fallback,
  allowedRoles,
  direction = 'forward',
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  allowedRoles?: AppRole[];
  direction?: 'forward' | 'backward';
}) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <PageTransition direction={direction}>
        <Suspense fallback={fallback}>{children}</Suspense>
      </PageTransition>
    </ProtectedRoute>
  );
}

function PublicPage({ 
  children, 
  fallback, 
  direction = 'forward' 
}: { 
  children: React.ReactNode; 
  fallback: React.ReactNode;
  direction?: 'forward' | 'backward';
}) {
  return (
    <PageTransition direction={direction}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </PageTransition>
  );
}

export function AnimatedRoutes() {
  const location = useLocation();
  const [prevPath, setPrevPath] = React.useState(location.pathname);
  const [direction, setDirection] = React.useState<'forward' | 'backward'>('forward');
  
  useRoutePrefetch();

  React.useEffect(() => {
    if (location.pathname !== prevPath) {
      const newDirection = getNavigationDirection(prevPath, location.pathname);
      setDirection(newDirection);
      setPrevPath(location.pathname);
    }
  }, [location.pathname, prevPath]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/auth" element={<PublicPage fallback={<AuthPageSkeleton />}><AuthPage /></PublicPage>} />
        <Route path="/reset-password" element={<PublicPage fallback={<AuthPageSkeleton />}><ResetPasswordPage /></PublicPage>} />
        <Route path="/design-system" element={<PublicPage fallback={<DashboardPageSkeleton />}><DesignSystemPage /></PublicPage>} />
        <Route path="/install" element={<PublicPage fallback={<DashboardPageSkeleton />}><InstallAppPage /></PublicPage>} />
        <Route path="/track" element={<PublicPage fallback={<DashboardPageSkeleton />}><PublicTrackingPage /></PublicPage>} />

        {/* Dashboard - Accessible by all roles, but useOperatorDashboardData filters content */}
        <Route path="/" element={<ProtectedPage fallback={<DashboardPageSkeleton />}><Index /></ProtectedPage>} />

        {/* Calendar */}
        <Route path="/calendar/daily" element={<ProtectedPage fallback={<CalendarPageSkeleton />} allowedRoles={['coordinator', 'manager']}><DailyCalendar /></ProtectedPage>} />
        <Route path="/calendar/weekly" element={<ProtectedPage fallback={<CalendarPageSkeleton />} allowedRoles={['coordinator', 'manager']}><WeeklyCalendar /></ProtectedPage>} />
        <Route path="/calendar/monthly" element={<ProtectedPage fallback={<CalendarPageSkeleton />} allowedRoles={['coordinator', 'manager']}><MonthlyCalendar /></ProtectedPage>} />

        {/* Operations */}
        <Route path="/pending" element={<ProtectedPage fallback={<ListPageSkeleton />} allowedRoles={['coordinator']}><PendingQueue /></ProtectedPage>} />
        <Route path="/alerts" element={<ProtectedPage fallback={<DashboardPageSkeleton />}><AlertsDashboard /></ProtectedPage>} />
        <Route path="/kanban" element={<ProtectedPage fallback={<KanbanPageSkeleton />} allowedRoles={['coordinator', 'manager', 'operator']}><KanbanBoard /></ProtectedPage>} />
        <Route path="/new-job" element={<ProtectedPage fallback={<DashboardPageSkeleton />} allowedRoles={['coordinator', 'manager']}><NewJobPage /></ProtectedPage>} />

        {/* KPIs & Analytics */}
        <Route path="/kpis" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><KPIDashboard /></ProtectedPage>} />
        <Route path="/efficiency" element={<ProtectedPage fallback={<EfficiencyPageSkeleton />} allowedRoles={['coordinator', 'manager']}><EfficiencyDashboard /></ProtectedPage>} />
        <Route path="/oee" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><OEEDashboard /></ProtectedPage>} />
        <Route path="/spc" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><SPCDashboard /></ProtectedPage>} />
        <Route path="/executive" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['manager', 'coordinator']}><ExecutiveDashboard /></ProtectedPage>} />
        <Route path="/bi" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['manager', 'coordinator']}><BIDashboard /></ProtectedPage>} />
        <Route path="/report-builder" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['manager', 'coordinator']}><ReportBuilderPage /></ProtectedPage>} />

        {/* ABC Costing — canonical + alias */}
        <Route path="/abc-costing" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><ABCCostingDashboard /></ProtectedPage>} />
        <Route path="/abc" element={<Navigate to="/abc-costing" replace />} />

        {/* TPM & ML */}
        <Route path="/tpm" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><TPMDashboard /></ProtectedPage>} />
        <Route path="/ml-predictions" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><MLPredictionsDashboard /></ProtectedPage>} />
        <Route path="/digital-twin" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><DigitalTwin /></ProtectedPage>} />

        {/* Operators */}
        <Route path="/operator" element={<ProtectedPage fallback={<ListPageSkeleton />}><OperatorView /></ProtectedPage>} />
        <Route path="/operators" element={<ProtectedPage fallback={<ListPageSkeleton />} allowedRoles={['coordinator', 'manager']}><OperatorsPage /></ProtectedPage>} />
        <Route path="/operator-productivity" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><OperatorProductivityPage /></ProtectedPage>} />
        <Route path="/operator-history" element={<ProtectedPage fallback={<ListPageSkeleton />} allowedRoles={['coordinator', 'manager']}><OperatorHistoryPage /></ProtectedPage>} />
        <Route path="/operators/productivity" element={<Navigate to="/operator-productivity" replace />} />

        {/* Resources */}
        <Route path="/machines" element={<ProtectedPage fallback={<ListPageSkeleton />} allowedRoles={['coordinator', 'manager']}><MachinesPage /></ProtectedPage>} />
        <Route path="/machines/compare" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><MachineComparisonPage /></ProtectedPage>} />
        <Route path="/energy" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><EnergyDashboard /></ProtectedPage>} />
        <Route path="/inventory" element={<ProtectedPage fallback={<ListPageSkeleton />} allowedRoles={['coordinator', 'manager']}><InventoryPage /></ProtectedPage>} />

        {/* Quality & Traceability */}
        <Route path="/traceability" element={<ProtectedPage fallback={<ListPageSkeleton />} allowedRoles={['coordinator', 'manager']}><TraceabilityPage /></ProtectedPage>} />
        <Route path="/logistics" element={<ProtectedPage fallback={<ListPageSkeleton />} allowedRoles={['coordinator', 'manager']}><LogisticsPage /></ProtectedPage>} />

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
        <Route path="/audit" element={<ProtectedPage fallback={<ListPageSkeleton />} allowedRoles={['coordinator', 'manager']}><AuditTrailPage /></ProtectedPage>} />
        <Route path="/master-api" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><MasterAPIPage /></ProtectedPage>} />
        <Route path="/code-quality" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><CodeQualityDashboard /></ProtectedPage>} />
        <Route path="/admin/telemetria" element={<ProtectedPage fallback={<KPIPageSkeleton />} allowedRoles={['coordinator', 'manager']}><AdminTelemetriaPage /></ProtectedPage>} />

        {/* Kiosk */}
        <Route path="/kiosk" element={<ProtectedPage fallback={<DashboardPageSkeleton />}><KioskPage /></ProtectedPage>} />

        {/* 404 */}
        <Route path="*" element={<PublicPage fallback={<AuthPageSkeleton />}><NotFound /></PublicPage>} />
      </Routes>
    </AnimatePresence>
  );
}
