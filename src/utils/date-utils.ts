import { 
  format, 
  formatDistanceToNow, 
  formatDistance,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isToday,
  isYesterday,
  isTomorrow,
  isThisWeek,
  isThisMonth,
  isThisYear,
  isBefore,
  isAfter,
  isEqual,
  parseISO,
  isValid,
  getDay,
  getWeek,
  getMonth,
  getYear,
  setHours,
  setMinutes
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Formatar data em português
export function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Data inválida';
  return format(d, formatStr, { locale: ptBR });
}

// Formatar data e hora
export function formatDateTime(date: Date | string): string {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm");
}

// Formatar hora apenas
export function formatTime(date: Date | string): string {
  return formatDate(date, 'HH:mm');
}

// Formatar data relativa (ex: "há 2 horas")
export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Data inválida';
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
}

// Formatar distância entre duas datas
export function formatDateDistance(date1: Date | string, date2: Date | string): string {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return formatDistance(d1, d2, { locale: ptBR });
}

// Formatar data amigável (Hoje, Ontem, etc)
export function formatFriendly(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Data inválida';
  
  if (isToday(d)) return 'Hoje';
  if (isYesterday(d)) return 'Ontem';
  if (isTomorrow(d)) return 'Amanhã';
  if (isThisWeek(d)) return formatDate(d, 'EEEE');
  if (isThisYear(d)) return formatDate(d, "d 'de' MMMM");
  return formatDate(d, "d 'de' MMMM 'de' yyyy");
}

