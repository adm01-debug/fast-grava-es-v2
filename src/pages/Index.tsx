import { Suspense, lazy, useMemo, ComponentType, useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { startOfDay, endOfDay } from 'date-fns';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useOperatorDashboardData } from '@/hooks/useOperatorDashboardData';
import { useDashboardLayout, WidgetConfig } from '@/hooks/useDashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatsCardSkeleton, ContentTransition } from '@/components/loading';
import { DraggableWidget } from '@/components/dashboard/DraggableWidget';
import { DashboardEditControls } from '@/components/dashboard/DashboardEditControls';
import { SortableWidgetSection } from '@/components/dashboard/SortableWidgetSection';
// ... DailySummaryCard lazy loaded below
import { Badge } from '@/components/ui/badge';
import { FavoritesDropdown, FavoriteButton } from '@/components/navigation/FavoritesManager';
import { ActivityLog, useActivityLog } from '@/components/activity/ActivityLog';
import { OfflineBanner, ConnectionStatus } from '@/components/offline/OfflineMode';
import { GamificationBanner } from '@/components/dashboard/GamificationBanner';
import { useSmartDelayAlerts } from '@/hooks/useSmartDelayAlerts';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';

import { VoiceButton } from '@/components/voice/VoiceCommands';
const ActivityFeedWidget = lazy(() => import('@/components/dashboard/ActivityFeedWidget').then(m => ({ default: m.ActivityFeedWidget })));
const InventoryAlertsWidget = lazy(() => import('@/components/dashboard/InventoryAlertsWidget').then(m => ({ default: m.InventoryAlertsWidget })));
const BufferPromotionStatus = lazy(() => import('@/components/dashboard/BufferPromotionStatus').then(m => ({ default: m.BufferPromotionStatus })));
const LiveMachineStatusPanel = lazy(() => import('@/components/dashboard/LiveMachineStatusPanel').then(m => ({ default: m.LiveMachineStatusPanel })));
const AutoShiftSummary = lazy(() => import('@/components/shift/AutoShiftSummary').then(m => ({ default: m.AutoShiftSummary })));
const QuickChat = lazy(() => import('@/components/chat/QuickChat').then(m => ({ default: m.QuickChat })));
const MaintenanceAlertsWidget = lazy(() => import('@/components/dashboard/MaintenanceAlertsWidget').then(m => ({ default: m.MaintenanceAlertsWidget })));
const EnergyWidget = lazy(() => import('@/components/dashboard/EnergyWidget').then(m => ({ default: m.EnergyWidget })));
const PredictiveAnalyticsWidget = lazy(() => import('@/components/dashboard/PredictiveAnalyticsWidget').then(m => ({ default: m.PredictiveAnalyticsWidget })));
const ShiftHandoverWidget = lazy(() => import('@/components/dashboard/ShiftHandoverWidget').then(m => ({ default: m.ShiftHandoverWidget })));
const LeaderboardWidget = lazy(() => import('@/components/dashboard/LeaderboardWidget').then(m => ({ default: m.LeaderboardWidget })));
const OperatorGoalsWidget = lazy(() => import('@/components/dashboard/OperatorGoalsWidget').then(m => ({ default: m.OperatorGoalsWidget })));
const DailySummaryCard = lazy(() => import('@/components/notifications/DailySummaryCard').then(m => ({ default: m.DailySummaryCard })));
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DashboardExport } from '@/components/dashboard/DashboardExport';

import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Printer,
  User,
  Command,
  LayoutDashboard,
  TrendingUp,
  Table2,
  Clock,
  Cpu,
  MessageCircle,
  FileText,
  Brain,
  Users,
  ShieldCheck
} from 'lucide-react';


// Type definitions for widget components
interface WidgetComponentConfig {
  component: React.LazyExoticComponent<ComponentType<Record<string, never>>>;
  skeletonHeight: string;
}

// Lazy load heavy dashboard widgets
const OccupancyChart = lazy(() => import('@/components/dashboard/OccupancyChart').then(m => ({ default: m.OccupancyChart })));
const RecentJobsTable = lazy(() => import('@/components/dashboard/RecentJobsTable').then(m => ({ default: m.RecentJobsTable })));
const CompactTimeline = lazy(() => import('@/components/dashboard/CompactTimeline').then(m => ({ default: m.CompactTimeline })));
const AlertsWidget = lazy(() => import('@/components/dashboard/AlertsWidget').then(m => ({ default: m.AlertsWidget })));
const BufferStatusWidget = lazy(() => import('@/components/dashboard/BufferStatusWidget').then(m => ({ default: m.BufferStatusWidget })));
const ConflictAlertsWidget = lazy(() => import('@/components/dashboard/ConflictAlertsWidget').then(m => ({ default: m.ConflictAlertsWidget })));
const SmartSequencingWidget = lazy(() => import('@/components/dashboard/SmartSequencingWidget').then(m => ({ default: m.SmartSequencingWidget })));
const LoadBalancingWidget = lazy(() => import('@/components/dashboard/LoadBalancingWidget').then(m => ({ default: m.LoadBalancingWidget })));
const BottleneckWidget = lazy(() => import('@/components/dashboard/BottleneckWidget').then(m => ({ default: m.BottleneckWidget })));
const OEELoadTrendWidget = lazy(() => import('@/components/dashboard/OEELoadTrendWidget').then(m => ({ default: m.OEELoadTrendWidget })));

