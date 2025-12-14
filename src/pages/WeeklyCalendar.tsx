import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Filter, CalendarDays, Calendar as CalendarIcon } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { JobDetailsModal } from '@/components/jobs/JobDetailsModal';
import { cn } from '@/lib/utils';
import { mockJobs, machines, techniques, getTechniqueById } from '@/data/mockData';
import { Job, JobStatus } from '@/types/scheduling';

const statusColors: Record<JobStatus, string> = {
  queue: 'bg-status-queue/80 border-status-queue',
  ready: 'bg-status-ready/80 border-status-ready',
  scheduled: 'bg-status-scheduled/80 border-status-scheduled',
  production: 'bg-status-production/80 border-status-production',
  finished: 'bg-status-finished/80 border-status-finished',
  paused: 'bg-status-paused/80 border-status-paused',
  cancelled: 'bg-status-cancelled/80 border-status-cancelled',
  delayed: 'bg-status-delayed/80 border-status-delayed',
  rework: 'bg-status-rework/80 border-status-rework',
};

const statusLabels: Record<JobStatus, string> = {
  queue: 'Na Fila',
  ready: 'No Jeito',
  scheduled: 'Agendado',
  production: 'Em Produção',
  finished: 'Finalizado',
  paused: 'Pausado',
  cancelled: 'Cancelado',
  delayed: 'Atrasado',
  rework: 'Retrabalho',
};

