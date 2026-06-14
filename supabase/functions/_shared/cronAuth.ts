/**
 * Shared guard for internal/cron edge functions that run with the service-role
 * key and are NOT meant to be reachable by end users.
 *
 *  - If the `CRON_SECRET` environment variable is set, callers MUST send a
 *    matching `x-cron-secret` header (or `Authorization: Bearer <secret>`),
 *    otherwise the request is rejected with 401.
 *  - If `CRON_SECRET` is not configured:
 *      - `failClosed: true`  → reject with 401 (use for DESTRUCTIVE functions,
 *        so an unconfigured deployment can never run them unauthenticated).
 *      - `failClosed: false` (default) → allow but log a warning, so existing
 *        non-destructive deployments keep working while operators lock down.
 *
 * Returns `null` when the request may proceed, or a `Response` (401) to return
 * immediately when it must be rejected. Any `corsHeaders` provided are attached
 * to that 401 so browser callers receive a proper response instead of a CORS error.
 */
export function requireCronSecret(
  req: Request,
  options: { failClosed?: boolean; corsHeaders?: Record<string, string> } = {}
): Response | null {
  const { failClosed = false, corsHeaders = {} } = options;
  const expected = Deno.env.get("CRON_SECRET");

  const reject = () =>
    new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (!expected) {
    if (failClosed) {
      console.error(
        "[cronAuth] CRON_SECRET is not configured and this function fails closed — rejecting request."
      );
      return reject();
    }
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

  return reject();
}
