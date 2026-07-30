// Edge function auxiliar de migração.
//
// SEGURANÇA:
// - Autenticação por segredo (MIGRATE_HELPER_KEY), nunca hardcoded no repositório.
// - CORS restrito às origens da aplicação (_shared/cors.ts).
// - NUNCA retorna SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL ou qualquer segredo.
// - Nenhum SQL arbitrário vindo do cliente.

import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts";

const EXPECTED_KEY = Deno.env.get("MIGRATE_HELPER_KEY") ?? "";

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve((req) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  const cors = getCorsHeaders(req);

  // Se o segredo não estiver configurado, a função fica fechada (fail-closed).
  if (!EXPECTED_KEY) {
    return json({ error: "unavailable" }, 503, cors);
  }

  const key = req.headers.get("x-access-key") ?? "";
  if (key !== EXPECTED_KEY) {
    return json({ error: "unauthorized" }, 401, cors);
  }

  const action = new URL(req.url).searchParams.get("action") ?? "ping";

  switch (action) {
    case "ping":
      // Apenas sinal de vida. Nenhum identificador de projeto ou credencial.
      return json({ ok: true, timestamp: new Date().toISOString() }, 200, cors);

    case "config-check":
      // Confirma a PRESENÇA das variáveis de ambiente, nunca os valores.
      return json(
        {
          ok: true,
          configured: {
            supabase_url: Boolean(Deno.env.get("SUPABASE_URL")),
            service_role_key: Boolean(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")),
            db_url: Boolean(Deno.env.get("SUPABASE_DB_URL")),
          },
        },
        200,
        cors,
      );

    default:
      return json({ error: "unknown_action" }, 400, cors);
  }
});
