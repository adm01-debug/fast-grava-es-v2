import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const webhookPayloadSchema = z.object({
  source: z.string().min(1, "Source is required"),
  event: z.string().min(1, "Event is required"),
  data: z.record(z.any()).optional().default({}),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

export const bitrix24DataSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string().optional(),
  status: z.string().optional(),
});

export const stripeDataSchema = z.object({
  id: z.string(),
  object: z.string().optional(),
});

export const mlPredictionPayloadSchema = z.object({
  action: z.enum(["batch_analyze", "single_machine"]).default("batch_analyze"),
  machine_id: z.string().uuid().optional(),
});

export type MLPredictionPayload = z.infer<typeof mlPredictionPayloadSchema>;

export const approvePasswordResetSchema = z.object({
  requestId: z.string().uuid("ID da solicitação inválido"),
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
  redirectUrl: z.string().url().optional(),
});

export type ApprovePasswordResetPayload = z.infer<typeof approvePasswordResetSchema>;


