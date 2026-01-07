import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { useUpdateJobStatus, DbJob } from '@/hooks/useJobs';
import { notifyStatusChange } from '@/hooks/useNotifications';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { JobDetailsModal } from '@/components/jobs/JobDetailsModal';
import { ProductionRegistrationModal } from '@/components/operator/ProductionRegistrationModal';
import { OfflineSyncIndicator } from '@/components/offline/OfflineSyncIndicator';
import { MobilePullToRefresh } from '@/components/mobile/PullToRefresh';
import { SwipeActions, SwipeActionPresets } from '@/components/mobile/SwipeActions';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  User,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  ClipboardCheck,
  Maximize
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { JobStatus } from '@/types/scheduling';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { VoiceButton } from '@/components/voice/VoiceCommands';

export default function OperatorView() {
  const navigate = useNavigate();
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<DbJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productionJob, setProductionJob] = useState<DbJob | null>(null);
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);

  const { jobs, techniques, machines, isLoading, getTechniqueById, getMachineById, refetchAll } = useSchedulingData();
  const updateStatus = useUpdateJobStatus();
  const { isOnline, cacheData, getCachedJobs, getCachedMachines } = useOfflineSync();

  // Cache data on mount for offline use
  useEffect(() => {
    cacheData();
  }, []);

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    
    let filtered = jobs.filter(job => 
      ['ready', 'scheduled', 'production', 'paused'].includes(job.status)
    );

    if (selectedMachine !== 'all') {
      filtered = filtered.filter(job => job.machine_id === selectedMachine);
    }

    return filtered;
  }, [jobs, selectedMachine]);

  const handleStartProduction = async (job: DbJob) => {
    try {
      await updateStatus.mutateAsync({ jobId: job.id, status: 'production' });
      notifyStatusChange(job.client, job.status, 'production');
    } catch (error) {
      console.error('Error starting production:', error);
    }
  };

  const handlePauseProduction = async (job: DbJob) => {
    try {
      await updateStatus.mutateAsync({ jobId: job.id, status: 'paused' });
      notifyStatusChange(job.client, job.status, 'paused');
    } catch (error) {
      console.error('Error pausing production:', error);
    }
  };

  const handleFinishProduction = (job: DbJob) => {
    setProductionJob(job);
    setIsProductionModalOpen(true);
  };

  const handleJobClick = (job: DbJob) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const getTechnique = getTechniqueById;
  const getMachine = getMachineById;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  const inProductionJobs = filteredJobs.filter(j => j.status === 'production');
  const readyJobs = filteredJobs.filter(j => ['ready', 'scheduled'].includes(j.status));
  const pausedJobs = filteredJobs.filter(j => j.status === 'paused');

  return (
    <MainLayout>
      <JobDetailsModal 
        job={selectedJob} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
      <ProductionRegistrationModal
        job={productionJob}
        open={isProductionModalOpen}
        onOpenChange={setIsProductionModalOpen}
      />
      
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-fade-in-up">
        <Breadcrumbs />
        
        {/* Offline Sync Indicator */}
        <OfflineSyncIndicator variant="full" />

        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">
              <span className="gradient-text">Visão do Operador</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Gerencie suas produções {!isOnline && '(Modo Offline)'}
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={selectedMachine} onValueChange={setSelectedMachine}>
              <SelectTrigger className="w-full sm:w-[220px] bg-card/50 border-border/50">
                <User className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Selecionar máquina" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todas as máquinas</SelectItem>
                {machines?.map(machine => (
                  <SelectItem key={machine.id} value={machine.id}>
                    {machine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <VoiceButton onCommand={(cmd) => {
              if (cmd.startsWith('navigate:')) {
                const dest = cmd.replace('navigate:', '');
                if (dest.includes('kiosk')) navigate('/kiosk');
              }
            }} />
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/kiosk')}
              className="gap-2"
            >
              <Maximize className="h-4 w-4" />
              Modo Kiosk
            </Button>
          </div>
        </div>

        {/* In Production */}
        {inProductionJobs.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Play className="h-5 w-5 text-cyan-400" />
              Em Produção
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-4">
              {inProductionJobs.map(job => {
                const technique = getTechnique(job.technique_id);
                const machine = getMachine(job.machine_id);
                
                return (
                  <Card 
                    key={job.id} 
                    className="glass-card border-cyan-500/30 cursor-pointer hover:border-cyan-500/50 transition-colors"
                    onClick={() => handleJobClick(job)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{job.client}</CardTitle>
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                          Em Produção
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" style={{ 
                          borderColor: technique?.color,
                          color: technique?.color 
                        }}>
                          {technique?.name}
                        </Badge>
                        {machine && (
                          <Badge variant="secondary">{machine.name}</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Produto</p>
                          <p className="font-medium">{job.product}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quantidade</p>
                          <p className="font-medium">{job.quantity.toLocaleString()} pçs</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2" onClick={e => e.stopPropagation()}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1 border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                          onClick={() => handlePauseProduction(job)}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pausar
                        </Button>
                        <Button 
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleFinishProduction(job)}
                        >
                          <ClipboardCheck className="h-4 w-4 mr-1" />
                          Registrar Produção
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Paused Jobs */}
        {pausedJobs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Pause className="h-5 w-5 text-orange-400" />
              Pausados
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pausedJobs.map(job => {
                const technique = getTechnique(job.technique_id);
                
                return (
                  <Card 
                    key={job.id} 
                    className="glass-card border-orange-500/30 cursor-pointer hover:border-orange-500/50 transition-colors"
                    onClick={() => handleJobClick(job)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{job.client}</p>
                        <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                          Pausado
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{job.product}</p>
                      
                      <Button 
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartProduction(job);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Retomar Produção
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Ready Jobs */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-400" />
            Próximos Jobs ({readyJobs.length})
          </h2>
          
          {readyJobs.length === 0 ? (
            <EmptyState
              variant="no-events"
              title="Nenhum job aguardando"
              description="Não há jobs prontos para produção no momento."
              size="sm"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyJobs.map(job => {
                const technique = getTechnique(job.technique_id);
                const machine = getMachine(job.machine_id);
                
                return (
                  <Card 
                    key={job.id} 
                    className={cn(
                      "glass-card cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                      job.priority === 'urgent' && "border-red-500/30",
                      job.priority === 'high' && "border-orange-500/30"
                    )}
                    onClick={() => handleJobClick(job)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium truncate">{job.client}</p>
                        {job.priority === 'urgent' && (
                          <Badge variant="destructive" className="shrink-0">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Urgente
                          </Badge>
                        )}
                        {job.priority === 'high' && (
                          <Badge variant="outline" className="border-orange-500/50 text-orange-400 shrink-0">
                            Alta
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground truncate mb-2">{job.product}</p>
                      
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge variant="outline" className="text-xs" style={{ 
                          borderColor: technique?.color,
                          color: technique?.color 
                        }}>
                          {technique?.short_name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {job.quantity.toLocaleString()} pçs
                        </span>
                      </div>

                      <Button 
                        size="sm"
                        className="w-full gradient-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartProduction(job);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Iniciar Produção
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
