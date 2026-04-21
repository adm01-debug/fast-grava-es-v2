import { useMemo, useState, Fragment } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { DbJob, DbMachine, DbTechnique } from '@/hooks/useJobs';
import { JobBlock } from './JobBlock';
import { CalendarGroupBy, CalendarOverlays, CalendarZoomLevel, getOccupancyColor } from './types';

interface CalendarTimelineProps {
  machines: DbMachine[];
  techniques: DbTechnique[];
  jobsByMachine: Record<string, DbJob[]>;
  conflictJobIds: Set<string>;
  startHour: number;
  endHour: number;
  currentTimePosition: string | null;
  getTechniqueById: (id: string) => DbTechnique | undefined;
  onJobClick: (job: DbJob) => void;
  onSlotClick?: (machineId: string, hour: number, minute: number) => void;
  zoom?: CalendarZoomLevel;
  groupBy?: CalendarGroupBy;
  overlays?: CalendarOverlays;
  utilizationByMachine?: Record<string, number>;
}

export function CalendarTimeline({
  machines,
  techniques,
  jobsByMachine,
  conflictJobIds,
  startHour,
  endHour,
  currentTimePosition,
  getTechniqueById,
  onJobClick,
  onSlotClick,
  zoom = 60,
  groupBy = 'machine',
  overlays = { showHeatmap: false, showActualVsPlanned: false },
  utilizationByMachine = {},
}: CalendarTimelineProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // E11 — zoom recalculates header tick interval
  const tickIntervalMin = zoom;
  const totalMinutes = (endHour - startHour) * 60;
  const ticks = useMemo(() => {
    const arr: { minute: number; label: string }[] = [];
    for (let m = 0; m <= totalMinutes; m += tickIntervalMin) {
      const totalH = startHour + Math.floor(m / 60);
      const min = m % 60;
      arr.push({
        minute: m,
        label: `${totalH.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
      });
    }
    if (arr[arr.length - 1].minute !== totalMinutes) {
      arr.push({ minute: totalMinutes, label: `${endHour.toString().padStart(2, '0')}:00` });
    }
    return arr;
  }, [tickIntervalMin, totalMinutes, startHour, endHour]);

  const getPosition = (start: string | null, end: string | null) => {
    if (!start || !end) return { left: '0%', width: '5%' };
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMin = (sh - startHour) * 60 + sm;
    const endMin = (eh - startHour) * 60 + em;
    const left = (startMin / totalMinutes) * 100;
    const width = ((endMin - startMin) / totalMinutes) * 100;
    return { left: `${left}%`, width: `${Math.max(width, 3)}%` };
  };

  const getJobPosition = (job: DbJob) => getPosition(job.start_time, job.end_time);

  const getActualPosition = (job: DbJob) => {
    if (!job.actual_start_time) return null;
    const start = new Date(job.actual_start_time);
    const end = job.actual_end_time ? new Date(job.actual_end_time) : new Date();
    const startStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
    const endStr = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
    return getPosition(startStr, endStr);
  };

  // E8 — Group machines by technique
  const groupedMachines = useMemo(() => {
    if (groupBy !== 'technique') return null;
    const map = new Map<string, { technique: DbTechnique; machines: DbMachine[] }>();
    machines.forEach((m) => {
      const tech = techniques.find((t) => t.id === m.technique_id);
      if (!tech) return;
      if (!map.has(tech.id)) map.set(tech.id, { technique: tech, machines: [] });
      map.get(tech.id)!.machines.push(m);
    });
    return Array.from(map.values()).sort((a, b) => a.technique.name.localeCompare(b.technique.name));
  }, [machines, techniques, groupBy]);

  const handleSlotClick = (e: React.MouseEvent<HTMLDivElement>, machineId: string) => {
    if (!onSlotClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const min = Math.round((ratio * totalMinutes) / tickIntervalMin) * tickIntervalMin;
    const hour = startHour + Math.floor(min / 60);
    const minute = min % 60;
    onSlotClick(machineId, hour, minute);
  };

  const renderRow = (machine: DbMachine, index: number) => {
    const machineJobs = jobsByMachine[machine.id] || [];
    const technique = getTechniqueById(machine.technique_id);
    const utilization = utilizationByMachine[machine.id] || 0;

    return (
      <div
        key={machine.id}
        className={cn(
          'flex border-b border-border/20 hover:bg-muted/5 transition-colors calendar-row',
          index % 2 === 0 && 'bg-muted/3'
        )}
      >
        <div className="w-28 shrink-0 p-3 border-r border-border/40 flex items-center gap-2">
          <div
            className="w-2 h-8 rounded-full shrink-0"
            style={{ backgroundColor: technique?.color || 'hsl(var(--muted))' }}
            aria-hidden
          />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">{machine.code}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[80px]">
              {technique?.short_name}
            </div>
          </div>
          {overlays.showHeatmap && utilization > 0 && (
            <div className="ml-auto text-[10px] font-mono text-muted-foreground">
              {Math.round(utilization * 100)}%
            </div>
          )}
        </div>

        <div
          className="flex-1 relative h-16 cursor-pointer"
          style={overlays.showHeatmap ? { background: getOccupancyColor(utilization) } : undefined}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button')) return;
            handleSlotClick(e, machine.id);
          }}
        >
          <div className="absolute inset-0 flex pointer-events-none">
            {ticks.slice(0, -1).map((t) => (
              <div
                key={t.minute}
                className="flex-1 border-r border-border/10 last:border-r-0"
              />
            ))}
          </div>

          {currentTimePosition && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-destructive z-20 pointer-events-none"
              style={{ left: currentTimePosition }}
              aria-hidden
            >
              <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-destructive rounded-full" />
            </div>
          )}

          {machineJobs.map((job) => {
            const actualPos = overlays.showActualVsPlanned ? getActualPosition(job) : null;
            return (
              <Fragment key={job.id}>
                <JobBlock
                  job={job}
                  position={getJobPosition(job)}
                  hasConflict={conflictJobIds.has(job.id)}
                  onClick={onJobClick}
                  ghost={!!actualPos}
                />
                {actualPos && (
                  <div
                    className="absolute bottom-1 h-1.5 rounded-full bg-status-production border border-status-production/60"
                    style={actualPos}
                    title="Realizado"
                  />
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const toggleGroup = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ScrollArea className="w-full">
      <div className="min-w-[1200px]">
        <div className="flex border-b border-border/40 bg-muted/5 sticky top-0 z-10">
          <div className="w-28 shrink-0 p-3 border-r border-border/40">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              {groupBy === 'technique' ? 'Técnica' : 'Máquina'}
            </span>
          </div>
          <div className="flex-1 flex">
            {ticks.slice(0, -1).map((t) => (
              <div
                key={t.minute}
                className="flex-1 text-center py-3 border-r border-border/20 last:border-r-0"
              >
                <span className="text-xs font-medium text-muted-foreground">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {groupBy === 'technique' && groupedMachines ? (
          groupedMachines.map((group) => {
            const isCollapsed = collapsed.has(group.technique.id);
            const totalJobs = group.machines.reduce(
              (sum, m) => sum + (jobsByMachine[m.id]?.length || 0),
              0
            );
            return (
              <Fragment key={group.technique.id}>
                <button
                  onClick={() => toggleGroup(group.technique.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 border-b border-border/30 hover:bg-muted/20 transition-colors text-left"
                  aria-expanded={!isCollapsed}
                >
                  {isCollapsed ? (
                    <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div
                    className="w-2 h-4 rounded-full"
                    style={{ backgroundColor: group.technique.color }}
                  />
                  <span className="text-sm font-semibold">{group.technique.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {group.machines.length} máquina{group.machines.length !== 1 ? 's' : ''} · {totalJobs} job{totalJobs !== 1 ? 's' : ''}
                  </span>
                </button>
                {!isCollapsed && group.machines.map((m, i) => renderRow(m, i))}
              </Fragment>
            );
          })
        ) : (
          machines.map((m, i) => renderRow(m, i))
        )}

        {machines.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            Nenhuma máquina encontrada para os filtros selecionados.
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
