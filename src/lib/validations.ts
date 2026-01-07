import { z } from 'zod';

// Common validation patterns
const patterns = {
  phone: /^\(\d{2}\) \d{4,5}-\d{4}$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  cep: /^\d{5}-\d{3}$/,
  plateOld: /^[A-Z]{3}-\d{4}$/,
  plateMercosul: /^[A-Z]{3}\d[A-Z]\d{2}$/,
};

// Custom error messages in Portuguese
const messages = {
  required: 'Campo obrigatório',
  email: 'E-mail inválido',
  min: (n: number) => `Mínimo ${n} caracteres`,
  max: (n: number) => `Máximo ${n} caracteres`,
  minValue: (n: number) => `Valor mínimo: ${n}`,
  maxValue: (n: number) => `Valor máximo: ${n}`,
  positive: 'Deve ser positivo',
  integer: 'Deve ser um número inteiro',
  url: 'URL inválida',
  date: 'Data inválida',
  phone: 'Telefone inválido',
  cpf: 'CPF inválido',
  cnpj: 'CNPJ inválido',
  cep: 'CEP inválido',
};

// Base schemas
export const emailSchema = z.string()
  .min(1, messages.required)
  .email(messages.email);

export const passwordSchema = z.string()
  .min(8, messages.min(8))
  .regex(/[A-Z]/, 'Deve conter letra maiúscula')
  .regex(/[a-z]/, 'Deve conter letra minúscula')
  .regex(/[0-9]/, 'Deve conter número');

export const nameSchema = z.string()
  .min(2, messages.min(2))
  .max(100, messages.max(100));

export const phoneSchema = z.string()
  .regex(patterns.phone, messages.phone)
  .or(z.literal(''));

export const cpfSchema = z.string()
  .regex(patterns.cpf, messages.cpf)
  .refine(validateCPF, messages.cpf);

export const cnpjSchema = z.string()
  .regex(patterns.cnpj, messages.cnpj)
  .refine(validateCNPJ, messages.cnpj);

export const cepSchema = z.string()
  .regex(patterns.cep, messages.cep);

export const urlSchema = z.string()
  .url(messages.url)
  .or(z.literal(''));

export const dateSchema = z.coerce.date({
  errorMap: () => ({ message: messages.date }),
});

export const positiveNumberSchema = z.number()
  .positive(messages.positive);

export const integerSchema = z.number()
  .int(messages.integer);

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, messages.required),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

// Job schemas
export const jobSchema = z.object({
  order_number: z.string().min(1, messages.required),
  client: z.string().min(1, messages.required),
  product: z.string().min(1, messages.required),
  quantity: z.number().min(1, messages.minValue(1)),
  technique_id: z.string().min(1, messages.required),
  machine_id: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  scheduled_date: z.string().optional(),
  notes: z.string().max(500, messages.max(500)).optional(),
});

// Machine schemas
export const machineSchema = z.object({
  name: z.string().min(1, messages.required),
  code: z.string().min(1, messages.required),
  technique_id: z.string().min(1, messages.required),
  is_active: z.boolean().default(true),
});

// Maintenance schemas
export const maintenanceSchema = z.object({
  machine_id: z.string().min(1, messages.required),
  maintenance_type_id: z.string().min(1, messages.required),
  scheduled_date: z.string().min(1, messages.required),
  description: z.string().max(1000, messages.max(1000)).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

// Profile schemas
export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  avatar_url: urlSchema.optional(),
});

// Settings schemas
export const notificationSettingsSchema = z.object({
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  sound_enabled: z.boolean(),
  job_updates: z.boolean(),
  maintenance_alerts: z.boolean(),
  production_alerts: z.boolean(),
});

// Validation helpers
function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  return digit === parseInt(cleaned[10]);
}

function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights1[i];
  }
  let digit = sum % 11;
  digit = digit < 2 ? 0 : 11 - digit;
  if (digit !== parseInt(cleaned[12])) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weights2[i];
  }
  digit = sum % 11;
  digit = digit < 2 ? 0 : 11 - digit;
  return digit === parseInt(cleaned[13]);
}

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type JobFormData = z.infer<typeof jobSchema>;
export type MachineFormData = z.infer<typeof machineSchema>;
export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type NotificationSettingsData = z.infer<typeof notificationSettingsSchema>;
