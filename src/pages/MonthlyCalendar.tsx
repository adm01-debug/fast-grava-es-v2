import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarRange } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { CalendarLegend } from '@/components/calendar/CalendarLegend';
import { CalendarEmptyState } from '@/components/calendar/CalendarEmptyState';
import { MobileFAB } from '@/components/calendar/MobileFAB';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { useCalendarFilters } from '@/hooks/useCalendarFilters';
import { useCalendarHotkeys } from '@/hooks/useCalendarHotkeys';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function MonthlyCalendar() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { jobs, techniques, machines } = useSchedulingData();
  const {
    filters,
    updateFilter,
    toggleArrayValue,
    clearFilters,
    activeCount,
    applyFilters,
  } = useCalendarFilters('monthly-calendar-filters-v1');

  useCalendarHotkeys({ selectedDate, onDateChange: setSelectedDate, scope: 'monthly' });

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(() => {
    const arr: Date[] = [];
    let d = gridStart;
    while (d <= gridEnd) {
      arr.push(d);
      d = addDays(d, 1);
    }
    return arr;
  }, [gridStart, gridEnd]);

  const filteredJobs = useMemo(() => applyFilters(jobs), [jobs, applyFilters]);

  const jobsByDay = useMemo(() => {
    const acc: Record<string, number> = {};
    filteredJobs.forEach((job) => {
      if (!job.scheduled_date) return;
      const k = format(new Date(job.scheduled_date), 'yyyy-MM-dd');
      acc[k] = (acc[k] || 0) + 1;
    });
    return acc;
  }, [filteredJobs]);

  const maxJobsInDay = useMemo(
    () => Math.max(1, ...Object.values(jobsByDay)),
    [jobsByDay]
  );

  const monthJobCount = useMemo(
    () =>
      filteredJobs.filter((j) => {
        if (!j.scheduled_date) return false;
        const d = new Date(j.scheduled_date);
        return d >= monthStart && d <= monthEnd;
      }).length,
    [filteredJobs, monthStart, monthEnd]
  );

  const handleDayClick = (day: Date) => {
    navigate(`/calendar/daily?date=${format(day, 'yyyy-MM-dd')}`);
  };

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in-up calendar-print-area">
        <Breadcrumbs />

        <CalendarHeader
          title="Calendário Mensal"
          subtitle="Visão panorâmica do mês com mapa de carga"
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onPrev={() => setSelectedDate(subMonths(selectedDate, 1))}
          onNext={() => setSelectedDate(addMonths(selectedDate, 1))}
          onToday={() => setSelectedDate(new Date())}
          conflictCount={0}
          jobCount={monthJobCount}
          rangeLabel={format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
          todayLabel="Este Mês"
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

        <Card className="bg-card border border-border/40 rounded-xl overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-lg font-display gradient-text flex items-center gap-2">
                <CalendarRange className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
              <Badge variant="outline" className="border-primary/30 text-primary">
                {monthJobCount} agendamento{monthJobCount !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            {monthJobCount === 0 ? (
              <CalendarEmptyState hasFilters={activeCount > 0} onClearFilters={clearFilters} />
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1.5 mb-2">
                  {WEEKDAYS.map((w) => (
                    <div key={w} className="text-center text-xs font-medium text-muted-foreground py-1">
                      {w}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {days.map((day) => {
                    const k = format(day, 'yyyy-MM-dd');
                    const count = jobsByDay[k] || 0;
                    const ratio = count / maxJobsInDay;
                    const inMonth = isSameMonth(day, selectedDate);
                    const today = isToday(day);
                    const selected = isSameDay(day, selectedDate);

                    return (
                      <button
                        key={k}
                        onClick={() => handleDayClick(day)}
                        className={cn(
                          'aspect-square sm:aspect-[4/3] p-1.5 sm:p-2 rounded-lg text-left',
                          'border transition-all duration-200',
                          'hover:scale-[1.03] hover:border-primary/40 hover:shadow-md',
                          'focus:outline-none focus:ring-2 focus:ring-primary/40',
                          'flex flex-col justify-between',
                          inMonth ? 'border-border/40' : 'border-border/10 opacity-40',
                          today && 'border-primary/60 ring-1 ring-primary/40',
                          selected && 'bg-primary/5'
                        )}
                        style={{
                          background:
                            count > 0
                              ? `hsl(var(--primary) / ${0.06 + ratio * 0.28})`
                              : undefined,
                        }}
                        aria-label={`${format(day, "dd 'de' MMMM", { locale: ptBR })}: ${count} agendamento${count !== 1 ? 's' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <span
                            className={cn(
                              'text-xs sm:text-sm font-semibold',
                              today ? 'text-primary' : inMonth ? 'text-foreground' : 'text-muted-foreground'
                            )}
                          >
                            {format(day, 'd')}
                          </span>
                          {today && <span className="w-1.5 h-1.5 rounded-full bg-destructive" />}
                        </div>
                        {count > 0 && (
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg sm:text-2xl font-display font-bold text-primary leading-none">
                              {count}
                            </span>
                            <span className="text-[10px] text-muted-foreground hidden sm:inline">
                              job{count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-end gap-3 mt-4 text-xs text-muted-foreground">
                  <span>Carga:</span>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm" style={{ background: 'hsl(var(--primary) / 0.08)' }} />
                    <span>baixa</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm" style={{ background: 'hsl(var(--primary) / 0.20)' }} />
                    <span>média</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm" style={{ background: 'hsl(var(--primary) / 0.34)' }} />
                    <span>alta</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <CalendarLegend />
      </div>

      <MobileFAB />
    </MainLayout>
  );
}
