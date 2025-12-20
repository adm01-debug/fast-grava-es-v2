import { Suspense, lazy, useMemo, ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useOperatorDashboardData } from '@/hooks/useOperatorDashboardData';
import { useDashboardLayout, WidgetConfig } from '@/hooks/useDashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DraggableWidget } from '@/components/dashboard/DraggableWidget';
import { DashboardEditControls } from '@/components/dashboard/DashboardEditControls';
import { SortableWidgetSection } from '@/components/dashboard/SortableWidgetSection';
import { DailySummaryCard } from '@/components/notifications/DailySummaryCard';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Printer,
  User
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

// Widget skeleton fallback
function WidgetSkeleton({ className = "h-64" }: { className?: string }) {
  return (
    <Card className="glass-card animate-pulse">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className={className} />
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
  timeline: { component: CompactTimeline, skeletonHeight: 'h-40' },
  jobs: { component: RecentJobsTable, skeletonHeight: 'h-64' },
};

// Widgets that operators should NOT see (coordinator/manager only)
const COORDINATOR_ONLY_WIDGETS = ['sequencing', 'loadbalancing', 'bottleneck', 'conflicts'];

const Index = () => {
  const { t } = useTranslation();
  const { stats, machines, isLoading, isOperator } = useOperatorDashboardData();
  const { profile } = useAuth();
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

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold">
              <span className="gradient-text">{t('dashboard.title')}</span>
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">
                {isOperator 
                  ? `${t('operators.assignedMachines')} (${machines.length})`
                  : t('dashboard.weeklyOverview')
                }
              </p>
              {isOperator && (
                <Badge variant="secondary" className="gap-1">
                  <User className="h-3 w-3" />
                  {profile?.full_name || t('operators.title')}
                </Badge>
              )}
            </div>
          </div>
          <DashboardEditControls
            isEditMode={isEditMode}
            widgets={filteredWidgetsForControls}
            onToggleEditMode={() => setIsEditMode(!isEditMode)}
            onResetLayout={resetLayout}
            onToggleWidget={toggleWidgetVisibility}
          />
        </div>

        {/* Edit Mode Indicator */}
        {isEditMode && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center text-sm text-primary animate-fade-in">
            {t('common.edit')} - {t('kanban.dragHint')}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </>
          ) : (
            <>
              <StatsCard
                title={t('dashboard.jobsQueue')}
                value={stats.todayScheduled.toString()}
                subtitle={`${stats.scheduled} ${t('jobs.statuses.scheduled')}`}
                icon={Calendar}
                variant="blue"
                className="stagger-1"
              />
              <StatsCard
                title={t('dashboard.jobsInProduction')}
                value={stats.inProgress.toString()}
                subtitle={`${machines.length} ${t('machines.title')}`}
                icon={Printer}
                variant="cyan"
                className="stagger-2"
              />
              <StatsCard
                title={t('dashboard.jobsFinished')}
                value={stats.todayCompleted.toString()}
                subtitle={`${stats.completedPieces.toLocaleString('pt-BR')} ${t('jobs.producedQuantity')}`}
                icon={CheckCircle2}
                variant="green"
                className="stagger-3"
              />
              <StatsCard
                title={t('alerts.types.warning')}
                value={stats.delayed.toString()}
                subtitle={stats.delayed > 0 ? t('alerts.types.warning') : t('common.success')}
                icon={AlertTriangle}
                variant="orange"
                className="stagger-4"
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left - Main widgets */}
          <div className="xl:col-span-3">
            <SortableWidgetSection
              widgets={mainWidgets}
              section="main"
              onReorder={reorderWidgets}
              className="space-y-6"
            >
              {mainWidgets.map(widget => renderWidget(widget.id))}
            </SortableWidgetSection>
          </div>

          {/* Right - Sidebar widgets */}
          <div className="xl:col-span-2 space-y-6">
            {/* Daily Summary Card - visible to all */}
            <DailySummaryCard />
            
            <SortableWidgetSection
              widgets={sidebarWidgets}
              section="sidebar"
              onReorder={reorderWidgets}
              className="space-y-6"
            >
              {sidebarWidgets.map(widget => renderWidget(widget.id))}
            </SortableWidgetSection>
          </div>
        </div>

        {/* Operational Efficiency Section - Coordinators and Managers only */}
        {!isOperator && efficiencyWidgets.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-semibold text-foreground">
              {t('dashboard.efficiency')}
            </h2>
            <SortableWidgetSection
              widgets={efficiencyWidgets}
              section="efficiency"
              direction="horizontal"
              onReorder={reorderWidgets}
              className="grid grid-cols-1 xl:grid-cols-3 gap-6"
            >
              {efficiencyWidgets.map(widget => renderWidget(widget.id))}
            </SortableWidgetSection>
          </div>
        )}

        {/* Bottom Section */}
        <SortableWidgetSection
          widgets={bottomWidgets}
          section="bottom"
          onReorder={reorderWidgets}
          className="space-y-6"
        >
          {bottomWidgets.map(widget => renderWidget(widget.id))}
        </SortableWidgetSection>
      </div>
    </MainLayout>
  );
};

export default Index;
