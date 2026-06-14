/**
 * Shared guard for internal/cron edge functions that run with the service-role
 * key and are NOT meant to be reachable by end users.
 *
 * Behavior is backward-compatible by design:
 *  - If the `CRON_SECRET` environment variable is set, callers MUST send a
 *    matching `x-cron-secret` header (or `Authorization: Bearer <secret>`),
 *    otherwise the request is rejected with 401.
 *  - If `CRON_SECRET` is not configured, the request is allowed but a warning
 *    is logged, so existing deployments keep working while operators are
 *    nudged to lock the function down.
 *
 * Returns `null` when the request may proceed, or a `Response` (401) to return
 * immediately when it must be rejected.
 */
export function requireCronSecret(req: Request): Response | null {
  const expected = Deno.env.get("CRON_SECRET");

  if (!expected) {
    console.warn(
      "[cronAuth] CRON_SECRET is not configured — this function is unauthenticated. " +
        "Set CRON_SECRET and send it via the x-cron-secret header to lock it down."
    );
    return null;
  }

  const headerSecret = req.headers.get("x-cron-secret");
  const authHeader = req.headers.get("authorization") || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (headerSecret === expected || bearer === expected) {
    return null;
  }

  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
