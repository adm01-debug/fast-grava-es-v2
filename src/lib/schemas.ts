/**
 * Centralized Zod validation schemas
 * Used across forms and API validation
 */

import { z } from 'zod';

// Common field validators
export const emailSchema = z.string().email('Email inválido').max(255, 'Email muito longo');
export const phoneSchema = z.string().optional().refine(
  (val) => !val || /^[\d\s\-+()]{10,20}$/.test(val),
  'Telefone inválido'
);
export const passwordSchema = z.string().min(6, 'Mínimo 6 caracteres').max(100, 'Senha muito longa');
export const uuidSchema = z.string().uuid('ID inválido');
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)');
export const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida (HH:MM)');

// User schemas
export const userSchema = z.object({
  email: emailSchema,
  full_name: z.string().min(2, 'Nome muito curto').max(100, 'Nome muito longo'),
  phone: phoneSchema,
  role: z.enum(['admin', 'coordinator', 'operator']),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  full_name: z.string().min(2, 'Nome muito curto').max(100, 'Nome muito longo'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

// Job schemas
export const jobSchema = z.object({
  order_number: z.string().min(1, 'Número do pedido obrigatório').max(50, 'Número muito longo'),
  client: z.string().min(1, 'Cliente obrigatório').max(200, 'Nome muito longo'),
  product: z.string().min(1, 'Produto obrigatório').max(200, 'Nome muito longo'),
  quantity: z.number().int().positive('Quantidade deve ser positiva').max(999999, 'Quantidade muito alta'),
  technique_id: uuidSchema,
  machine_id: uuidSchema.optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  scheduled_date: dateSchema.optional().nullable(),
  start_time: timeSchema.optional().nullable(),
  end_time: timeSchema.optional().nullable(),
  estimated_duration: z.number().positive().optional().default(60),
  gravure_color: z.string().max(50, 'Cor muito longa').optional().nullable(),
  notes: z.string().max(1000, 'Observações muito longas').optional().nullable(),
});

export const jobUpdateSchema = jobSchema.partial();

export const jobStatusSchema = z.object({
  status: z.enum(['queue', 'ready', 'scheduled', 'production', 'paused', 'finished', 'delayed', 'rework', 'cancelled']),
  produced_quantity: z.number().int().nonnegative().optional(),
  lost_pieces: z.number().int().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});

// Operator schemas
export const operatorSchema = z.object({
  full_name: z.string().min(2, 'Nome muito curto').max(100, 'Nome muito longo'),
  email: emailSchema,
  phone: phoneSchema,
  is_active: z.boolean().default(true),
});

export const operatorGoalSchema = z.object({
  operator_id: uuidSchema,
  goal_type: z.enum(['jobs', 'pieces', 'efficiency']),
  target_value: z.number().positive('Meta deve ser positiva'),
  period_start: dateSchema,
  period_end: dateSchema,
});

// Machine schemas
export const machineSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100, 'Nome muito longo'),
  code: z.string().min(1, 'Código obrigatório').max(20, 'Código muito longo'),
  technique_id: uuidSchema,
  is_active: z.boolean().default(true),
});

export const machineGoalSchema = z.object({
  machine_id: uuidSchema,
  goal_type: z.enum(['jobs', 'pieces', 'efficiency', 'utilization']),
  target_value: z.number().positive('Meta deve ser positiva'),
  period_start: dateSchema,
  period_end: dateSchema,
});

// Maintenance schemas
export const maintenanceScheduleSchema = z.object({
  machine_id: uuidSchema,
  maintenance_type_id: z.string().min(1, 'Tipo obrigatório'),
  name: z.string().min(1, 'Nome obrigatório').max(200, 'Nome muito longo'),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
  interval_days: z.number().int().positive('Intervalo deve ser positivo'),
  estimated_duration_minutes: z.number().int().positive('Duração deve ser positiva'),
  next_due_at: z.string().datetime('Data inválida'),
  is_active: z.boolean().default(true),
});

export const maintenanceRecordSchema = z.object({
  schedule_id: uuidSchema,
  machine_id: uuidSchema,
  maintenance_type_id: z.string().min(1),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  notes: z.string().max(2000, 'Observações muito longas').optional(),
  downtime_minutes: z.number().int().nonnegative().optional(),
  total_cost: z.number().nonnegative().optional(),
});

// Quality checklist schemas
export const qualityChecklistItemSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória').max(500),
  is_required: z.boolean().default(true),
  item_type: z.enum(['check', 'measurement', 'photo', 'text']),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  unit: z.string().max(20).optional(),
});

export const qualityChecklistSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100),
  description: z.string().max(500).optional(),
  technique_id: uuidSchema.optional(),
  items: z.array(qualityChecklistItemSchema).min(1, 'Pelo menos 1 item obrigatório'),
  is_active: z.boolean().default(true),
});

export const qualityInspectionSchema = z.object({
  job_id: uuidSchema,
  checklist_id: uuidSchema,
  inspector_id: uuidSchema.optional(),
  inspector_name: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'partial']),
  notes: z.string().max(2000).optional(),
  items: z.array(z.object({
    item_id: uuidSchema,
    is_checked: z.boolean(),
    value: z.union([z.string(), z.number()]).optional(),
    photo_url: z.string().url().optional(),
    notes: z.string().max(500).optional(),
  })),
});

