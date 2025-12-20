import { z } from 'zod';

export const energyReadingSchema = z.object({
  id: z.string().uuid(),
  machine_id: z.string().uuid(),
  consumption_kwh: z.number().min(0),
  cost_per_kwh: z.number().min(0),
  total_cost: z.number().min(0).optional(),
  peak_demand_kw: z.number().min(0).optional(),
  power_factor: z.number().min(0).max(1).optional(),
  voltage: z.number().min(0).optional(),
  current: z.number().min(0).optional(),
  recorded_at: z.string().datetime(),
  created_at: z.string().datetime(),
});

export const createEnergyReadingSchema = energyReadingSchema.omit({ id: true, created_at: true, total_cost: true });

export const energySummarySchema = z.object({
  total_consumption: z.number().min(0),
  total_cost: z.number().min(0),
  average_power_factor: z.number().min(0).max(1),
  peak_demand: z.number().min(0),
  consumption_by_machine: z.record(z.number()),
  cost_by_machine: z.record(z.number()),
  daily_averages: z.array(z.object({
    date: z.string(),
    consumption: z.number(),
    cost: z.number(),
  })),
});

export const energyAlertSchema = z.object({
  id: z.string().uuid(),
  machine_id: z.string().uuid(),
  type: z.enum(['high_consumption', 'low_power_factor', 'peak_exceeded', 'anomaly']),
  severity: z.enum(['warning', 'critical']),
  message: z.string(),
  value: z.number(),
  threshold: z.number(),
  triggered_at: z.string().datetime(),
  resolved_at: z.string().datetime().nullable().optional(),
});

export const energyTargetSchema = z.object({
  id: z.string().uuid(),
  machine_id: z.string().uuid().optional(),
  target_consumption: z.number().min(0),
  target_cost: z.number().min(0),
  period: z.enum(['daily', 'weekly', 'monthly']),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
});

export type EnergyReading = z.infer<typeof energyReadingSchema>;
export type CreateEnergyReading = z.infer<typeof createEnergyReadingSchema>;
export type EnergySummary = z.infer<typeof energySummarySchema>;
export type EnergyAlert = z.infer<typeof energyAlertSchema>;
export type EnergyTarget = z.infer<typeof energyTargetSchema>;
