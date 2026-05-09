import { useState, useMemo, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer, CheckCircle2, XCircle, Info, Settings, History, Activity, AlertTriangle, Map as MapIcon, Zap, Thermometer, Flame } from 'lucide-react';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { VoiceButton } from '@/components/voice/VoiceCommands';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
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
import { useMTBFMTTR } from '@/hooks/useMTBFMTTR';
import { useDataExport } from '@/hooks/useDataExport';

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
  const { summary: reliabilitySummary, isLoading: isLoadingReliability } = useMTBFMTTR();

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
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold gradient-text">Máquinas</h1>
            <p className="text-muted-foreground">Gerencie as máquinas de produção por técnica</p>
          </div>
          <div className="flex items-center gap-3">
             <VoiceButton />
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="list" className="gap-2">
              <Printer className="h-4 w-4" />
              Lista de Máquinas
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="gap-2 text-amber-600">
              <MapIcon className="h-4 w-4" />
              Mapa de Calor (Heatmap)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">

        <div className="grid gap-4 md:grid-cols-4">
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

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {isLoadingReliability ? <Skeleton className="h-8 w-12" /> : `${Math.round(reliabilitySummary.averageAvailability)}%`}
                  </p>
                  <p className="text-sm text-muted-foreground">Disponibilidade Média</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {isLoadingReliability ? <Skeleton className="h-8 w-12" /> : reliabilitySummary.criticalMachines.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Máquinas Críticas</p>
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
      </TabsContent>

          <TabsContent value="heatmap">
             <FactoryHeatmap machines={machines} techniques={techniques} />
          </TabsContent>
        </Tabs>

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
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tpm">Manutenção (TPM)</TabsTrigger>
                  <TabsTrigger value="reliability" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Confiabilidade
                  </TabsTrigger>
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

                <TabsContent value="reliability" className="flex-1 mt-4 overflow-auto">
                  <MachineReliabilityTab machineId={selectedMachine.id} />
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
  const { exportAuditTrail } = useDataExport('machines' as any);

  const handleExport = useCallback((format: 'csv' | 'pdf') => {
    exportAuditTrail({
      entityType: 'machines',
      entityId: machineId,
      fromDate: period.fromDate,
      toDate: period.toDate,
    }, `auditoria_maquina_${machineId.slice(0, 8)}`, format);
  }, [machineId, period, exportAuditTrail]);

  return (
    <div className="mt-4">
      <HistoryPeriodFilter 
        value={period} 
        onChange={setPeriod} 
        onExport={handleExport}
        resultCount={data?.length} 
      />
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

function FactoryHeatmap({ machines, techniques }: { machines: any[]; techniques: any[] }) {
  const getHeatColor = (machine: any) => {
    if (!machine.is_active) return 'bg-slate-200 dark:bg-slate-800 opacity-40';
    // Simulate heat based on machine code or random for visualization
    const heatValue = Math.random(); 
    if (heatValue > 0.8) return 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]';
    if (heatValue > 0.5) return 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]';
    return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
  };

  const getHeatIcon = (machine: any) => {
    if (!machine.is_active) return <XCircle className="h-4 w-4 text-muted-foreground" />;
    const heatValue = Math.random();
    if (heatValue > 0.8) return <Flame className="h-4 w-4 text-white animate-pulse" />;
    if (heatValue > 0.5) return <Zap className="h-4 w-4 text-white" />;
    return <Activity className="h-4 w-4 text-white" />;
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapIcon className="h-5 w-5 text-amber-600" />
                Layout Térmico da Fábrica
              </CardTitle>
              <CardDescription>Visualização em tempo real de pontos de calor e ociosidade</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-tighter">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500" /> Carga Alta</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Normal</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400" /> Inativo</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="relative aspect-[21/9] bg-muted/20 rounded-2xl border-4 border-dashed border-border/40 p-12 overflow-hidden">
            {/* Simulation of a Factory Floor Grid */}
            <div className="grid grid-cols-6 lg:grid-cols-8 gap-8 h-full">
              {machines.map((machine, idx) => (
                <motion.div
                  key={machine.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex flex-col items-center gap-2"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 relative group",
                        getHeatColor(machine)
                      )}>
                        {getHeatIcon(machine)}
                        <div className="absolute -top-1 -right-1">
                           {machine.is_active && Math.random() > 0.7 && (
                             <div className="h-3 w-3 rounded-full bg-red-500 border-2 border-white animate-ping" />
                           )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                       <p className="font-bold">{machine.code}</p>
                       <p className="text-[10px]">{machine.name}</p>
                       <p className="text-[10px] uppercase font-black mt-1 text-primary">OEE: {(Math.random() * 30 + 65).toFixed(1)}%</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">{machine.code}</span>
                </motion.div>
              ))}
            </div>

            {/* Factory Areas Overlay Labels */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-12 text-[10px] font-black uppercase text-muted-foreground/30 pointer-events-none">
               <span>ZONA A - GRAVAÇÃO</span>
               <span>ZONA B - ACABAMENTO</span>
               <span>ZONA C - LOGÍSTICA</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="glass-card">
           <CardHeader>
             <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
               <Thermometer className="h-4 w-4 text-orange-500" />
               Gargalos Identificados (Hotspots)
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             {machines.slice(0, 3).map((m) => (
               <div key={m.id} className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/20 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-orange-500/20 text-orange-600">
                     <Flame className="h-4 w-4" />
                   </div>
                   <div>
                     <p className="text-sm font-bold">{m.code}</p>
                     <p className="text-xs text-muted-foreground">Fila de espera &gt; 120% da capacidade</p>
                   </div>
                 </div>
                 <Badge variant="outline" className="text-orange-600 border-orange-500/30">CRÍTICO</Badge>
               </div>
             ))}
           </CardContent>
         </Card>

         <Card className="glass-card">
           <CardHeader>
             <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
               <Zap className="h-4 w-4 text-emerald-500" />
               Zonas de Otimização (Coldspots)
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             {machines.filter(m => !m.is_active).slice(0, 2).map((m) => (
               <div key={m.id} className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-blue-500/20 text-blue-600">
                     <XCircle className="h-4 w-4" />
                   </div>
                   <div>
                     <p className="text-sm font-bold">{m.code}</p>
                     <p className="text-xs text-muted-foreground">Capacidade disponível para redirecionamento</p>
                   </div>
                 </div>
                 <Badge variant="outline" className="text-blue-600 border-blue-500/30">DISPONÍVEL</Badge>
               </div>
             ))}
             {machines.filter(m => !m.is_active).length === 0 && (
               <p className="text-xs text-muted-foreground text-center py-8">Todas as máquinas operando em carga total.</p>
             )}
           </CardContent>
         </Card>
      </div>
    </div>
  );
}

