import { useState, useMemo } from 'react';
import { format, isToday, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Filter, Calendar as CalendarIcon, Clock } from 'lucide-react';
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
import { mockJobs, machines, techniques, getMachineById, getTechniqueById } from '@/data/mockData';
import { Job, JobStatus } from '@/types/scheduling';

const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 to 20:00

const statusColors: Record<JobStatus, string> = {
  queue: 'bg-status-queue/20 border-status-queue text-status-queue',
  ready: 'bg-status-ready/20 border-status-ready text-status-ready',
  scheduled: 'bg-status-scheduled/20 border-status-scheduled text-status-scheduled',
  production: 'bg-status-production/20 border-status-production text-status-production',
  finished: 'bg-status-finished/20 border-status-finished text-status-finished',
  paused: 'bg-status-paused/20 border-status-paused text-status-paused',
  cancelled: 'bg-status-cancelled/20 border-status-cancelled text-status-cancelled',
  delayed: 'bg-status-delayed/20 border-status-delayed text-status-delayed',
  rework: 'bg-status-rework/20 border-status-rework text-status-rework',
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

export default function DailyCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTechnique, setSelectedTechnique] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter jobs for selected date
  const dayJobs = useMemo(() => {
    return mockJobs.filter(job => {
      const jobDate = new Date(job.scheduledDate);
      const isSameDay = 
        jobDate.getDate() === selectedDate.getDate() &&
        jobDate.getMonth() === selectedDate.getMonth() &&
        jobDate.getFullYear() === selectedDate.getFullYear();
      
      if (selectedTechnique !== 'all') {
        return isSameDay && job.techniqueId === selectedTechnique;
      }
      return isSameDay;
    });
  }, [selectedDate, selectedTechnique]);

  // Filter machines by technique
  const filteredMachines = useMemo(() => {
    if (selectedTechnique === 'all') return machines;
    return machines.filter(m => m.techniqueId === selectedTechnique);
  }, [selectedTechnique]);

  // Group jobs by machine
  const jobsByMachine = useMemo(() => {
    const grouped: Record<string, Job[]> = {};
    dayJobs.forEach(job => {
      if (!grouped[job.machineId]) {
        grouped[job.machineId] = [];
      }
      grouped[job.machineId].push(job);
    });
    return grouped;
  }, [dayJobs]);

  // Calculate job position on timeline
  const getJobPosition = (job: Job) => {
    const [startHour, startMin] = job.startTime.split(':').map(Number);
    const [endHour, endMin] = job.endTime.split(':').map(Number);
    
    const startMinutes = (startHour - 7) * 60 + startMin;
    const endMinutes = (endHour - 7) * 60 + endMin;
    const totalMinutes = 14 * 60; // 7:00 to 21:00
    
    const left = (startMinutes / totalMinutes) * 100;
    const width = ((endMinutes - startMinutes) / totalMinutes) * 100;
    
    return { left: `${left}%`, width: `${Math.max(width, 3)}%` };
  };

  // Current time indicator
  const currentTimePosition = useMemo(() => {
    if (!isToday(selectedDate)) return null;
    const now = new Date();
    const minutes = (now.getHours() - 7) * 60 + now.getMinutes();
    const totalMinutes = 14 * 60;
    if (minutes < 0 || minutes > totalMinutes) return null;
    return `${(minutes / totalMinutes) * 100}%`;
  }, [selectedDate]);

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());
  
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
            <h1 className="text-xl sm:text-2xl font-display font-bold gradient-text">Calendário Diário</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Visualização completa da agenda por máquina
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

            {/* Date Navigation */}
            <div className="flex items-center justify-between sm:justify-start gap-1 bg-card border border-border/40 rounded-lg p-1 w-full sm:w-auto">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="h-8 px-2 sm:px-3 gap-1 sm:gap-2 flex-1 sm:flex-initial">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="font-medium text-sm sm:text-base">
                      {format(selectedDate, "dd MMM", { locale: ptBR })}
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
              
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToday}
                className={cn(
                  "border-border/40 ml-1",
                  isToday(selectedDate) && "bg-primary/10 text-primary border-primary/30"
                )}
              >
                Hoje
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card className="bg-card border border-border/40 rounded-xl overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-3 px-3 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-sm sm:text-lg font-display gradient-text flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="hidden sm:inline">{format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                <span className="sm:hidden">{format(selectedDate, "EEEE, dd MMM", { locale: ptBR })}</span>
              </CardTitle>
              <Badge variant="outline" className="border-primary/30 text-primary w-fit">
                {dayJobs.length} agendamento{dayJobs.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <div className="min-w-[1200px]">
                {/* Hours Header */}
                <div className="flex border-b border-border/40 bg-muted/5">
                  <div className="w-28 shrink-0 p-3 border-r border-border/40">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Máquina</span>
                  </div>
                  <div className="flex-1 flex">
                    {hours.map((hour) => (
                      <div key={hour} className="flex-1 text-center py-3 border-r border-border/20 last:border-r-0">
                        <span className="text-xs font-medium text-muted-foreground">
                          {hour.toString().padStart(2, '0')}:00
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Machine Rows */}
                {filteredMachines.map((machine, index) => {
                  const machineJobs = jobsByMachine[machine.id] || [];
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
                      <div className="w-28 shrink-0 p-3 border-r border-border/40 flex items-center gap-2">
                        <div 
                          className="w-2 h-8 rounded-full" 
                          style={{ backgroundColor: technique?.color || 'hsl(var(--muted))' }}
                        />
                        <div>
                          <div className="text-sm font-semibold text-foreground">{machine.code}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[80px]">
                            {technique?.shortName}
                          </div>
                        </div>
                      </div>
                      
                      {/* Timeline */}
                      <div className="flex-1 relative h-16">
                        {/* Hour Grid Lines */}
                        <div className="absolute inset-0 flex">
                          {hours.map((hour) => (
                            <div key={hour} className="flex-1 border-r border-border/10 last:border-r-0" />
                          ))}
                        </div>
                        
                        {/* Current Time Indicator */}
                        {currentTimePosition && (
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                            style={{ left: currentTimePosition }}
                          >
                            <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full" />
                          </div>
                        )}
                        
                        {/* Jobs */}
                        {machineJobs.map((job) => {
                          const position = getJobPosition(job);
                          
                          return (
                            <Tooltip key={job.id}>
                              <TooltipTrigger asChild>
                                <div
                                  onClick={() => handleJobClick(job)}
                                  className={cn(
                                    "absolute top-2 bottom-2 rounded-md border cursor-pointer",
                                    "flex items-center justify-center overflow-hidden",
                                    "transition-all duration-200 hover:scale-[1.02] hover:z-10",
                                    "shadow-sm hover:shadow-md",
                                    statusColors[job.status]
                                  )}
                                  style={position}
                                >
                                  <div className="px-2 text-xs font-medium truncate">
                                    {job.orderNumber.replace('OS-2024-', '')}
                                  </div>
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
                                    <Badge 
                                      variant="outline" 
                                      className={cn("text-xs", statusColors[job.status])}
                                    >
                                      {statusLabels[job.status]}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {job.quantity.toLocaleString()} peças • {job.gravureColor}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
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
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-xs font-medium text-muted-foreground uppercase">Legenda:</span>
              {Object.entries(statusLabels).slice(0, 6).map(([status, label]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-sm border",
                    statusColors[status as JobStatus]
                  )} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
