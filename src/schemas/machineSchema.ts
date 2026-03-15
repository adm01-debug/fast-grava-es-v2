import { z } from 'zod';

export const machineSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome é obrigatório'),
  code: z.string().min(1, 'Código é obrigatório'),
  technique_id: z.string().uuid('Técnica é obrigatória'),
  is_active: z.boolean().default(true),
});

export const machineFormSchema = machineSchema.omit({ id: true });

export type MachineFormData = z.infer<typeof machineFormSchema>;