// Widget skeleton fallback with shimmer
function WidgetSkeleton({ className = "h-64" }: { className?: string }) {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-2">
        <div className="h-6 w-40 rounded bg-muted animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className={`${className} rounded bg-muted relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/30 to-transparent animate-shimmer" />
        </div>
      </CardContent>
    </Card>
  );
}

// Widget component mapping with strict typing
const WIDGET_COMPONENTS: Record<string, WidgetComponentConfig> = {
  occupancy: { component: OccupancyChart, skeletonHeight: 'h-[320px]' },
  buffer: { component: BufferStatusWidget, skeletonHeight: 'h-32' },
  conflicts: { component: ConflictAlertsWidget, skeletonHeight: 'h-32' },
  alerts: { component: AlertsWidget, skeletonHeight: 'h-48' },
  sequencing: { component: SmartSequencingWidget, skeletonHeight: 'h-48' },
  loadbalancing: { component: LoadBalancingWidget, skeletonHeight: 'h-48' },
  bottleneck: { component: BottleneckWidget, skeletonHeight: 'h-48' },
  trends: { component: OEELoadTrendWidget, skeletonHeight: 'h-64' },
  timeline: { component: CompactTimeline, skeletonHeight: 'h-40' },
  jobs: { component: RecentJobsTable, skeletonHeight: 'h-64' },
};

// Widgets that operators should NOT see (coordinator/manager only)
const COORDINATOR_ONLY_WIDGETS = ['sequencing', 'loadbalancing', 'bottleneck', 'conflicts'];

