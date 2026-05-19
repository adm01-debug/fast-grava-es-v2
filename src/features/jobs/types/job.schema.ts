import { z } from 'zod';

export const jobSchema = z.object({
  id: z.string().uuid(),
  order_number: z.string().min(1, 'Número do pedido é obrigatório'),
  client: z.string().min(1, 'Cliente é obrigatório'),
  product: z.string().min(1, 'Produto é obrigatório'),
  quantity: z.number().int().positive('Quantidade deve ser positiva'),
  technique_id: z.string().uuid('Técnica é obrigatória'),
  machine_id: z.string().uuid().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold']).default('pending'),
  estimated_duration: z.number().positive().default(60),
  scheduled_date: z.string().nullable().optional(),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  gravure_color: z.string().nullable().optional(),
});

export const jobFormSchema = jobSchema.omit({ id: true, status: true }).extend({
  quantity: z.coerce.number().int().positive('Quantidade deve ser positiva'),
  estimated_duration: z.coerce.number().positive('Duração estimada deve ser positiva').default(60),
});

export type JobFormData = z.infer<typeof jobFormSchema>;
