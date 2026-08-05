// ============================================================
// Constantes do sistema Fast-Grava-ES
// ============================================================

// Status de jobs (Sincronizado com JobStateMachine)
export const JOB_STATUSES = {
  QUEUE: 'queue',
  SCHEDULED: 'scheduled',
  READY: 'ready',
  PRODUCTION: 'production',
  PAUSED: 'paused',
  DELAYED: 'delayed',
  FINISHED: 'finished',
  CANCELLED: 'cancelled',
  REWORK: 'rework',
  BUFFER: 'buffer',
} as const;

export type JobStatus = (typeof JOB_STATUSES)[keyof typeof JOB_STATUSES];

// Prioridades
export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type Priority = (typeof PRIORITIES)[keyof typeof PRIORITIES];

// Técnicas de gravação
export const TECHNIQUES = {
  SCREEN_PRINTING: 'screen_printing',
  PAD_PRINTING: 'pad_printing',
  HOT_STAMPING: 'hot_stamping',
  DIGITAL_PRINTING: 'digital_printing',
  LASER_ENGRAVING: 'laser_engraving',
} as const;

// Roles de usuário
export const USER_ROLES = {
  OPERATOR: 'operator',
  COORDINATOR: 'coordinator',
  MANAGER: 'manager',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Tipos de manutenção
export const MAINTENANCE_TYPES = {
  PREVENTIVE: 'preventive',
  CORRECTIVE: 'corrective',
  PREDICTIVE: 'predictive',
  AUTONOMOUS: 'autonomous',
} as const;

// OEE Thresholds
export const OEE_THRESHOLDS = {
  WORLD_CLASS: 85,
  GOOD: 70,
  AVERAGE: 55,
  POOR: 0,
} as const;

// SPC Control limits
export const SPC_DEFAULTS = {
  SIGMA_LEVEL: 3,
  MIN_SAMPLE_SIZE: 25,
  SUBGROUP_SIZE: 5,
} as const;

// Paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Timeouts (ms)
export const TIMEOUTS = {
  SESSION_WARNING: 25 * 60 * 1000, // 25 min
  SESSION_EXPIRE: 30 * 60 * 1000,  // 30 min
  DEBOUNCE_DEFAULT: 300,
  THROTTLE_DEFAULT: 1000,
  TOAST_DURATION: 5000,
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_TIME: 'dd/MM/yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
  API: 'yyyy-MM-dd',
} as const;

// Severity levels
export const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
} as const;

export type SeverityLevel = (typeof SEVERITY)[keyof typeof SEVERITY];
