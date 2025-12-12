import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { RecentJobsTable } from '@/components/dashboard/RecentJobsTable';
import { TodayTimeline } from '@/components/dashboard/TodayTimeline';
import { AlertsWidget } from '@/components/dashboard/AlertsWidget';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Printer
} from 'lucide-react';

const Index = () => {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Visão geral do departamento de gravação
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Agendados Hoje"
            value="24"
            subtitle="+3 desde ontem"
            icon={Calendar}
            variant="primary"
            trend={{ value: 14, isPositive: true }}
          />
          <StatsCard
            title="Em Produção"
            value="8"
            subtitle="de 52 máquinas"
            icon={Printer}
            variant="primary"
          />
          <StatsCard
            title="Finalizados Hoje"
            value="16"
            subtitle="2.450 peças"
            icon={CheckCircle2}
            variant="success"
          />
          <StatsCard
            title="Atrasados"
            value="3"
            subtitle="Atenção necessária"
            icon={AlertTriangle}
            variant="warning"
            trend={{ value: 25, isPositive: true }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timeline & Occupancy */}
          <div className="lg:col-span-2 space-y-6">
            <OccupancyChart />
            <RecentJobsTable />
          </div>

          {/* Right Column - Timeline, Alerts & Actions */}
          <div className="space-y-6">
            <TodayTimeline />
            <AlertsWidget />
            <QuickActions />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
