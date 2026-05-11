import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, isToday, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JobDetailsModal } from '@/components/jobs/JobDetailsModal';
import { AgendaView } from '@/components/calendar/AgendaView';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { CalendarTimeline } from '@/components/calendar/CalendarTimeline';
import { CalendarLegend } from '@/components/calendar/CalendarLegend';
import { DensityMinimap } from '@/components/calendar/DensityMinimap';
import { CalendarToolbar } from '@/components/calendar/CalendarToolbar';
import { CalendarOnboarding } from '@/components/calendar/CalendarOnboarding';
import { CalendarEmptyState } from '@/components/calendar/CalendarEmptyState';
import { MobileFAB } from '@/components/calendar/MobileFAB';
import { OptimizationAssistant } from '@/components/calendar/OptimizationAssistant';
import { ConflictResolutionPanel } from '@/components/calendar/ConflictResolutionPanel';
import { QuickJobDrawer } from '@/components/calendar/QuickJobDrawer';
import { PlanningEfficiencyDashboard } from '@/components/planning/PlanningEfficiencyDashboard';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { useCalendarFilters } from '@/hooks/useCalendarFilters';
import { useCalendarPreferences } from '@/hooks/useCalendarPreferences';
import { useCalendarHotkeys } from '@/hooks/useCalendarHotkeys';
import { useSchedulingConflicts } from '@/hooks/useSchedulingConflicts';
import { useMachineUtilization } from '@/hooks/useMachineUtilization';
import { DbJob } from '@/hooks/useJobs';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { useDevice } from '@/hooks/use-device';
import { exportElementToPdf, downloadICalFeed } from '@/lib/calendarExports';
import { toast } from 'sonner';
import '@/components/calendar/calendar-print.css';

const START_HOUR = 7;
const END_HOUR = 21;

