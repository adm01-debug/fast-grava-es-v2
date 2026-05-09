import { Suspense, lazy, useMemo, ComponentType, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import { DailySummaryCard } from '@/components/notifications/DailySummaryCard';
import { Badge } from '@/components/ui/badge';
import { FavoritesDropdown, FavoriteButton } from '@/components/navigation/FavoritesManager';
import { ActivityLog, useActivityLog } from '@/components/activity/ActivityLog';
import { OfflineBanner, ConnectionStatus } from '@/components/offline/OfflineMode';
import { GamificationBanner } from '@/components/dashboard/GamificationBanner';
import { useSmartDelayAlerts } from '@/hooks/useSmartDelayAlerts';

import { VoiceButton } from '@/components/voice/VoiceCommands';
import { ActivityFeedWidget } from '@/components/dashboard/ActivityFeedWidget';
import { BufferPromotionStatus } from '@/components/dashboard/BufferPromotionStatus';
import { LiveMachineStatusPanel } from '@/components/dashboard/LiveMachineStatusPanel';
import { AutoShiftSummary } from '@/components/shift/AutoShiftSummary';
import { QuickChat } from '@/components/chat/QuickChat';
import { MaintenanceAlertsWidget } from '@/components/dashboard/MaintenanceAlertsWidget';
import { EnergyWidget } from '@/components/dashboard/EnergyWidget';
import { PredictiveAnalyticsWidget } from '@/components/dashboard/PredictiveAnalyticsWidget';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  FileText
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
  const { stats, machines, isLoading, isOperator } = useOperatorDashboardData();
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

  const renderWidget = (widgetId: string) => {
    const config = WIDGET_COMPONENTS[widgetId];
    if (!config) return null;

    const Component = config.component;
    return (
      <DraggableWidget
        key={widgetId}
        id={widgetId}
        isEditMode={isEditMode}
        onToggleVisibility={() => toggleWidgetVisibility(widgetId)}
      >
        <Suspense fallback={<WidgetSkeleton className={config.skeletonHeight} />}>
          <Component />
        </Suspense>
      </DraggableWidget>
    );
  };

  // Activity log for tracking
  const { entries: activityEntries, addEntry: addActivityEntry } = useActivityLog();
  const navigate = useNavigate();

  // State for active tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <MainLayout>
      {/* Offline Banner */}
      <OfflineBanner />
      
      <div className="h-full flex flex-col py-3 lg:py-4">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 px-1 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full gradient-primary" />
            <h1 className="text-2xl font-display font-bold tracking-tight">
              <span className="gradient-text">{t('dashboard.title')}</span>
            </h1>
            <FavoriteButton path="/" name={t('dashboard.title')} />
            {isOperator && (
              <Badge variant="secondary" className="gap-1 text-xs glass">
                <User className="h-3 w-3" />
                {profile?.full_name || t('operators.title')}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <ConnectionStatus />
            <VoiceButton className="hidden md:flex" />
            <FavoritesDropdown onNavigate={(path) => navigate(path)} />
            <Badge variant="outline" className="hidden md:flex gap-1.5 cursor-pointer hover:bg-primary/8 hover:border-primary/30 transition-all duration-200">
              <Command className="h-3 w-3" />
              <span className="text-xs">⌘K</span>
            </Badge>
            <DashboardEditControls
              isEditMode={isEditMode}
              widgets={filteredWidgetsForControls}
              onToggleEditMode={() => setIsEditMode(!isEditMode)}
              onResetLayout={resetLayout}
              onToggleWidget={toggleWidgetVisibility}
            />
          </div>
        </div>

        <GamificationBanner />

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
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            {!isOperator && (
              <TabsTrigger value="efficiency" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Eficiência</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="timeline" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="machines" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              <Cpu className="h-4 w-4" />
              <span className="hidden sm:inline">Máquinas</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200">
              <Table2 className="h-4 w-4" />
              <span className="hidden sm:inline">Jobs</span>
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
                    <AutoShiftSummary />
                    <ActivityFeedWidget />
                    <DailySummaryCard />
                    <MaintenanceAlertsWidget />
                    <EnergyWidget />
                    <PredictiveAnalyticsWidget />
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

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 mt-4 min-h-0">
            <div className="h-full">
              <QuickChat />
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
