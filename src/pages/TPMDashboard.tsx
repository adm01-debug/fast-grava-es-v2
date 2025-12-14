import { Helmet } from 'react-helmet';
import { Wrench, AlertTriangle, CheckCircle, Clock, CalendarCheck, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useTPM } from '@/hooks/useTPM';
import { useAuth } from '@/contexts/AuthContext';
import { TPMAlertsPanel } from '@/components/tpm/TPMAlertsPanel';
import { TPMCalendar } from '@/components/tpm/TPMCalendar';
import { TPMScheduleList } from '@/components/tpm/TPMScheduleList';
import { CreateScheduleModal } from '@/components/tpm/CreateScheduleModal';
import { toast } from 'sonner';

export default function TPMDashboard() {
  const { user, profile } = useAuth();
  const {
    maintenanceTypes,
    schedules,
    alerts,
    machines,
    stats,
    isLoading,
    createSchedule,
    startMaintenance,
    completeMaintenance,
    checkAndGenerateAlerts,
    resolveAlert,
  } = useTPM();

  const handleStartMaintenance = (scheduleId: string) => {
    if (!user || !profile) {
      toast.error('Você precisa estar logado para iniciar uma manutenção');
      return;
    }
    startMaintenance.mutate({
      schedule_id: scheduleId,
      performed_by: user.id,
      performed_by_name: profile.full_name || 'Usuário',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>TPM - Manutenção Preventiva | Sistema de Gravação</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">TPM - Manutenção Preventiva</h1>
            <p className="text-muted-foreground">
              Total Productive Maintenance - Gestão de manutenções programadas
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => checkAndGenerateAlerts.mutate()}
              disabled={checkAndGenerateAlerts.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${checkAndGenerateAlerts.isPending ? 'animate-spin' : ''}`} />
              Verificar Alertas
            </Button>
            <CreateScheduleModal
              machines={machines}
              maintenanceTypes={maintenanceTypes}
              onSubmit={(data) => createSchedule.mutate(data)}
              isSubmitting={createSchedule.isPending}
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="card-glass hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <CalendarCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Agendadas</p>
                  <p className="text-2xl font-bold font-display">{stats.totalScheduled}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Wrench className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vence Hoje</p>
                  <p className="text-2xl font-bold font-display text-blue-500">{stats.dueToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Próximos 7 dias</p>
                  <p className="text-2xl font-bold font-display text-amber-500">{stats.upcoming7Days}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-500/10">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Atrasadas</p>
                  <p className="text-2xl font-bold font-display text-red-500">{stats.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Concluídas/Mês</p>
                  <p className="text-2xl font-bold font-display text-emerald-500">{stats.completedThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="alerts">
              Alertas
              {stats.activeAlerts > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-destructive text-destructive-foreground">
                  {stats.activeAlerts}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TPMCalendar 
                  schedules={schedules} 
                  onSelectSchedule={(schedule) => handleStartMaintenance(schedule.id)} 
                />
              </div>
              <TPMAlertsPanel
                alerts={alerts}
                onResolve={(id) => resolveAlert.mutate(id)}
                onStartMaintenance={handleStartMaintenance}
              />
            </div>
          </TabsContent>

          <TabsContent value="list">
            <TPMScheduleList
              schedules={schedules}
              onStartMaintenance={handleStartMaintenance}
            />
          </TabsContent>

          <TabsContent value="alerts">
            <TPMAlertsPanel
              alerts={alerts}
              onResolve={(id) => resolveAlert.mutate(id)}
              onStartMaintenance={handleStartMaintenance}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