// Shift handover schemas
export const shiftHandoverSchema = z.object({
  shift_type: z.enum(['morning', 'afternoon', 'night']),
  machine_id: uuidSchema.optional(),
  general_notes: z.string().max(2000, 'Observações muito longas').optional(),
  incoming_operator_id: uuidSchema.optional(),
});

export const shiftOccurrenceSchema = z.object({
  handover_id: uuidSchema,
  title: z.string().min(1, 'Título obrigatório').max(200),
  description: z.string().min(1, 'Descrição obrigatória').max(2000),
  occurrence_type: z.enum(['issue', 'alert', 'info', 'maintenance']),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  machine_id: uuidSchema.optional(),
  job_id: uuidSchema.optional(),
});

// Traceability schemas
export const productionLotSchema = z.object({
  lot_number: z.string().min(1, 'Número do lote obrigatório').max(50),
  product_name: z.string().min(1, 'Produto obrigatório').max(200),
  job_id: uuidSchema.optional(),
  quantity: z.number().int().positive('Quantidade deve ser positiva'),
  production_date: dateSchema,
  expiration_date: dateSchema.optional(),
  notes: z.string().max(1000).optional(),
});

export const lotMovementSchema = z.object({
  lot_id: uuidSchema,
  movement_type: z.enum(['production', 'transfer', 'consumption', 'adjustment', 'scrap']),
  quantity: z.number().int().positive('Quantidade deve ser positiva'),
  from_location: z.string().max(100).optional(),
  to_location: z.string().max(100).optional(),
  reason: z.string().max(500).optional(),
});

// Report schemas
export const reportFilterSchema = z.object({
  start_date: dateSchema,
  end_date: dateSchema,
  technique_ids: z.array(uuidSchema).optional(),
  machine_ids: z.array(uuidSchema).optional(),
  operator_ids: z.array(uuidSchema).optional(),
  status: z.array(z.string()).optional(),
});

export const emailReportSchema = z.object({
  report_type: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  recipients: z.array(emailSchema).min(1, 'Pelo menos 1 destinatário'),
  filters: reportFilterSchema,
  include_charts: z.boolean().default(true),
  include_details: z.boolean().default(true),
});

// ERP integration schemas
export const erpSyncConfigSchema = z.object({
  enabled: z.boolean(),
  sync_interval_minutes: z.number().int().min(5).max(1440),
  sync_direction: z.enum(['pull', 'push', 'bidirectional']),
  entity_types: z.array(z.enum(['jobs', 'machines', 'operators', 'lots'])),
  last_sync_at: z.string().datetime().optional(),
});

// Audit schemas
export const auditLogSchema = z.object({
  entity_type: z.string().min(1),
  entity_id: uuidSchema,
  action: z.enum(['create', 'update', 'delete', 'status_change']),
  old_values: z.record(z.any()).optional(),
  new_values: z.record(z.any()).optional(),
  performed_by: uuidSchema,
  performed_by_name: z.string().optional(),
  reason: z.string().max(500).optional(),
});

// Contact/Feedback schemas
export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatório').max(100, 'Nome muito longo'),
  email: emailSchema,
  subject: z.string().trim().min(1, 'Assunto obrigatório').max(200, 'Assunto muito longo'),
  message: z.string().trim().min(10, 'Mensagem muito curta').max(2000, 'Mensagem muito longa'),
});

// Settings schemas
export const notificationSettingsSchema = z.object({
  email_enabled: z.boolean(),
  push_enabled: z.boolean(),
  sound_enabled: z.boolean(),
  delayed_jobs: z.boolean(),
  maintenance_alerts: z.boolean(),
  goal_achievements: z.boolean(),
  shift_handovers: z.boolean(),
  ml_predictions: z.boolean(),
});

export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.enum(['pt-BR', 'en-US', 'es-ES']),
  dashboard_layout: z.record(z.any()).optional(),
  quick_favorites: z.array(z.string()).optional(),
  notifications: notificationSettingsSchema,
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type Login = z.infer<typeof loginSchema>;
export type Signup = z.infer<typeof signupSchema>;
export type Job = z.infer<typeof jobSchema>;
export type JobUpdate = z.infer<typeof jobUpdateSchema>;
export type JobStatus = z.infer<typeof jobStatusSchema>;
export type Operator = z.infer<typeof operatorSchema>;
export type OperatorGoal = z.infer<typeof operatorGoalSchema>;
export type Machine = z.infer<typeof machineSchema>;
export type MachineGoal = z.infer<typeof machineGoalSchema>;
export type MaintenanceSchedule = z.infer<typeof maintenanceScheduleSchema>;
export type MaintenanceRecord = z.infer<typeof maintenanceRecordSchema>;
export type QualityChecklist = z.infer<typeof qualityChecklistSchema>;
export type QualityInspection = z.infer<typeof qualityInspectionSchema>;
export type ShiftHandover = z.infer<typeof shiftHandoverSchema>;
export type ShiftOccurrence = z.infer<typeof shiftOccurrenceSchema>;
export type ProductionLot = z.infer<typeof productionLotSchema>;
export type LotMovement = z.infer<typeof lotMovementSchema>;
export type ReportFilter = z.infer<typeof reportFilterSchema>;
export type EmailReport = z.infer<typeof emailReportSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
