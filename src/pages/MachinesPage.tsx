import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer, CheckCircle2, XCircle, Info, Settings, History } from 'lucide-react';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { VoiceButton } from '@/components/voice/VoiceCommands';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEntityAuditTrail } from '@/hooks/useAuditTrail';
import { AuditEntryCard } from '@/components/audit/AuditEntryCard';
import { HistoryPeriodFilter, type HistoryPeriodValue } from '@/components/audit/HistoryPeriodFilter';
import { MachineTPMPanel } from '@/components/tpm/MachineTPMPanel';
import { useTPM } from '@/hooks/useTPM';
import { MaintenanceExecutionModal } from '@/components/tpm/MaintenanceExecutionModal';
import { CreateScheduleModal } from '@/components/tpm/CreateScheduleModal';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MachineReliabilityTab } from '@/components/machines/MachineReliabilityTab';

export default function MachinesPage() {
  const { machines, techniques, isLoadingMachines, getTechniqueById } = useSchedulingData();
  const { user, profile } = useAuth();
  const { 
    schedules, 
    maintenanceTypes,
    startMaintenance, 
    completeMaintenance, 
    createSchedule 
  } = useTPM();

  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [executionModalOpen, setExecutionModalOpen] = useState(false);
  const [createScheduleModalOpen, setCreateScheduleModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);

  const handleStartMaintenance = (scheduleId: string) => {
    if (!user || !profile) {
      toast.error('Você precisa estar logado para iniciar uma manutenção');
      return;
    }

    const schedule = schedules.find(s => s.id === scheduleId);
    setSelectedSchedule(schedule);

    startMaintenance.mutate({
      schedule_id: scheduleId,
      performed_by: user.id,
      performed_by_name: profile.full_name || 'Usuário',
    }, {
      onSuccess: (record) => {
        setCurrentRecordId(record.id);
        setExecutionModalOpen(true);
      }
    });
  };

  const handleCompleteMaintenance = (data: any) => {
    if (!currentRecordId) return;
    
    completeMaintenance.mutate({
      record_id: currentRecordId,
      ...data
    }, {
      onSuccess: () => {
        setExecutionModalOpen(false);
        setSelectedSchedule(null);
        setCurrentRecordId(null);
      }
    });
  };

  // Group machines by technique
  const machinesByTechnique = machines.reduce((acc, machine) => {
    const techniqueId = machine.technique_id;
    if (!acc[techniqueId]) {
      acc[techniqueId] = [];
    }
    acc[techniqueId].push(machine);
    return acc;
  }, {} as Record<string, typeof machines>);

  if (isLoadingMachines) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold gradient-text">Máquinas</h1>
            <p className="text-muted-foreground">Gerencie as máquinas de produção por técnica</p>
          </div>
          <VoiceButton />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Printer className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{machines.length}</p>
                  <p className="text-sm text-muted-foreground">Total de Máquinas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{machines.filter(m => m.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Máquinas Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {Object.entries(machinesByTechnique).map(([techniqueId, techMachines]) => {
            const technique = getTechniqueById(techniqueId);
            return (
              <Card key={techniqueId} className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: technique?.color || '#888' }}
                    />
                    <span>{technique?.name || 'Técnica Desconhecida'}</span>
                    <Badge variant="secondary" className="ml-2">
                      {techMachines.length} máquina{techMachines.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {techMachines.map((machine) => (
                      <div 
                        key={machine.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30 hover:border-primary/50 hover:bg-secondary/50 transition-all cursor-pointer group"
                        onClick={() => setSelectedMachine(machine)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Printer className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-mono font-medium">{machine.code}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {machine.name}
                            </p>
                          </div>
                        </div>
                        {machine.is_active ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Machine Profile / TPM Dialog */}
        <Dialog open={!!selectedMachine} onOpenChange={() => setSelectedMachine(null)}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-primary" />
                Perfil da Máquina: {selectedMachine?.code}
              </DialogTitle>
              <DialogDescription>
                {selectedMachine?.name} - {getTechniqueById(selectedMachine?.technique_id)?.name}
              </DialogDescription>
            </DialogHeader>
            
            {selectedMachine && (
              <Tabs defaultValue="tpm" className="mt-2 flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tpm">Manutenção (TPM)</TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Histórico
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="tpm" className="flex-1 mt-4 overflow-auto">
                  <MachineTPMPanel 
                    machineId={selectedMachine.id} 
                    onStartMaintenance={handleStartMaintenance}
                    onOpenCreateSchedule={() => setCreateScheduleModalOpen(true)}
                  />
                </TabsContent>

                <TabsContent value="history" className="flex-1 mt-4 overflow-hidden">
                  <MachineHistoryTab machineId={selectedMachine.id} />
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Execution Modal */}
        <MaintenanceExecutionModal
          isOpen={executionModalOpen}
          onClose={() => setExecutionModalOpen(false)}
          schedule={selectedSchedule}
          recordId={currentRecordId}
          onComplete={handleCompleteMaintenance}
        />

        {/* Create Schedule Modal */}
        {selectedMachine && (
          <CreateScheduleModal
            machines={machines}
            maintenanceTypes={maintenanceTypes}
            initialMachineId={selectedMachine.id}
            isOpen={createScheduleModalOpen}
            onOpenChange={setCreateScheduleModalOpen}
            onSubmit={(data) => createSchedule.mutate(data)}
            isSubmitting={createSchedule.isPending}
          />
        )}
      </div>
    </MainLayout>
  );
}

function MachineHistoryTab({ machineId }: { machineId: string }) {
  const [period, setPeriod] = useState<HistoryPeriodValue>({ preset: 'all' });
  const { data, isLoading, error } = useEntityAuditTrail('machines', machineId, {
    fromDate: period.fromDate,
    toDate: period.toDate,
  });

  return (
    <div>
      <HistoryPeriodFilter value={period} onChange={setPeriod} resultCount={data?.length} />
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <div className="text-sm text-destructive p-4 border border-destructive/30 rounded-md bg-destructive/10">
          Não foi possível carregar o histórico.
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-12 border border-dashed rounded-xl">
          Nenhum registro encontrado no período selecionado.
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3 pb-4">
            {data.map((entry) => (
              <AuditEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

