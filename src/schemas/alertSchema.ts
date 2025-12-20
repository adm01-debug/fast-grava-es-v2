import { z } from 'zod';

export const alertSeveritySchema = z.enum(['critical', 'warning', 'info']);
export const alertTypeSchema = z.enum(['maintenance', 'quality', 'production', 'efficiency', 'system']);
export const alertStatusSchema = z.enum(['active', 'acknowledged', 'resolved', 'dismissed']);

export const alertSchema = z.object({
  id: z.string().uuid(),
  type: alertTypeSchema,
  severity: alertSeveritySchema,
  status: alertStatusSchema,
  title: z.string().min(1).max(200),
  message: z.string().max(1000),
  source: z.string().optional(),
  source_id: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
  read: z.boolean().default(false),
  acknowledged_at: z.string().datetime().nullable().optional(),
  acknowledged_by: z.string().uuid().nullable().optional(),
  resolved_at: z.string().datetime().nullable().optional(),
  resolved_by: z.string().uuid().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
});

export const createAlertSchema = alertSchema.omit({ id: true, created_at: true, updated_at: true });
export const updateAlertSchema = alertSchema.partial().omit({ id: true, created_at: true });

export type AlertSeverity = z.infer<typeof alertSeveritySchema>;
export type AlertType = z.infer<typeof alertTypeSchema>;
export type AlertStatus = z.infer<typeof alertStatusSchema>;
export type Alert = z.infer<typeof alertSchema>;
export type CreateAlert = z.infer<typeof createAlertSchema>;
export type UpdateAlert = z.infer<typeof updateAlertSchema>;
