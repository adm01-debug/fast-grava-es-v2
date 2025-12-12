import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { RecentJobsTable } from '@/components/dashboard/RecentJobsTable';
import { CompactTimeline } from '@/components/dashboard/CompactTimeline';
import { AlertsWidget } from '@/components/dashboard/AlertsWidget';
import { 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Printer
} from 'lucide-react';

const Index = () => {
  return (
    <MainLayout>
      <div className="p-8 space-y-8">
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
          <StatsCard
            title="Agendados Hoje"
            value="24"
            subtitle="+3 desde ontem"
            icon={Calendar}
            variant="primary"
            trend={{ value: 14, isPositive: true }}
            className="stagger-1"
          />
          <StatsCard
            title="Em Produção"
            value="8"
            subtitle="de 52 máquinas"
            icon={Printer}
            variant="secondary"
            className="stagger-2"
          />
          <StatsCard
            title="Finalizados Hoje"
            value="16"
            subtitle="2.450 peças"
            icon={CheckCircle2}
            variant="success"
            className="stagger-3"
          />
          <StatsCard
            title="Atrasados"
            value="3"
            subtitle="Atenção necessária"
            icon={AlertTriangle}
            variant="warning"
            trend={{ value: 25, isPositive: true }}
            className="stagger-4"
          />
        </div>

        {/* Main Content Grid - Ocupação + Timeline lado a lado */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left - Occupancy Chart */}
          <div className="xl:col-span-3">
            <OccupancyChart />
          </div>

          {/* Right - Timeline + Alerts */}
          <div className="xl:col-span-2 space-y-6">
            <CompactTimeline />
            <AlertsWidget />
          </div>
        </div>

        {/* Jobs Table - Full Width */}
        <RecentJobsTable />
      </div>
    </MainLayout>
  );
};

export default Index;
