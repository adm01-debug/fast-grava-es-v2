import { useMemo } from 'react';
import { isPast, isToday, isFuture, differenceInDays } from 'date-fns';
import { MaintenanceSchedule, MaintenanceRecord, MaintenanceAlert, TPMStats, SchedulesByStatus } from './types';

interface UseTPMStatsProps {
  schedules: MaintenanceSchedule[];
  records: MaintenanceRecord[];
  alerts: MaintenanceAlert[];
}

export function useTPMStats({ schedules, records, alerts }: UseTPMStatsProps) {
  const stats = useMemo((): TPMStats => ({
    totalScheduled: schedules.length,
    dueToday: schedules.filter(s => isToday(new Date(s.next_due_at))).length,
    overdue: schedules.filter(s => isPast(new Date(s.next_due_at)) && !isToday(new Date(s.next_due_at))).length,
    upcoming7Days: schedules.filter(s => {
      const due = new Date(s.next_due_at);
      return isFuture(due) && differenceInDays(due, new Date()) <= 7;
    }).length,
    completedThisMonth: records.filter(r => {
      const completed = r.completed_at ? new Date(r.completed_at) : null;
      if (!completed) return false;
      const now = new Date();
      return completed.getMonth() === now.getMonth() && completed.getFullYear() === now.getFullYear();
    }).length,
    activeAlerts: alerts.filter(a => !a.is_resolved).length,
    criticalAlerts: alerts.filter(a => a.alert_type === 'critical' && !a.is_resolved).length,
  }), [schedules, records, alerts]);

  const getSchedulesByStatus = useMemo(() => {
    return (): SchedulesByStatus => ({
      overdue: schedules.filter(s => isPast(new Date(s.next_due_at)) && !isToday(new Date(s.next_due_at))),
      dueToday: schedules.filter(s => isToday(new Date(s.next_due_at))),
      upcoming: schedules.filter(s => isFuture(new Date(s.next_due_at))),
    });
  }, [schedules]);

  return {
    stats,
    getSchedulesByStatus,
  };
}
