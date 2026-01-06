import { format, formatDistanceToNow, isToday, isYesterday, isTomorrow, isThisWeek, isThisMonth, isThisYear, parseISO, differenceInMinutes, differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths, addDays, addWeeks, addMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isBefore, isAfter, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Format date with locale
export const formatDate = (date: Date | string, formatStr = 'dd/MM/yyyy'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: ptBR });
};

// Format datetime
export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm");
};

// Format time only
export const formatTime = (date: Date | string): string => {
  return formatDate(date, 'HH:mm');
};

// Relative time (e.g., "há 5 minutos")
export const formatRelative = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
};

// Smart date format (Today, Yesterday, or date)
export const formatSmart = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(d)) return `Hoje às ${formatTime(d)}`;
  if (isYesterday(d)) return `Ontem às ${formatTime(d)}`;
  if (isTomorrow(d)) return `Amanhã às ${formatTime(d)}`;
  if (isThisWeek(d)) return format(d, "EEEE 'às' HH:mm", { locale: ptBR });
  if (isThisYear(d)) return formatDate(d, "dd 'de' MMMM 'às' HH:mm");
  return formatDateTime(d);
};

// Duration formatting
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};

// Format duration in hours
export const formatDurationHours = (hours: number): string => {
  if (hours < 1) return `${Math.round(hours * 60)}min`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) return `${days}d`;
  return `${days}d ${remainingHours.toFixed(0)}h`;
};

// Get time ago in specific units
export const getTimeAgo = (date: Date | string): { value: number; unit: string } => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  
  const minutes = differenceInMinutes(now, d);
  if (minutes < 60) return { value: minutes, unit: 'minuto' };
  
  const hours = differenceInHours(now, d);
  if (hours < 24) return { value: hours, unit: 'hora' };
  
  const days = differenceInDays(now, d);
  if (days < 7) return { value: days, unit: 'dia' };
  
  const weeks = differenceInWeeks(now, d);
  if (weeks < 4) return { value: weeks, unit: 'semana' };
  
  const months = differenceInMonths(now, d);
  return { value: months, unit: 'mês' };
};

// Date range helpers
export const getDateRange = (period: 'today' | 'yesterday' | 'week' | 'month' | 'last7' | 'last30') => {
  const now = new Date();
  
  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'yesterday':
      const yesterday = addDays(now, -1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    case 'week':
      return { start: startOfWeek(now, { locale: ptBR }), end: endOfWeek(now, { locale: ptBR }) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'last7':
      return { start: startOfDay(addDays(now, -6)), end: endOfDay(now) };
    case 'last30':
      return { start: startOfDay(addDays(now, -29)), end: endOfDay(now) };
    default:
      return { start: now, end: now };
  }
};

// Check if date is within range
export const isInRange = (date: Date | string, start: Date, end: Date): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isWithinInterval(d, { start, end });
};

// Check if date is overdue
export const isOverdue = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(d, new Date());
};

// Check if date is upcoming (within next N days)
export const isUpcoming = (date: Date | string, days = 7): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const future = addDays(now, days);
  return isAfter(d, now) && isBefore(d, future);
};

// Get weekday name
export const getWeekdayName = (date: Date | string, short = false): string => {
  return formatDate(date, short ? 'EEE' : 'EEEE');
};

// Get month name
export const getMonthName = (date: Date | string, short = false): string => {
  return formatDate(date, short ? 'MMM' : 'MMMM');
};

// Business days calculation (excluding weekends)
export const addBusinessDays = (date: Date, days: number): Date => {
  let result = date;
  let remaining = days;
  
  while (remaining > 0) {
    result = addDays(result, 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remaining--;
    }
  }
  
  return result;
};

// Parse Brazilian date format
export const parseBRDate = (dateStr: string): Date | null => {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const [day, month, year] = parts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  return new Date(year, month - 1, day);
};

// Calendar helpers
export const getCalendarDays = (year: number, month: number): Date[] => {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  const days: Date[] = [];
  
  let current = startOfWeek(start, { locale: ptBR });
  const lastDay = endOfWeek(end, { locale: ptBR });
  
  while (current <= lastDay) {
    days.push(current);
    current = addDays(current, 1);
  }
  
  return days;
};
