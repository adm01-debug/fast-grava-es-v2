import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useOperatorDashboardData } from '@/hooks/useOperatorDashboardData';
import { useUpdateJobStatus, DbJob } from '@/hooks/useJobs';
import { notifyStatusChange } from '@/hooks/useNotifications';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useAuth } from '@/contexts/AuthContext';
import { JobDetailsModal } from '@/components/jobs/JobDetailsModal';
import { ProductionRegistrationModal } from '@/components/operator/ProductionRegistrationModal';
import { ProductionTimer } from '@/components/operator/ProductionTimer';
import { PreProductionChecklistModal } from '@/components/operator/PreProductionChecklistModal';
import { ShiftSummaryCard } from '@/components/operator/ShiftSummaryCard';
import { OperatorQuickHistory } from '@/components/operator/OperatorQuickHistory';
import { OfflineSyncIndicator } from '@/components/offline/OfflineSyncIndicator';
import { SwipeActions, SwipeActionPresets } from '@/components/mobile/SwipeActions';
import { EmptyState } from '@/components/ui/empty-state';
import { SoundFeedback } from '@/lib/soundFeedback';
import { 
  User,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  ClipboardCheck,
  Maximize,
  Eye,
  EyeOff,
  Trophy,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { VoiceButton } from '@/components/voice/VoiceCommands';
import { motion, AnimatePresence } from 'framer-motion';

export default function OperatorView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedMachine, setSelectedMachine] = useState<string>('_default');
  const [selectedJob, setSelectedJob] = useState<DbJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productionJob, setProductionJob] = useState<DbJob | null>(null);
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
  const [checklistJobId, setChecklistJobId] = useState<string | null>(null);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const { jobs, techniques, machines, isLoading, getTechniqueById, getMachineById, refetchAll, assignedMachineIds } = useOperatorDashboardData();
  const updateStatus = useUpdateJobStatus();
  const { isOnline, cacheData } = useOfflineSync();

  // Set default machine to operator's primary (first assigned) machine
  useEffect(() => {
    if (selectedMachine === '_default' && assignedMachineIds && assignedMachineIds.length > 0) {
      setSelectedMachine(assignedMachineIds[0]);
    } else if (selectedMachine === '_default') {
      setSelectedMachine('all');
    }
  }, [assignedMachineIds, selectedMachine]);

  // Cache data on mount for offline use
  useEffect(() => {
    cacheData();
  }, [cacheData]);

  const effectiveMachineFilter = selectedMachine === '_default' ? 'all' : selectedMachine;

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    
    let filtered = jobs.filter(job => 
      ['ready', 'scheduled', 'production', 'paused'].includes(job.status)
    );

    if (effectiveMachineFilter !== 'all') {
      filtered = filtered.filter(job => job.machine_id === effectiveMachineFilter);
    }

    return filtered;
  }, [jobs, effectiveMachineFilter]);

  const handleStartProduction = useCallback((job: DbJob) => {
    setChecklistJobId(job.id);
    setIsChecklistOpen(true);
  }, []);

  const handleChecklistComplete = useCallback(async (jobId: string) => {
    setChecklistJobId(null);
    setIsChecklistOpen(false);
    const job = jobs?.find(j => j.id === jobId);
    if (!job) return;
    try {
      await updateStatus.mutateAsync({ jobId: job.id, status: 'production' });
      SoundFeedback.success();
      notifyStatusChange(job.client, job.status, 'production');
    } catch (error) {
      SoundFeedback.error();
      if (import.meta.env.DEV) console.error('Error starting production:', error);
    }
  }, [jobs, updateStatus]);

  const handlePauseProduction = useCallback(async (job: DbJob) => {
    try {
      await updateStatus.mutateAsync({ jobId: job.id, status: 'paused' });
      SoundFeedback.warning();
      notifyStatusChange(job.client, job.status, 'paused');
    } catch (error) {
      SoundFeedback.error();
      if (import.meta.env.DEV) console.error('Error pausing production:', error);
    }
  }, [updateStatus]);

  const handleFinishProduction = useCallback((job: DbJob) => {
    setProductionJob(job);
    setIsProductionModalOpen(true);
  }, []);

  const handleJobClick = useCallback((job: DbJob) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  }, []);

  if (isLoading || selectedMachine === '_default') {
    return (
      <MainLayout>
        <div className="p-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-24 w-full" />
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
      <PreProductionChecklistModal
        jobId={checklistJobId}
        open={isChecklistOpen}
        onOpenChange={setIsChecklistOpen}
        onComplete={handleChecklistComplete}
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
          
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={effectiveMachineFilter} onValueChange={setSelectedMachine}>
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
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={focusMode ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setFocusMode(!focusMode)}
                  className="shrink-0"
                >
                  {focusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{focusMode ? 'Sair do modo foco' : 'Modo foco'}</TooltipContent>
            </Tooltip>
            
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
              <span className="hidden sm:inline">Modo Kiosk</span>
            </Button>
          </div>
        </div>

        {/* Shift Summary - always visible */}
        {!focusMode && jobs && (
          <ShiftSummaryCard jobs={jobs} />
        )}

        {/* In Production - with pulsing border animation */}
        {inProductionJobs.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Play className="h-5 w-5 text-status-production" />
              Em Produção
              <Badge variant="secondary" className="ml-1">{inProductionJobs.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <AnimatePresence>
                {inProductionJobs.map(job => {
                  const technique = getTechniqueById(job.technique_id);
                  const machine = getMachineById(job.machine_id);
                  
                  return (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <SwipeActions
                        leftActions={[{
                          id: 'pause',
                          icon: <Pause className="h-5 w-5" />,
                          label: 'Pausar',
                          color: 'hsl(0, 0%, 100%)',
                          bgColor: 'hsl(var(--warning))',
                          onAction: () => handlePauseProduction(job),
                        }]}
                        rightActions={[{
                          id: 'finish',
                          icon: <CheckCircle2 className="h-5 w-5" />,
                          label: 'Finalizar',
                          color: 'hsl(0, 0%, 100%)',
                          bgColor: 'hsl(var(--success))',
                          onAction: () => handleFinishProduction(job),
                        }]}
                      >
                        <Card 
                          className={cn(
                            "glass-card cursor-pointer transition-colors",
                            "border-status-production/40 hover:border-status-production/60",
                            "animate-pulse-border"
                          )}
                          onClick={() => handleJobClick(job)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{job.client}</CardTitle>
                              <Badge className="bg-status-production/20 text-status-production border-status-production/50">
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
                              {job.priority === 'urgent' && (
                                <Badge variant="destructive" className="shrink-0">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Urgente
                                </Badge>
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

                            {/* Estimated time */}
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Timer className="h-3 w-3" />
                              Estimado: {job.estimated_duration}min
                            </div>

                            {/* Production Timer */}
                            <ProductionTimer job={job} />

                            <div className="flex gap-2 pt-2" onClick={e => e.stopPropagation()}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1 border-warning/50 text-warning hover:bg-warning/10"
                                onClick={() => handlePauseProduction(job)}
                              >
                                <Pause className="h-4 w-4 mr-1" />
                                Pausar
                              </Button>
                              <Button 
                                size="sm"
                                className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                                onClick={() => handleFinishProduction(job)}
                              >
                                <ClipboardCheck className="h-4 w-4 mr-1" />
                                Registrar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </SwipeActions>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Paused Jobs */}
        {!focusMode && pausedJobs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Pause className="h-5 w-5 text-warning" />
              Pausados
              <Badge variant="secondary" className="ml-1">{pausedJobs.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnimatePresence>
                {pausedJobs.map(job => {
                  const technique = getTechniqueById(job.technique_id);
                  
                  return (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <SwipeActions
                        rightActions={[{
                          id: 'resume',
                          icon: <Play className="h-5 w-5" />,
                          label: 'Retomar',
                          color: 'hsl(0, 0%, 100%)',
                          bgColor: 'hsl(var(--primary))',
                          onAction: () => handleStartProduction(job),
                        }]}
                      >
                        <Card 
                          className="glass-card border-warning/30 cursor-pointer hover:border-warning/50 transition-colors"
                          onClick={() => handleJobClick(job)}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">{job.client}</p>
                              <Badge variant="outline" className="border-warning/50 text-warning">
                                Pausado
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{job.product}</p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                              <Timer className="h-3 w-3" />
                              Estimado: {job.estimated_duration}min • {job.quantity.toLocaleString()} pçs
                            </div>
                            
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
                      </SwipeActions>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Ready Jobs */}
        {!focusMode && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-status-ready" />
              Próximos Jobs
              <Badge variant="secondary" className="ml-1">{readyJobs.length}</Badge>
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
                <AnimatePresence>
                  {readyJobs.map((job, index) => {
                    const technique = getTechniqueById(job.technique_id);
                    const machine = getMachineById(job.machine_id);
                    
                    return (
                      <motion.div
                        key={job.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <SwipeActions
                          rightActions={[{
                            id: 'start',
                            icon: <Play className="h-5 w-5" />,
                            label: 'Iniciar',
                            color: 'hsl(0, 0%, 100%)',
                            bgColor: 'hsl(var(--success))',
                            onAction: () => handleStartProduction(job),
                          }]}
                        >
                          <Card 
                            className={cn(
                              "glass-card cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                              job.priority === 'urgent' && "border-destructive/30",
                              job.priority === 'high' && "border-warning/30"
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
                                  <Badge variant="outline" className="border-warning/50 text-warning shrink-0">
                                    Alta
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground truncate mb-2">{job.product}</p>
                              
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge variant="outline" className="text-xs" style={{ 
                                  borderColor: technique?.color,
                                  color: technique?.color 
                                }}>
                                  {technique?.short_name}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {job.quantity.toLocaleString()} pçs
                                </span>
                                {machine && (
                                  <Badge variant="secondary" className="text-xs">{machine.code}</Badge>
                                )}
                              </div>

                              {/* Estimated time */}
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                                <Timer className="h-3 w-3" />
                                Estimado: {job.estimated_duration}min
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
                        </SwipeActions>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Quick History - last 5 finished jobs */}
        {!focusMode && jobs && (
          <OperatorQuickHistory 
            jobs={jobs} 
            getTechniqueName={(id) => getTechniqueById(id)?.name} 
          />
        )}
      </div>
    </MainLayout>
  );
}
