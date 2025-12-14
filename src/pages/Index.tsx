import { Suspense, lazy } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Printer
} from 'lucide-react';

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

const Index = () => {
  const { stats, machines, isLoading } = useSchedulingData();

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-2 animate-fade-in">
          <h1 className="text-3xl font-display font-bold">
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">
            Visão geral do departamento de gravação
          </p>
        </div>

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
                title="Agendados Hoje"
                value={stats.todayScheduled.toString()}
                subtitle={`${stats.scheduled} total agendados`}
                icon={Calendar}
                variant="blue"
                className="stagger-1"
              />
              <StatsCard
                title="Em Produção"
                value={stats.inProgress.toString()}
                subtitle={`de ${machines.length} máquinas`}
                icon={Printer}
                variant="cyan"
                className="stagger-2"
              />
              <StatsCard
                title="Finalizados Hoje"
                value={stats.todayCompleted.toString()}
                subtitle={`${stats.completedPieces.toLocaleString('pt-BR')} peças total`}
                icon={CheckCircle2}
                variant="green"
                className="stagger-3"
              />
              <StatsCard
                title="Atrasados"
                value={stats.delayed.toString()}
                subtitle={stats.delayed > 0 ? "Atenção necessária" : "Tudo em dia"}
                icon={AlertTriangle}
                variant="purple"
                className="stagger-4"
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left - Occupancy Chart */}
          <div className="xl:col-span-3">
            <Suspense fallback={<WidgetSkeleton className="h-[320px]" />}>
              <OccupancyChart />
            </Suspense>
          </div>

          {/* Right - Buffer + Alerts + Conflicts */}
          <div className="xl:col-span-2 space-y-6">
            <Suspense fallback={<WidgetSkeleton className="h-32" />}>
              <BufferStatusWidget />
            </Suspense>
            <Suspense fallback={<WidgetSkeleton className="h-32" />}>
              <ConflictAlertsWidget />
            </Suspense>
            <Suspense fallback={<WidgetSkeleton className="h-48" />}>
              <AlertsWidget />
            </Suspense>
          </div>
        </div>

        {/* Operational Efficiency Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Eficiência Operacional
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Suspense fallback={<WidgetSkeleton className="h-48" />}>
              <SmartSequencingWidget />
            </Suspense>
            <Suspense fallback={<WidgetSkeleton className="h-48" />}>
              <LoadBalancingWidget />
            </Suspense>
            <Suspense fallback={<WidgetSkeleton className="h-48" />}>
              <BottleneckWidget />
            </Suspense>
          </div>
        </div>

        {/* Timeline */}
        <Suspense fallback={<WidgetSkeleton className="h-40" />}>
          <CompactTimeline />
        </Suspense>

        {/* Jobs Table - Full Width */}
        <Suspense fallback={<WidgetSkeleton className="h-64" />}>
          <RecentJobsTable />
        </Suspense>
      </div>
    </MainLayout>
  );
};

export default Index;