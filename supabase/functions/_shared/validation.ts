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