export default function WeeklyCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTechnique, setSelectedTechnique] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  
  // Generate week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Filter jobs for the week
  const weekJobs = useMemo(() => {
    return mockJobs.filter(job => {
      const jobDate = new Date(job.scheduledDate);
      const isInWeek = jobDate >= weekStart && jobDate <= weekEnd;
      
      if (selectedTechnique !== 'all') {
        return isInWeek && job.techniqueId === selectedTechnique;
      }
      return isInWeek;
    });
  }, [weekStart, weekEnd, selectedTechnique]);

  // Filter machines by technique
  const filteredMachines = useMemo(() => {
    if (selectedTechnique === 'all') return machines.slice(0, 20); // Limit for performance
    return machines.filter(m => m.techniqueId === selectedTechnique);
  }, [selectedTechnique]);

  // Group jobs by machine and day
  const jobsByMachineAndDay = useMemo(() => {
    const grouped: Record<string, Record<string, Job[]>> = {};
    
    weekJobs.forEach(job => {
      if (!grouped[job.machineId]) {
        grouped[job.machineId] = {};
      }
      const dayKey = format(new Date(job.scheduledDate), 'yyyy-MM-dd');
      if (!grouped[job.machineId][dayKey]) {
        grouped[job.machineId][dayKey] = [];
      }
      grouped[job.machineId][dayKey].push(job);
    });
    
    return grouped;
  }, [weekJobs]);

  const handlePrevWeek = () => setSelectedDate(subWeeks(selectedDate, 1));
  const handleNextWeek = () => setSelectedDate(addWeeks(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

  const getJobsForMachineAndDay = (machineId: string, day: Date) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    return jobsByMachineAndDay[machineId]?.[dayKey] || [];
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  return (
    <MainLayout>
      <JobDetailsModal 
        job={selectedJob} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold gradient-text">Calendário Semanal</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Visualização panorâmica da semana por máquina
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Technique Filter */}
            <Select value={selectedTechnique} onValueChange={setSelectedTechnique}>
              <SelectTrigger className="w-full sm:w-[180px] bg-card border-border/40">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filtrar técnica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Técnicas</SelectItem>
                {techniques.map(tech => (
                  <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Week Navigation */}
            <div className="flex items-center justify-between sm:justify-start gap-1 bg-card border border-border/40 rounded-lg p-1 w-full sm:w-auto">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="h-8 px-2 sm:px-3 gap-1 sm:gap-2 flex-1 sm:flex-initial">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="font-medium text-xs sm:text-sm">
                      {format(weekStart, "dd MMM", { locale: ptBR })} - {format(weekEnd, "dd MMM", { locale: ptBR })}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToday}
                className="border-border/40 ml-1 text-xs sm:text-sm"
              >
                <span className="hidden xs:inline">Esta </span>Semana
              </Button>
            </div>
          </div>
        </div>

        {/* Weekly Grid */}
        <Card className="bg-card border border-border/40 rounded-xl overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-3 px-3 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-sm sm:text-lg font-display gradient-text flex items-center gap-2">
                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="hidden sm:inline">Semana {format(weekStart, "ww", { locale: ptBR })} de {format(weekStart, "yyyy")}</span>
                <span className="sm:hidden">Sem. {format(weekStart, "ww", { locale: ptBR })}/{format(weekStart, "yyyy")}</span>
              </CardTitle>
              <Badge variant="outline" className="border-primary/30 text-primary w-fit">
                {weekJobs.length} agendamento{weekJobs.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="w-full h-[calc(100vh-300px)]">
              <div className="min-w-[1000px]">
                {/* Days Header */}
                <div className="flex border-b border-border/40 bg-muted/5 sticky top-0 z-10">
                  <div className="w-24 shrink-0 p-3 border-r border-border/40">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Máquina</span>
                  </div>
                  {weekDays.map((day) => (
                    <div 
                      key={day.toISOString()} 
                      className={cn(
                        "flex-1 text-center py-3 border-r border-border/20 last:border-r-0",
                        isToday(day) && "bg-primary/5"
                      )}
                    >
                      <div className="text-xs font-medium text-muted-foreground uppercase">
                        {format(day, "EEE", { locale: ptBR })}
                      </div>
                      <div className={cn(
                        "text-lg font-semibold mt-0.5",
                        isToday(day) ? "text-primary" : "text-foreground"
                      )}>
                        {format(day, "dd")}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Machine Rows */}
                {filteredMachines.map((machine, index) => {
                  const technique = getTechniqueById(machine.techniqueId);
                  
                  return (
                    <div 
                      key={machine.id} 
                      className={cn(
                        "flex border-b border-border/20 hover:bg-muted/5 transition-colors",
                        index % 2 === 0 && "bg-muted/3"
                      )}
                    >
                      {/* Machine Label */}
                      <div className="w-24 shrink-0 p-2 border-r border-border/40 flex items-center gap-2">
                        <div 
                          className="w-1.5 h-10 rounded-full shrink-0" 
                          style={{ backgroundColor: technique?.color || 'hsl(var(--muted))' }}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground">{machine.code}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {technique?.shortName}
                          </div>
                        </div>
                      </div>
                      
                      {/* Day Cells */}
                      {weekDays.map((day) => {
                        const dayJobs = getJobsForMachineAndDay(machine.id, day);
                        
                        return (
                          <div 
                            key={day.toISOString()} 
                            className={cn(
                              "flex-1 min-h-[60px] p-1 border-r border-border/10 last:border-r-0",
                              isToday(day) && "bg-primary/5"
                            )}
                          >
                            <div className="flex flex-col gap-1">
                              {dayJobs.slice(0, 3).map((job) => (
                                <Tooltip key={job.id}>
                                  <TooltipTrigger asChild>
                                    <div
                                      onClick={() => handleJobClick(job)}
                                      className={cn(
                                        "px-1.5 py-1 rounded text-xs font-medium truncate cursor-pointer",
                                        "border transition-all duration-200 hover:scale-[1.02]",
                                        statusColors[job.status]
                                      )}
                                    >
                                      <span className="text-white/90">
                                        {job.orderNumber.replace('OS-2024-', '')}
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent 
                                    side="top" 
                                    className="bg-card border-border/40 shadow-xl max-w-xs"
                                  >
                                    <div className="space-y-1.5">
                                      <div className="font-semibold text-foreground">{job.orderNumber}</div>
                                      <div className="text-sm text-muted-foreground">{job.client}</div>
                                      <div className="text-sm">{job.product}</div>
                                      <div className="flex items-center gap-2 text-xs">
                                        <span className="text-muted-foreground">
                                          {job.startTime} - {job.endTime}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                          {statusLabels[job.status]}
                                        </Badge>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {job.quantity.toLocaleString()} peças
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                              {dayJobs.length > 3 && (
                                <div className="text-xs text-muted-foreground text-center">
                                  +{dayJobs.length - 3} mais
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                
                {/* Empty State */}
                {filteredMachines.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    Nenhuma máquina encontrada para o filtro selecionado.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="bg-card border border-border/40 rounded-xl">
          <CardContent className="py-3 sm:py-4 px-3 sm:px-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <span className="text-xs font-medium text-muted-foreground uppercase w-full sm:w-auto">Legenda:</span>
              {Object.entries(statusLabels).slice(0, 6).map(([status, label]) => (
                <div key={status} className="flex items-center gap-1.5 sm:gap-2">
                  <div className={cn(
                    "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm border",
                    statusColors[status as JobStatus]
                  )} />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
