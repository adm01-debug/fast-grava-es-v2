import { z } from 'zod';

export const lotSchema = z.object({
  id: z.string().uuid(),
  lot_number: z.string().min(1, 'Número do lote é obrigatório'),
  job_id: z.string().uuid('Job é obrigatório'),
  quantity: z.number().int().positive('Quantidade deve ser positiva'),
  status: z.enum(['in_production', 'completed', 'quarantine', 'approved', 'rejected']).default('in_production'),
  notes: z.string().nullable().optional(),
});

export const lotFormSchema = lotSchema.omit({ id: true, status: true });

export type LotFormData = z.infer<typeof lotFormSchema>;
