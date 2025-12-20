import { z } from 'zod';

export const inspectionStatusSchema = z.enum(['pending', 'approved', 'rejected', 'rework']);
export const defectSeveritySchema = z.enum(['minor', 'major', 'critical']);

export const defectSchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1).max(100),
  severity: defectSeveritySchema,
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  image_url: z.string().url().optional(),
});

export const qualityInspectionSchema = z.object({
  id: z.string().uuid(),
  job_id: z.string().uuid(),
  operator_id: z.string().uuid(),
  inspector_id: z.string().uuid().optional(),
  status: inspectionStatusSchema,
  defects_count: z.number().int().min(0).default(0),
  defects: z.array(defectSchema).optional(),
  notes: z.string().max(1000).optional(),
  passed_criteria: z.array(z.string()).optional(),
  failed_criteria: z.array(z.string()).optional(),
  inspected_at: z.string().datetime(),
  created_at: z.string().datetime(),
});

export const createInspectionSchema = qualityInspectionSchema.omit({ id: true, created_at: true });
export const updateInspectionSchema = qualityInspectionSchema.partial().omit({ id: true, created_at: true });

export const qualityMetricsSchema = z.object({
  approval_rate: z.number().min(0).max(100),
  defect_rate: z.number().min(0).max(100),
  rework_rate: z.number().min(0).max(100),
  first_pass_yield: z.number().min(0).max(100),
  total_inspections: z.number().int().min(0),
  total_defects: z.number().int().min(0),
});

export type InspectionStatus = z.infer<typeof inspectionStatusSchema>;
export type DefectSeverity = z.infer<typeof defectSeveritySchema>;
export type Defect = z.infer<typeof defectSchema>;
export type QualityInspection = z.infer<typeof qualityInspectionSchema>;
export type CreateInspection = z.infer<typeof createInspectionSchema>;
export type UpdateInspection = z.infer<typeof updateInspectionSchema>;
export type QualityMetrics = z.infer<typeof qualityMetricsSchema>;
