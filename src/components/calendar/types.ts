import { JobStatus } from '@/types/scheduling';

export const statusColors: Record<JobStatus, string> = {
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

export const statusColorsSolid: Record<JobStatus, string> = {
  queue: 'bg-status-queue/80 border-status-queue',
  ready: 'bg-status-ready/80 border-status-ready',
  scheduled: 'bg-status-scheduled/80 border-status-scheduled',
  production: 'bg-status-production/80 border-status-production',
  finished: 'bg-status-finished/80 border-status-finished',
  paused: 'bg-status-paused/80 border-status-paused',
  cancelled: 'bg-status-cancelled/80 border-status-cancelled',
  delayed: 'bg-status-delayed/80 border-status-delayed',
  rework: 'bg-status-rework/80 border-status-rework',
};

export const statusLabels: Record<JobStatus, string> = {
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

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

export interface CalendarFilterState {
  techniques: string[];
  machines: string[];
  statuses: string[];
  priorities: string[];
  clients: string[];
  onlyDelayed: boolean;
  onlyInProduction: boolean;
  searchQuery: string;
}

export const EMPTY_FILTERS: CalendarFilterState = {
  techniques: [],
  machines: [],
  statuses: [],
  priorities: [],
  clients: [],
  onlyDelayed: false,
  onlyInProduction: false,
  searchQuery: '',
};
