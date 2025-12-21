export interface CalendarEvent { id: string; title: string; start: string; end: string; type: 'job' | 'maintenance' | 'meeting'; machineId?: string; }
export interface CalendarView { type: 'daily' | 'weekly' | 'monthly'; date: string; }
