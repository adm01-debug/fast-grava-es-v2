// Shared CORS helper — single source of truth for allowed origins and headers
// across all edge functions. Prefer this over per-function duplication.
//
// Usage:
//   import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts";
//   const preflight = handleCorsPreflight(req);
//   if (preflight) return preflight;
//   const cors = getCorsHeaders(req);

const DEFAULT_ORIGINS = [
  Deno.env.get("APP_URL") || "https://fastgravacoes.com.br",
  "https://xxroejpvloldkmqdydar.lovableproject.com",
  "https://id-preview--a1962793-4097-49e9-ad5f-19325edbf69a.lovable.app",
  "https://figma-fighter.lovable.app",
].filter(Boolean) as string[];

const EXTRA_ORIGINS = (Deno.env.get("EXTRA_ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const ALLOWED_ORIGINS: readonly string[] = [
  ...new Set([...DEFAULT_ORIGINS, ...EXTRA_ORIGINS]),
];

const DEFAULT_ALLOWED_HEADERS =
  "authorization, x-client-info, apikey, content-type, x-api-key, x-webhook-signature, x-forwarded-for, x-real-ip, x-simulation-mode, x-simulation-severity";

const DEFAULT_ALLOWED_METHODS = "GET, POST, PATCH, PUT, DELETE, OPTIONS";

export function pickAllowedOrigin(req: Request): string {
  const origin = req.headers.get("origin") ?? "";
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

export function getCorsHeaders(
  req: Request,
  overrides: { headers?: string; methods?: string } = {},
): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": pickAllowedOrigin(req),
    "Access-Control-Allow-Headers": overrides.headers ?? DEFAULT_ALLOWED_HEADERS,
    "Access-Control-Allow-Methods": overrides.methods ?? DEFAULT_ALLOWED_METHODS,
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

export function handleCorsPreflight(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  return new Response(null, { status: 204, headers: getCorsHeaders(req) });
}
