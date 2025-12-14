import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { RecentJobsTable } from '@/components/dashboard/RecentJobsTable';
import { CompactTimeline } from '@/components/dashboard/CompactTimeline';
import { AlertsWidget } from '@/components/dashboard/AlertsWidget';
import { BufferStatusWidget } from '@/components/dashboard/BufferStatusWidget';
import { ConflictAlertsWidget } from '@/components/dashboard/ConflictAlertsWidget';
import { SmartSequencingWidget } from '@/components/dashboard/SmartSequencingWidget';
import { LoadBalancingWidget } from '@/components/dashboard/LoadBalancingWidget';
import { BottleneckWidget } from '@/components/dashboard/BottleneckWidget';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Printer
} from 'lucide-react';

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
            <OccupancyChart />
          </div>

          {/* Right - Buffer + Alerts + Conflicts */}
          <div className="xl:col-span-2 space-y-6">
            <BufferStatusWidget />
            <ConflictAlertsWidget />
            <AlertsWidget />
          </div>
        </div>

        {/* Operational Efficiency Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Eficiência Operacional
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <SmartSequencingWidget />
            <LoadBalancingWidget />
            <BottleneckWidget />
          </div>
        </div>

        {/* Timeline */}
        <CompactTimeline />

        {/* Jobs Table - Full Width */}
        <RecentJobsTable />
      </div>
    </MainLayout>
  );
};

export default Index;