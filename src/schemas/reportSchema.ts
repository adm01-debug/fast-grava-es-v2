import { z } from 'zod';

export const reportTypeSchema = z.enum(['productivity', 'quality', 'maintenance', 'energy', 'financial', 'custom']);
export const reportPeriodSchema = z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']);
export const reportFormatSchema = z.enum(['pdf', 'excel', 'csv', 'json']);

export const reportFilterSchema = z.object({
  machines: z.array(z.string().uuid()).optional(),
  operators: z.array(z.string().uuid()).optional(),
  techniques: z.array(z.string().uuid()).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  custom_filters: z.record(z.unknown()).optional(),
});

export const reportSchema = z.object({
  id: z.string().uuid(),
  type: reportTypeSchema,
  period: reportPeriodSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  filters: reportFilterSchema.optional(),
  data: z.record(z.unknown()),
  generated_by: z.string().uuid(),
  generated_at: z.string().datetime(),
  file_url: z.string().url().optional(),
  format: reportFormatSchema.optional(),
  created_at: z.string().datetime(),
});

export const createReportSchema = z.object({
  type: reportTypeSchema,
  period: reportPeriodSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  filters: reportFilterSchema.optional(),
  format: reportFormatSchema.optional(),
});

export const scheduledReportSchema = z.object({
  id: z.string().uuid(),
  report_type: reportTypeSchema,
  schedule: z.enum(['daily', 'weekly', 'monthly']),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  recipients: z.array(z.string().email()),
  filters: reportFilterSchema.optional(),
  format: reportFormatSchema.default('pdf'),
  enabled: z.boolean().default(true),
  last_run: z.string().datetime().nullable().optional(),
  next_run: z.string().datetime().optional(),
  created_at: z.string().datetime(),
});

export type ReportType = z.infer<typeof reportTypeSchema>;
export type ReportPeriod = z.infer<typeof reportPeriodSchema>;
export type ReportFormat = z.infer<typeof reportFormatSchema>;
export type ReportFilter = z.infer<typeof reportFilterSchema>;
export type Report = z.infer<typeof reportSchema>;
export type CreateReport = z.infer<typeof createReportSchema>;
export type ScheduledReport = z.infer<typeof scheduledReportSchema>;