// Formatar duração em formato legível
export function formatDurationFromSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min ${seconds % 60}s`;
  
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours < 24) return `${hours}h ${mins}min`;
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
}

// Formatar período de tempo
export function formatPeriod(start: Date | string, end: Date | string): string {
  const s = typeof start === 'string' ? parseISO(start) : start;
  const e = typeof end === 'string' ? parseISO(end) : end;
  
  if (isEqual(startOfDay(s), startOfDay(e))) {
    return `${formatDate(s, 'dd/MM/yyyy')} ${formatTime(s)} - ${formatTime(e)}`;
  }
  
  return `${formatDateTime(s)} - ${formatDateTime(e)}`;
}

// Diferenças entre datas
export const dateDiff = {
  days: (date1: Date | string, date2: Date | string) => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInDays(d2, d1);
  },
  hours: (date1: Date | string, date2: Date | string) => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInHours(d2, d1);
  },
  minutes: (date1: Date | string, date2: Date | string) => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInMinutes(d2, d1);
  },
  seconds: (date1: Date | string, date2: Date | string) => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInSeconds(d2, d1);
  },
  weeks: (date1: Date | string, date2: Date | string) => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInWeeks(d2, d1);
  },
  months: (date1: Date | string, date2: Date | string) => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInMonths(d2, d1);
  },
  years: (date1: Date | string, date2: Date | string) => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInYears(d2, d1);
  }
};

// Manipulação de datas
export const dateAdd = {
  days: (date: Date | string, amount: number) => addDays(typeof date === 'string' ? parseISO(date) : date, amount),
  weeks: (date: Date | string, amount: number) => addWeeks(typeof date === 'string' ? parseISO(date) : date, amount),
  months: (date: Date | string, amount: number) => addMonths(typeof date === 'string' ? parseISO(date) : date, amount),
  years: (date: Date | string, amount: number) => addYears(typeof date === 'string' ? parseISO(date) : date, amount)
};

export const dateSub = {
  days: (date: Date | string, amount: number) => subDays(typeof date === 'string' ? parseISO(date) : date, amount),
  weeks: (date: Date | string, amount: number) => subWeeks(typeof date === 'string' ? parseISO(date) : date, amount),
  months: (date: Date | string, amount: number) => subMonths(typeof date === 'string' ? parseISO(date) : date, amount),
  years: (date: Date | string, amount: number) => subYears(typeof date === 'string' ? parseISO(date) : date, amount)
};

// Ranges de datas
export const dateRange = {
  today: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) }),
  yesterday: () => ({ 
    start: startOfDay(subDays(new Date(), 1)), 
    end: endOfDay(subDays(new Date(), 1)) 
  }),
  thisWeek: () => ({ 
    start: startOfWeek(new Date(), { locale: ptBR }), 
    end: endOfWeek(new Date(), { locale: ptBR }) 
  }),
  lastWeek: () => ({ 
    start: startOfWeek(subWeeks(new Date(), 1), { locale: ptBR }), 
    end: endOfWeek(subWeeks(new Date(), 1), { locale: ptBR }) 
  }),
  thisMonth: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }),
  lastMonth: () => ({ 
    start: startOfMonth(subMonths(new Date(), 1)), 
    end: endOfMonth(subMonths(new Date(), 1)) 
  }),
  thisYear: () => ({ start: startOfYear(new Date()), end: endOfYear(new Date()) }),
  lastYear: () => ({ 
    start: startOfYear(subYears(new Date(), 1)), 
    end: endOfYear(subYears(new Date(), 1)) 
  }),
  last7Days: () => ({ start: startOfDay(subDays(new Date(), 6)), end: endOfDay(new Date()) }),
  last30Days: () => ({ start: startOfDay(subDays(new Date(), 29)), end: endOfDay(new Date()) }),
  last90Days: () => ({ start: startOfDay(subDays(new Date(), 89)), end: endOfDay(new Date()) }),
  custom: (start: Date, end: Date) => ({ start: startOfDay(start), end: endOfDay(end) })
};

// Verificações de data
export const dateCheck = {
  isToday: (date: Date | string) => isToday(typeof date === 'string' ? parseISO(date) : date),
  isYesterday: (date: Date | string) => isYesterday(typeof date === 'string' ? parseISO(date) : date),
  isTomorrow: (date: Date | string) => isTomorrow(typeof date === 'string' ? parseISO(date) : date),
  isThisWeek: (date: Date | string) => isThisWeek(typeof date === 'string' ? parseISO(date) : date),
  isThisMonth: (date: Date | string) => isThisMonth(typeof date === 'string' ? parseISO(date) : date),
  isThisYear: (date: Date | string) => isThisYear(typeof date === 'string' ? parseISO(date) : date),
  isBefore: (date1: Date | string, date2: Date | string) => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return isBefore(d1, d2);
  },
  isAfter: (date1: Date | string, date2: Date | string) => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return isAfter(d1, d2);
  },
  isPast: (date: Date | string) => isBefore(typeof date === 'string' ? parseISO(date) : date, new Date()),
  isFuture: (date: Date | string) => isAfter(typeof date === 'string' ? parseISO(date) : date, new Date()),
  isValid: (date: Date | string) => isValid(typeof date === 'string' ? parseISO(date) : date),
  isWeekend: (date: Date | string) => {
    const day = getDay(typeof date === 'string' ? parseISO(date) : date);
    return day === 0 || day === 6;
  },
  isBusinessDay: (date: Date | string) => {
    const day = getDay(typeof date === 'string' ? parseISO(date) : date);
    return day !== 0 && day !== 6;
  }
};

// Getters de data
export const dateGet = {
  dayOfWeek: (date: Date | string) => getDay(typeof date === 'string' ? parseISO(date) : date),
  weekOfYear: (date: Date | string) => getWeek(typeof date === 'string' ? parseISO(date) : date, { locale: ptBR }),
  month: (date: Date | string) => getMonth(typeof date === 'string' ? parseISO(date) : date),
  year: (date: Date | string) => getYear(typeof date === 'string' ? parseISO(date) : date),
  dayName: (date: Date | string) => formatDate(date, 'EEEE'),
  monthName: (date: Date | string) => formatDate(date, 'MMMM')
};

// Setters de data
export const dateSet = {
  time: (date: Date | string, hours: number, minutes: number = 0) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return setMinutes(setHours(d, hours), minutes);
  }
};

// Calcular idade
export function calculateAge(birthDate: Date | string): number {
  return dateDiff.years(birthDate, new Date());
}

// Gerar lista de datas entre duas datas
export function getDatesBetween(start: Date | string, end: Date | string): Date[] {
  const dates: Date[] = [];
  const s = typeof start === 'string' ? parseISO(start) : start;
  const e = typeof end === 'string' ? parseISO(end) : end;
  
  let current = startOfDay(s);
  while (isBefore(current, e) || isEqual(current, startOfDay(e))) {
    dates.push(current);
    current = addDays(current, 1);
  }
  
  return dates;
}

// Obter próximos dias úteis
export function getNextBusinessDays(count: number, from: Date = new Date()): Date[] {
  const days: Date[] = [];
  let current = startOfDay(from);
  
  while (days.length < count) {
    if (dateCheck.isBusinessDay(current)) {
      days.push(current);
    }
    current = addDays(current, 1);
  }
  
  return days;
}

// Formatar countdown
export function formatCountdown(targetDate: Date | string): string {
  const target = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
  const now = new Date();
  
  if (isBefore(target, now)) return 'Expirado';
  
  const days = differenceInDays(target, now);
  const hours = differenceInHours(target, now) % 24;
  const minutes = differenceInMinutes(target, now) % 60;
  const seconds = differenceInSeconds(target, now) % 60;
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}min`;
  if (minutes > 0) return `${minutes}min ${seconds}s`;
  return `${seconds}s`;
}
