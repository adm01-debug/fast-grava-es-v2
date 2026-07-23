import { z } from 'zod';

export const jobStatusSchema = z.enum(['queue', 'ready', 'scheduled', 'production', 'finished', 'paused', 'cancelled', 'delayed', 'rework', 'buffer', 'packaging']);
export type JobStatus = z.infer<typeof jobStatusSchema>;

export const jobPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type JobPriority = z.infer<typeof jobPrioritySchema>;

export const jobSchema = z.object({
  id: z.string().uuid(),
  order_number: z.string().min(1, 'Número do pedido é obrigatório').max(50, 'Número do pedido muito longo'),
  client: z.string().min(1, 'Cliente é obrigatório').max(200, 'Nome do cliente muito longo'),
  product: z.string().min(1, 'Produto é obrigatório').max(200, 'Nome do produto muito longo'),
  quantity: z.number().int().positive('Quantidade deve ser positiva'),
  technique_id: z.string().uuid('Técnica é obrigatória'),
  machine_id: z.string().uuid().nullable().optional(),
  priority: jobPrioritySchema.catch('medium'),
  status: jobStatusSchema.catch('queue'),
  estimated_duration: z.number().positive().default(60),
  scheduled_date: z.string().nullable().optional(),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  notes: z.string().max(2000, 'Observações muito longas').nullable().optional(),
  gravure_color: z.string().nullable().optional(),
});

export const jobFormSchema = jobSchema.omit({ id: true, status: true }).extend({
  quantity: z.coerce.number().int().positive('Quantidade deve ser positiva'),
  estimated_duration: z.coerce.number().positive('Duração estimada deve ser positiva').default(60),
});

export type JobFormData = z.infer<typeof jobFormSchema>;