export default function DailyCalendar() {
  const [searchParams] = useSearchParams();
  const initialDate = useMemo(() => {
    const q = searchParams.get('date');
    if (q) {
      const d = new Date(q);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [searchParams]);

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [selectedJob, setSelectedJob] = useState<DbJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'agenda'>('timeline');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useDevice();

  const { jobs, techniques, machines, getTechniqueById, refetchJobs } = useSchedulingData();
  const { conflicts } = useSchedulingConflicts();
  const { prefs, setZoom, setGroupBy, toggleOverlay, completeOnboarding } =
    useCalendarPreferences('daily');
  const {
    filters,
    updateFilter,
    toggleArrayValue,
    clearFilters,
    activeCount,
    applyFilters,
  } = useCalendarFilters('daily-calendar-filters-v1');

  // Show onboarding once
  useEffect(() => {
    if (!prefs.onboardingDone) {
      const t = setTimeout(() => setOnboardingOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [prefs.onboardingDone]);

  useCalendarHotkeys({ selectedDate, onDateChange: setSelectedDate, scope: 'daily' });

  const effectiveViewMode = isMobile ? 'agenda' : viewMode;

  const dayJobs = useMemo(() => {
    const filtered = applyFilters(jobs);
    return filtered.filter((job) => {
      if (!job.scheduled_date) return false;
      const jobDate = new Date(job.scheduled_date);
      return (
        jobDate.getDate() === selectedDate.getDate() &&
        jobDate.getMonth() === selectedDate.getMonth() &&
        jobDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [jobs, selectedDate, applyFilters]);

  const filteredMachines = useMemo(() => {
    let m = machines;
    if (filters.techniques.length) m = m.filter((x) => filters.techniques.includes(x.technique_id));
    if (filters.machines.length) m = m.filter((x) => filters.machines.includes(x.id));
    return m;
  }, [machines, filters.techniques, filters.machines]);

  const jobsByMachine = useMemo(() => {
    const grouped: Record<string, DbJob[]> = {};
    dayJobs.forEach((job) => {
      if (!job.machine_id) return;
      if (!grouped[job.machine_id]) grouped[job.machine_id] = [];
      grouped[job.machine_id].push(job);
    });
    return grouped;
  }, [dayJobs]);

  const utilizationByMachine = useMachineUtilization(dayJobs, {
    startHour: START_HOUR,
    endHour: END_HOUR,
  });

  const dayKey = format(selectedDate, 'yyyy-MM-dd');
  const dayConflicts = useMemo(
    () => conflicts.filter((c) => format(c.date, 'yyyy-MM-dd') === dayKey),
    [conflicts, dayKey]
  );
  const conflictJobIds = useMemo(() => {
    const set = new Set<string>();
    dayConflicts.forEach((c) => c.jobs.forEach((j) => set.add(j.id)));
    return set;
  }, [dayConflicts]);

  const currentTimePosition = useMemo(() => {
    if (!isToday(selectedDate)) return null;
    const now = new Date();
    const minutes = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
    const totalMinutes = (END_HOUR - START_HOUR) * 60;
    if (minutes < 0 || minutes > totalMinutes) return null;
    return `${(minutes / totalMinutes) * 100}%`;
  }, [selectedDate]);

  const handleJobClick = (job: DbJob) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleExportPdf = async () => {
    if (!printAreaRef.current) return;
    try {
      toast.loading('Gerando PDF…', { id: 'pdf' });
      await exportElementToPdf(
        printAreaRef.current,
        `agenda-${format(selectedDate, 'yyyy-MM-dd')}.pdf`
      );
      toast.success('PDF gerado com sucesso', { id: 'pdf' });
    } catch {
      toast.error('Falha ao gerar PDF', { id: 'pdf' });
    }
  };

  const handleExportICal = () => {
    downloadICalFeed(
      dayJobs,
      machines,
      `agenda-${format(selectedDate, 'yyyy-MM-dd')}.ics`,
      `Fast Gravações — ${format(selectedDate, 'dd MMM yyyy', { locale: ptBR })}`
    );
    toast.success('Calendário iCal exportado');
  };

  const handleOnboardingClose = () => {
    setOnboardingOpen(false);
    completeOnboarding();
  };

  return (
    <MainLayout>
      <JobDetailsModal job={selectedJob} open={isModalOpen} onOpenChange={setIsModalOpen} />
      <CalendarOnboarding open={onboardingOpen} onClose={handleOnboardingClose} />

      <div ref={printAreaRef} className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in-up calendar-print-area">
        <Breadcrumbs />

        <PlanningEfficiencyDashboard />
        
        {dayConflicts.length > 0 && (
          <ConflictResolutionPanel 
            conflicts={dayConflicts} 
            onResolved={() => refetchJobs()} 
          />
        )}

        <CalendarHeader
          title="Calendário Diário"
          subtitle="Visualização completa da agenda por máquina"
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onPrev={() => setSelectedDate(subDays(selectedDate, 1))}
          onNext={() => setSelectedDate(addDays(selectedDate, 1))}
          onToday={() => setSelectedDate(new Date())}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={!isMobile}
          conflictCount={dayConflicts.length}
          jobCount={dayJobs.length}
          filtersSlot={
            <CalendarFilters
              filters={filters}
              jobs={jobs}
              techniques={techniques}
              machines={machines}
              activeCount={activeCount}
              onToggle={toggleArrayValue}
              onUpdate={updateFilter}
              onClear={clearFilters}
            />
          }
        />

        <div className="hidden sm:flex print:hidden">
          <CalendarToolbar
            zoom={prefs.zoom}
            onZoomChange={setZoom}
            groupBy={prefs.groupBy}
            onGroupByChange={setGroupBy}
            overlays={prefs.overlays}
            onToggleOverlay={toggleOverlay}
            onExportPdf={handleExportPdf}
            onExportICal={handleExportICal}
            onShowOnboarding={() => setOnboardingOpen(true)}
            extraSlot={
              <OptimizationAssistant 
                utilizationByMachine={utilizationByMachine} 
                machineCount={filteredMachines.length}
              />
            }
          />
        </div>

        {dayConflicts.length > 0 && (
          <ConflictResolutionPanel conflicts={dayConflicts} onResolved={() => refetchJobs()} />
        )}

        {dayJobs.length === 0 ? (
          <Card className="bg-card border border-border/40 rounded-xl">
            <CardContent>
              <CalendarEmptyState hasFilters={activeCount > 0} onClearFilters={clearFilters} />
            </CardContent>
          </Card>
        ) : effectiveViewMode === 'agenda' ? (
          <Card className="bg-card border border-border/40 rounded-xl">
            <CardHeader className="border-b border-border/40 pb-3 px-3 sm:px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-lg font-display gradient-text flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span>{format(selectedDate, 'EEEE, dd MMM', { locale: ptBR })}</span>
                </CardTitle>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {dayJobs.length} job{dayJobs.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <AgendaView
                jobs={dayJobs}
                machines={filteredMachines}
                techniques={techniques}
                selectedDate={selectedDate}
                onJobClick={handleJobClick}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border border-border/40 rounded-xl overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-3 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-lg font-display gradient-text flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="hidden sm:inline">
                  {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
                <span className="sm:hidden">
                  {format(selectedDate, 'EEEE, dd MMM', { locale: ptBR })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DensityMinimap jobs={dayJobs} startHour={START_HOUR} endHour={END_HOUR} />
              <div aria-live="polite" className="sr-only">
                {dayJobs.length} agendamentos · {dayConflicts.length} conflitos
              </div>
              <CalendarTimeline
                machines={filteredMachines}
                techniques={techniques}
                jobsByMachine={jobsByMachine}
                conflictJobIds={conflictJobIds}
                startHour={START_HOUR}
                endHour={END_HOUR}
                currentTimePosition={currentTimePosition}
                getTechniqueById={getTechniqueById as (id: string) => ReturnType<typeof getTechniqueById>}
                onJobClick={handleJobClick}
                zoom={prefs.zoom}
                groupBy={prefs.groupBy}
                overlays={prefs.overlays}
                utilizationByMachine={utilizationByMachine}
              />
            </CardContent>
          </Card>
        )}

        <CalendarLegend />
      </div>

      <MobileFAB />
    </MainLayout>
  );
}
