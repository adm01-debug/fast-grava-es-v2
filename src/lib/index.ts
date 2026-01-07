// Barrel exports for lib utilities

export * from '@/lib/utils';
export * from '@/lib/toast-utils';
export * from '@/lib/export-utils';

// Date utils (renamed to avoid conflicts)
export {
  formatDate,
  formatDateTime,
  formatTime,
  formatRelative,
  formatSmart,
  formatDuration,
  formatDurationHours,
  getTimeAgo,
  getDateRange,
  isInRange as isDateInRange,
  isOverdue,
  isUpcoming,
  getWeekdayName,
  getMonthName,
  addBusinessDays,
  parseBRDate,
  getCalendarDays,
} from '@/lib/date-utils';

// Number utils (renamed to avoid conflicts)
export {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatPercentage,
  formatCompact,
  formatBytes,
  formatOrdinal,
  formatPhone,
  formatCPF,
  formatCNPJ,
  formatCEP,
  parseCurrency,
  clamp,
  roundToNearest,
  percentOf,
  percentChange,
  formatWithSign,
  formatRange,
  isInRange as isNumberInRange,
  sum,
  average,
  median,
} from '@/lib/number-utils';