const Index = () => {
  const { t } = useTranslation();
  const { metrics } = usePerformanceMetrics('Dashboard');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const { stats, machines, isLoading, isOperator } = useOperatorDashboardData(dateRange);
  const { profile } = useAuth();
  useSmartDelayAlerts(); // Run background delay monitoring
  const {
    widgets,
    isEditMode,
    setIsEditMode,
    reorderWidgets,
    toggleWidgetVisibility,
    resetLayout,
    getWidgetsBySection,
  } = useDashboardLayout();

  const handleToggleWidgetVisibility = useCallback((id: string) => {
    toggleWidgetVisibility(id);
  }, [toggleWidgetVisibility]);

  const handleResetLayout = useCallback(() => {
    resetLayout();
  }, [resetLayout]);

  const handleToggleEditMode = useCallback(() => {
    setIsEditMode((prev: boolean) => !prev);
  }, [setIsEditMode]);

  // Centralized filter for role-based widget visibility
  const filterWidgetsForRole = useMemo(() => {
    return (widgetsList: WidgetConfig[]) => {
      if (!isOperator) return widgetsList;
      return widgetsList.filter(w => !COORDINATOR_ONLY_WIDGETS.includes(w.id));
    };
  }, [isOperator]);

  // Filtered widgets for DashboardEditControls (centralized, avoiding repetition)
  const filteredWidgetsForControls = useMemo(() => {
    return filterWidgetsForRole(widgets);
  }, [widgets, filterWidgetsForRole]);

  const mainWidgets = useMemo(() => filterWidgetsForRole(getWidgetsBySection('main')), [getWidgetsBySection, filterWidgetsForRole]);
  const sidebarWidgets = useMemo(() => filterWidgetsForRole(getWidgetsBySection('sidebar')), [getWidgetsBySection, filterWidgetsForRole]);
  const efficiencyWidgets = useMemo(() => filterWidgetsForRole(getWidgetsBySection('efficiency')), [getWidgetsBySection, filterWidgetsForRole]);
  const bottomWidgets = useMemo(() => filterWidgetsForRole(getWidgetsBySection('bottom')), [getWidgetsBySection, filterWidgetsForRole]);

  const renderWidget = useCallback((widgetId: string) => {
    const config = WIDGET_COMPONENTS[widgetId];
    if (!config) return null;

    const Component = config.component;
    return (
      <DraggableWidget
        key={widgetId}
        id={widgetId}
        isEditMode={isEditMode}
        onToggleVisibility={() => handleToggleWidgetVisibility(widgetId)}
      >
        <Suspense fallback={<WidgetSkeleton className={config.skeletonHeight} />}>
          <Component />
        </Suspense>
      </DraggableWidget>
    );
  }, [isEditMode, handleToggleWidgetVisibility]);

  // Activity log for tracking
  const { entries: activityEntries, addEntry: addActivityEntry } = useActivityLog();
  const navigate = useNavigate();

  // State for active tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <MainLayout>
      <Helmet>
        <title>Dashboard | FAST GRAVAÇÕES</title>
        <meta name="description" content="Painel de controle principal do sistema FAST GRAVAÇÕES - Gestão de produção e agendamento." />
        <meta property="og:title" content="FAST GRAVAÇÕES - Dashboard" />
        <meta property="og:description" content="Sistema Inteligente de Gestão Industrial" />
        <meta property="og:type" content="website" />
      </Helmet>
      {/* Offline Banner */}
      <OfflineBanner />

      <div className="h-full flex flex-col py-3 lg:py-4">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 px-1 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 rounded-full gradient-primary animate-pulse-glow" />
            <h1 className="text-3xl font-display font-black tracking-tighter">
              <span className="gradient-text">{t('dashboard.title')}</span>
            </h1>
            <Badge variant="outline" className="hidden sm:flex gap-1.5 px-2.5 border-primary/30 bg-primary/5 text-primary text-[10px] font-black uppercase shadow-[0_0_15px_rgba(255,90,31,0.1)]">
               <ShieldCheck className="h-3 w-3" /> Orquestrado 10/10 (Elite)
            </Badge>
            <FavoriteButton path="/" name={t('dashboard.title')} />
            {isOperator && (
              <Badge variant="secondary" className="gap-1 text-xs glass">
                <User className="h-3 w-3" />
                {profile?.full_name || t('operators.title')}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DateRangePicker date={dateRange} setDate={setDateRange} className="mr-1" />
            <DashboardExport />
            <ConnectionStatus />
            <VoiceButton className="no-export" />
            <FavoritesDropdown onNavigate={(path) => navigate(path)} className="no-export" />
            <Badge
              variant="outline"
              className="hidden md:flex gap-1.5 cursor-pointer hover:bg-primary/8 hover:border-primary/30 transition-all duration-200 no-export"
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}
            >
              <Command className="h-3 w-3" />
              <span className="text-xs">⌘K</span>
            </Badge>
            <DashboardEditControls
              isEditMode={isEditMode}
              widgets={filteredWidgetsForControls}
              onToggleEditMode={handleToggleEditMode}
              onResetLayout={handleResetLayout}
              onToggleWidget={handleToggleWidgetVisibility}
              className="no-export"
            />
          </div>
        </div>

        <GamificationBanner />
        <Suspense fallback={<div className="h-10 bg-muted animate-pulse rounded-lg mb-4" />}>
          <BufferPromotionStatus />
        </Suspense>

        {/* Edit Mode Indicator */}
        {isEditMode && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-center text-sm text-primary mb-3 shrink-0">
            {t('common.edit')} - {t('kanban.dragHint')}
          </div>
        )}

        {/* Compact Stats Row */}
        <ContentTransition
          isLoading={isLoading}
          skeleton={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 shrink-0">
              {[1, 2, 3, 4].map(i => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 shrink-0 stagger-children">
            <StatsCard
              title={t('dashboard.jobsQueue')}
              value={stats.todayScheduled.toString()}
              subtitle={`${stats.scheduled} ${t('jobs.statuses.scheduled')}`}
              icon={Calendar}
              variant="primary"
              compact
            />
            <StatsCard
              title={t('dashboard.jobsInProduction')}
              value={stats.inProgress.toString()}
              subtitle={`${machines.length} ${t('machines.title')}`}
              icon={Printer}
              variant="info"
              compact
            />
            <StatsCard
              title={t('dashboard.jobsFinished')}
              value={stats.todayCompleted.toString()}
              subtitle={`${stats.completedPieces.toLocaleString('pt-BR')} pçs`}
              icon={CheckCircle2}
              variant="success"
              compact
            />
            <StatsCard
              title={t('alerts.types.warning')}
              value={stats.delayed.toString()}
              subtitle={stats.delayed > 0 ? t('alerts.types.warning') : t('common.success')}
              icon={AlertTriangle}
              variant="warning"
              compact
            />
          </div>
        </ContentTransition>

        {/* Tabbed Dashboard Content - Takes remaining space */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start glass p-1 h-auto shrink-0 rounded-xl gap-1">
            <TabsTrigger value="overview" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.overview', 'Visão Geral')}</span>
            </TabsTrigger>
            {!isOperator && (
              <TabsTrigger value="efficiency" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">{t('dashboard.efficiency', 'Eficiência')}</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="timeline" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.timeline', 'Timeline')}</span>
            </TabsTrigger>
            <TabsTrigger value="machines" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              <Cpu className="h-4 w-4" />
              <span className="hidden sm:inline">{t('machines.title', 'Máquinas')}</span>
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">{t('intelligence.title', 'Inteligência')}</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t('team.title', 'Equipe')}</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{t('common.chat', 'Chat')}</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              <Table2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('jobs.title', 'Jobs')}</span>
            </TabsTrigger>
          </TabsList>


          {/* Overview Tab - Main Dashboard */}
          <TabsContent value="overview" className="flex-1 mt-4 min-h-0">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 h-full">
              {/* Left Panel - Main Chart */}
              <div className="xl:col-span-3 flex flex-col min-h-0">
                <ScrollArea className="flex-1">
                  <div className="space-y-4 pr-2">
                    <SortableWidgetSection
                      widgets={mainWidgets}
                      section="main"
                      onReorder={reorderWidgets}
                      className="space-y-4"
                    >
                      {mainWidgets.map(widget => renderWidget(widget.id))}
                    </SortableWidgetSection>
                  </div>
                </ScrollArea>
              </div>

              {/* Right Panel - Sidebar Widgets */}
              <div className="xl:col-span-2 flex flex-col min-h-0">
                <ScrollArea className="flex-1">
                  <div className="space-y-4 pr-2">
                    <Suspense fallback={<WidgetSkeleton className="h-40" />}>
                      <AutoShiftSummary />
                      <InventoryAlertsWidget />
                      <OperatorGoalsWidget />
                      <ShiftHandoverWidget />
                      <LeaderboardWidget />
                      <ActivityFeedWidget />
                      <DailySummaryCard />
                      <MaintenanceAlertsWidget />
                      <EnergyWidget />
                      <PredictiveAnalyticsWidget />
                    </Suspense>

                    <SortableWidgetSection
                      widgets={sidebarWidgets}
                      section="sidebar"
                      onReorder={reorderWidgets}
                      className="space-y-4"
                    >
                      {sidebarWidgets.map(widget => renderWidget(widget.id))}
                    </SortableWidgetSection>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          {/* Efficiency Tab - For Coordinators/Managers */}
          {!isOperator && (
            <TabsContent value="efficiency" className="flex-1 mt-4 min-h-0">
              <ScrollArea className="h-full">
                <div className="pr-2">
                  <SortableWidgetSection
                    widgets={efficiencyWidgets}
                    section="efficiency"
                    direction="horizontal"
                    onReorder={reorderWidgets}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-4"
                  >
                    {efficiencyWidgets.map(widget => renderWidget(widget.id))}
                  </SortableWidgetSection>

                  {/* Activity Log */}
                  {activityEntries.length > 0 && (
                    <div className="mt-6">
                      <ActivityLog
                        entries={activityEntries}
                        title="Atividade Recente"
                        maxHeight="300px"
                      />
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          )}

          {/* Machines Tab - Live Status */}
          <TabsContent value="machines" className="flex-1 mt-4 min-h-0">
            <ScrollArea className="h-full">
              <div className="pr-2">
                <LiveMachineStatusPanel />
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Intelligence & Insights Tab */}
          <TabsContent value="intelligence" className="flex-1 mt-4 min-h-0">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pr-2">
                <PredictiveAnalyticsWidget />
                <OEELoadTrendWidget />
                <AlertsWidget />
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="flex-1 mt-4 min-h-0">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pr-2">
                <LeaderboardWidget />
                <ShiftHandoverWidget />
                <ActivityFeedWidget />
                <DailySummaryCard />
              </div>
            </ScrollArea>
          </TabsContent>


          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 mt-4 min-h-0">
            <div className="h-full">
              <Suspense fallback={<div className="h-full bg-muted animate-pulse rounded-lg" />}>
                <QuickChat />
              </Suspense>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="flex-1 mt-4 min-h-0">
            <ScrollArea className="h-full">
              <div className="pr-2">
                {bottomWidgets.filter(w => w.id === 'timeline').map(widget => renderWidget(widget.id))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="flex-1 mt-4 min-h-0">
            <ScrollArea className="h-full">
              <div className="pr-2">
                {bottomWidgets.filter(w => w.id === 'jobs').map(widget => renderWidget(widget.id))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

    </MainLayout>
  );
};

export default Index;
