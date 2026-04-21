import { useState, useMemo } from 'react';
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
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { useCalendarFilters } from '@/hooks/useCalendarFilters';
import { useSchedulingConflicts } from '@/hooks/useSchedulingConflicts';
import { DbJob } from '@/hooks/useJobs';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { useDevice } from '@/hooks/use-device';

const START_HOUR = 7;
const END_HOUR = 21;

export default function DailyCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedJob, setSelectedJob] = useState<DbJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'agenda'>('timeline');
  const { isMobile } = useDevice();

  const { jobs, techniques, machines, getTechniqueById } = useSchedulingData();
  const { conflicts } = useSchedulingConflicts();
  const {
    filters,
    updateFilter,
    toggleArrayValue,
    clearFilters,
    activeCount,
    applyFilters,
  } = useCalendarFilters('daily-calendar-filters-v1');

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

  return (
    <MainLayout>
      <JobDetailsModal job={selectedJob} open={isModalOpen} onOpenChange={setIsModalOpen} />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in-up">
        <Breadcrumbs />

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

        {effectiveViewMode === 'agenda' ? (
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-sm sm:text-lg font-display gradient-text flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="hidden sm:inline">
                    {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                  <span className="sm:hidden">
                    {format(selectedDate, 'EEEE, dd MMM', { locale: ptBR })}
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DensityMinimap jobs={dayJobs} startHour={START_HOUR} endHour={END_HOUR} />
              <CalendarTimeline
                machines={filteredMachines}
                jobsByMachine={jobsByMachine}
                conflictJobIds={conflictJobIds}
                startHour={START_HOUR}
                endHour={END_HOUR}
                currentTimePosition={currentTimePosition}
                getTechniqueById={getTechniqueById as (id: string) => ReturnType<typeof getTechniqueById>}
                onJobClick={handleJobClick}
              />
            </CardContent>
          </Card>
        )}

        <CalendarLegend />
      </div>
    </MainLayout>
  );
}
