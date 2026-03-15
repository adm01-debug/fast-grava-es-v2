import { z } from 'zod';

export const operatorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['operator', 'coordinator', 'manager']),
  is_active: z.boolean().default(true),
  phone: z.string().nullable().optional(),
  badge_number: z.string().nullable().optional(),
});

export const operatorFormSchema = operatorSchema.omit({ id: true });

export type OperatorFormData = z.infer<typeof operatorFormSchema>;
