import { z } from 'zod';

export const settingsSchema = z.object({
  language: z.enum(['pt-BR', 'en-US', 'es-ES']).default('pt-BR'),
  dateFormat: z.string().default('dd/MM/yyyy'),
  timeFormat: z.enum(['12h', '24h']).default('24h'),
  notificationsEnabled: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
  compactMode: z.boolean().default(false),
  autoTheme: z.boolean().default(false),
  sessionTimeout: z.number().int().min(5).max(120).default(30),
});

export type SettingsData = z.infer<typeof settingsSchema>;
