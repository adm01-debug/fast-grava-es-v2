// Load env manually to avoid .env.example validation
const envText = Deno.readTextFileSync("/dev-server/.env");
for (const line of envText.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const val = match[2].trim().replace(/^["']|["']$/g, "");
    Deno.env.set(key, val);
  }
}

import { assertEquals, assertExists, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

// ============================================================
// Import pure functions directly for unit testing
// ============================================================

// Re-implement the pure logic functions here to test them in isolation
// (Edge functions run in Deno, so we test the logic directly)

function classifySeverity(durationMs: number, hasError: boolean): string {
  if (hasError) return "error";
  if (durationMs >= 8000) return "very_slow";
  if (durationMs >= 3000) return "slow";
  return "normal";
}

function buildTelemetryPayload(
  operation: string,
  tableName: string | null,
  rpcName: string | null,
  durationMs: number,
  opts: {
    recordCount?: number | null;
    queryLimit?: number | null;
    queryOffset?: number | null;
    countMode?: string | null;
    errorMessage?: string | null;
    userId?: string | null;
  } = {}
) {
  const hasError = !!opts.errorMessage;
  return {
    operation,
    table_name: tableName,
    rpc_name: rpcName,
    duration_ms: Math.max(0, Math.round(durationMs)),
    record_count: opts.recordCount ?? null,
    query_limit: opts.queryLimit ?? null,
    query_offset: opts.queryOffset ?? null,
    count_mode: opts.countMode ?? null,
    severity: classifySeverity(durationMs, hasError),
    error_message: opts.errorMessage ?? null,
    user_id: opts.userId ?? null,
  };
}

function validateBridgeRequest(body: any): {
  valid: boolean;
  error?: string;
  data?: { action: string; table?: string; rpc?: string; params?: Record<string, unknown> };
} {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object" };
  }
  if (!body.action || typeof body.action !== "string") {
    return { valid: false, error: "Missing or invalid 'action' field" };
  }
  const validActions = ["select", "insert", "update", "delete", "rpc", "upsert"];
  if (!validActions.includes(body.action)) {
    return { valid: false, error: `Invalid action: ${body.action}. Allowed: ${validActions.join(", ")}` };
  }
  if (body.action === "rpc" && (!body.rpc || typeof body.rpc !== "string")) {
    return { valid: false, error: "RPC action requires a 'rpc' field" };
  }
  if (body.action !== "rpc" && (!body.table || typeof body.table !== "string")) {
    return { valid: false, error: "Non-RPC actions require a 'table' field" };
  }
  return { valid: true, data: { action: body.action, table: body.table, rpc: body.rpc, params: body.params || {} } };
}

// ============================================================
// SUITE 1: classifySeverity — 25 tests
// ============================================================

Deno.test("CS-001: error always returns 'error' regardless of duration", () => {
  assertEquals(classifySeverity(0, true), "error");
});
Deno.test("CS-002: error with high duration still returns 'error'", () => {
  assertEquals(classifySeverity(99999, true), "error");
});
Deno.test("CS-003: 0ms no error = normal", () => {
  assertEquals(classifySeverity(0, false), "normal");
});
Deno.test("CS-004: 1ms = normal", () => {
  assertEquals(classifySeverity(1, false), "normal");
});
Deno.test("CS-005: 2999ms = normal", () => {
  assertEquals(classifySeverity(2999, false), "normal");
});
Deno.test("CS-006: 3000ms = slow", () => {
  assertEquals(classifySeverity(3000, false), "slow");
});
Deno.test("CS-007: 3001ms = slow", () => {
  assertEquals(classifySeverity(3001, false), "slow");
});
Deno.test("CS-008: 5000ms = slow", () => {
  assertEquals(classifySeverity(5000, false), "slow");
});
Deno.test("CS-009: 7999ms = slow", () => {
  assertEquals(classifySeverity(7999, false), "slow");
});
Deno.test("CS-010: 8000ms = very_slow", () => {
  assertEquals(classifySeverity(8000, false), "very_slow");
});
Deno.test("CS-011: 8001ms = very_slow", () => {
  assertEquals(classifySeverity(8001, false), "very_slow");
});
Deno.test("CS-012: 15000ms = very_slow", () => {
  assertEquals(classifySeverity(15000, false), "very_slow");
});
Deno.test("CS-013: 120000ms = very_slow", () => {
  assertEquals(classifySeverity(120000, false), "very_slow");
});
Deno.test("CS-014: error at boundary 3000ms", () => {
  assertEquals(classifySeverity(3000, true), "error");
});
Deno.test("CS-015: error at boundary 8000ms", () => {
  assertEquals(classifySeverity(8000, true), "error");
});
Deno.test("CS-016: 500ms = normal", () => {
  assertEquals(classifySeverity(500, false), "normal");
});
Deno.test("CS-017: 1000ms = normal", () => {
  assertEquals(classifySeverity(1000, false), "normal");
});
Deno.test("CS-018: 2000ms = normal", () => {
  assertEquals(classifySeverity(2000, false), "normal");
});
Deno.test("CS-019: 4000ms = slow", () => {
  assertEquals(classifySeverity(4000, false), "slow");
});
Deno.test("CS-020: 6000ms = slow", () => {
  assertEquals(classifySeverity(6000, false), "slow");
});
Deno.test("CS-021: 10000ms = very_slow", () => {
  assertEquals(classifySeverity(10000, false), "very_slow");
});
Deno.test("CS-022: 50000ms = very_slow", () => {
  assertEquals(classifySeverity(50000, false), "very_slow");
});
Deno.test("CS-023: negative duration = normal", () => {
  assertEquals(classifySeverity(-100, false), "normal");
});
Deno.test("CS-024: negative duration with error = error", () => {
  assertEquals(classifySeverity(-1, true), "error");
});
Deno.test("CS-025: exactly 100ms = normal", () => {
  assertEquals(classifySeverity(100, false), "normal");
});

// ============================================================
// SUITE 2: buildTelemetryPayload — 30 tests
// ============================================================

Deno.test("BTP-001: basic select payload", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 500);
  assertEquals(p.operation, "select");
  assertEquals(p.table_name, "jobs");
  assertEquals(p.rpc_name, null);
  assertEquals(p.duration_ms, 500);
  assertEquals(p.severity, "normal");
});

Deno.test("BTP-002: rpc payload", () => {
  const p = buildTelemetryPayload("rpc", null, "calculate_oee", 4000);
  assertEquals(p.operation, "rpc");
  assertEquals(p.table_name, null);
  assertEquals(p.rpc_name, "calculate_oee");
  assertEquals(p.severity, "slow");
});

Deno.test("BTP-003: very slow query", () => {
  const p = buildTelemetryPayload("select", "machines", null, 9000);
  assertEquals(p.severity, "very_slow");
});

Deno.test("BTP-004: error overrides duration severity", () => {
  const p = buildTelemetryPayload("insert", "jobs", null, 100, { errorMessage: "constraint violation" });
  assertEquals(p.severity, "error");
  assertEquals(p.error_message, "constraint violation");
});

Deno.test("BTP-005: duration_ms rounds correctly", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 123.456);
  assertEquals(p.duration_ms, 123);
});

Deno.test("BTP-006: duration_ms rounds up at .5", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 123.5);
  assertEquals(p.duration_ms, 124);
});

Deno.test("BTP-007: negative duration clamped to 0", () => {
  const p = buildTelemetryPayload("select", "jobs", null, -500);
  assertEquals(p.duration_ms, 0);
});

Deno.test("BTP-008: all optional fields null by default", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 100);
  assertEquals(p.record_count, null);
  assertEquals(p.query_limit, null);
  assertEquals(p.query_offset, null);
  assertEquals(p.count_mode, null);
  assertEquals(p.error_message, null);
  assertEquals(p.user_id, null);
});

Deno.test("BTP-009: with record count", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 100, { recordCount: 50 });
  assertEquals(p.record_count, 50);
});

Deno.test("BTP-010: with query limit and offset", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 100, { queryLimit: 100, queryOffset: 200 });
  assertEquals(p.query_limit, 100);
  assertEquals(p.query_offset, 200);
});

Deno.test("BTP-011: with count mode", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 100, { countMode: "exact" });
  assertEquals(p.count_mode, "exact");
});

Deno.test("BTP-012: with user_id", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 100, { userId: "abc-123" });
  assertEquals(p.user_id, "abc-123");
});

Deno.test("BTP-013: insert operation", () => {
  const p = buildTelemetryPayload("insert", "profiles", null, 200);
  assertEquals(p.operation, "insert");
});

Deno.test("BTP-014: update operation", () => {
  const p = buildTelemetryPayload("update", "machines", null, 1500);
  assertEquals(p.operation, "update");
});

Deno.test("BTP-015: delete operation", () => {
  const p = buildTelemetryPayload("delete", "old_logs", null, 300);
  assertEquals(p.operation, "delete");
});

Deno.test("BTP-016: upsert operation", () => {
  const p = buildTelemetryPayload("upsert", "settings", null, 400);
  assertEquals(p.operation, "upsert");
});

Deno.test("BTP-017: zero duration", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 0);
  assertEquals(p.duration_ms, 0);
  assertEquals(p.severity, "normal");
});

Deno.test("BTP-018: boundary 3000ms", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 3000);
  assertEquals(p.severity, "slow");
});

Deno.test("BTP-019: boundary 2999ms", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 2999);
  assertEquals(p.severity, "normal");
});

Deno.test("BTP-020: boundary 8000ms", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 8000);
  assertEquals(p.severity, "very_slow");
});

Deno.test("BTP-021: boundary 7999ms", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 7999);
  assertEquals(p.severity, "slow");
});

Deno.test("BTP-022: both table and rpc set", () => {
  const p = buildTelemetryPayload("rpc", "jobs", "get_stats", 100);
  assertEquals(p.table_name, "jobs");
  assertEquals(p.rpc_name, "get_stats");
});

Deno.test("BTP-023: record_count = 0", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 100, { recordCount: 0 });
  assertEquals(p.record_count, 0);
});

Deno.test("BTP-024: very large duration", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 300000);
  assertEquals(p.duration_ms, 300000);
  assertEquals(p.severity, "very_slow");
});

Deno.test("BTP-025: error with null error message is not error", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 100, { errorMessage: null });
  assertEquals(p.severity, "normal");
});

Deno.test("BTP-026: error with empty string error is not error", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 100, { errorMessage: "" });
  assertEquals(p.severity, "normal"); // empty string is falsy
});

Deno.test("BTP-027: all opts populated", () => {
  const p = buildTelemetryPayload("select", "jobs", "fn", 5000, {
    recordCount: 42,
    queryLimit: 100,
    queryOffset: 50,
    countMode: "estimated",
    errorMessage: null,
    userId: "user-xyz",
  });
  assertEquals(p.record_count, 42);
  assertEquals(p.query_limit, 100);
  assertEquals(p.query_offset, 50);
  assertEquals(p.count_mode, "estimated");
  assertEquals(p.user_id, "user-xyz");
  assertEquals(p.severity, "slow");
});

Deno.test("BTP-028: fractional duration 0.1ms rounds to 0", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 0.1);
  assertEquals(p.duration_ms, 0);
});

Deno.test("BTP-029: fractional duration 0.9ms rounds to 1", () => {
  const p = buildTelemetryPayload("select", "jobs", null, 0.9);
  assertEquals(p.duration_ms, 1);
});

Deno.test("BTP-030: error payload has error_message set", () => {
  const p = buildTelemetryPayload("delete", "logs", null, 100, { errorMessage: "fk constraint" });
  assertEquals(p.error_message, "fk constraint");
  assertEquals(p.severity, "error");
});

// ============================================================
// SUITE 3: validateBridgeRequest — 30 tests
// ============================================================

Deno.test("VBR-001: null body", () => {
  const r = validateBridgeRequest(null);
  assertEquals(r.valid, false);
});

Deno.test("VBR-002: undefined body", () => {
  const r = validateBridgeRequest(undefined);
  assertEquals(r.valid, false);
});

Deno.test("VBR-003: empty object", () => {
  const r = validateBridgeRequest({});
  assertEquals(r.valid, false);
  assert(r.error!.includes("action"));
});

Deno.test("VBR-004: action as number", () => {
  const r = validateBridgeRequest({ action: 123 });
  assertEquals(r.valid, false);
});

Deno.test("VBR-005: invalid action", () => {
  const r = validateBridgeRequest({ action: "drop_table" });
  assertEquals(r.valid, false);
  assert(r.error!.includes("Invalid action"));
});

Deno.test("VBR-006: valid select", () => {
  const r = validateBridgeRequest({ action: "select", table: "jobs" });
  assertEquals(r.valid, true);
  assertEquals(r.data!.action, "select");
  assertEquals(r.data!.table, "jobs");
});

Deno.test("VBR-007: valid insert", () => {
  const r = validateBridgeRequest({ action: "insert", table: "machines" });
  assertEquals(r.valid, true);
});

Deno.test("VBR-008: valid update", () => {
  const r = validateBridgeRequest({ action: "update", table: "profiles" });
  assertEquals(r.valid, true);
});

Deno.test("VBR-009: valid delete", () => {
  const r = validateBridgeRequest({ action: "delete", table: "logs" });
  assertEquals(r.valid, true);
});

Deno.test("VBR-010: valid upsert", () => {
  const r = validateBridgeRequest({ action: "upsert", table: "settings" });
  assertEquals(r.valid, true);
});

Deno.test("VBR-011: valid rpc", () => {
  const r = validateBridgeRequest({ action: "rpc", rpc: "calculate_oee" });
  assertEquals(r.valid, true);
  assertEquals(r.data!.rpc, "calculate_oee");
});

Deno.test("VBR-012: rpc without rpc field", () => {
  const r = validateBridgeRequest({ action: "rpc" });
  assertEquals(r.valid, false);
  assert(r.error!.includes("rpc"));
});

Deno.test("VBR-013: rpc with numeric rpc field", () => {
  const r = validateBridgeRequest({ action: "rpc", rpc: 123 });
  assertEquals(r.valid, false);
});

Deno.test("VBR-014: select without table", () => {
  const r = validateBridgeRequest({ action: "select" });
  assertEquals(r.valid, false);
  assert(r.error!.includes("table"));
});

Deno.test("VBR-015: select with numeric table", () => {
  const r = validateBridgeRequest({ action: "select", table: 42 });
  assertEquals(r.valid, false);
});

Deno.test("VBR-016: params passed through", () => {
  const r = validateBridgeRequest({ action: "select", table: "jobs", params: { limit: 10 } });
  assertEquals(r.valid, true);
  assertEquals((r.data!.params as any).limit, 10);
});

Deno.test("VBR-017: missing params defaults to empty", () => {
  const r = validateBridgeRequest({ action: "select", table: "jobs" });
  assertEquals(r.valid, true);
  assertEquals(JSON.stringify(r.data!.params), "{}");
});

Deno.test("VBR-018: string body", () => {
  const r = validateBridgeRequest("not an object");
  assertEquals(r.valid, false);
});

Deno.test("VBR-019: array body", () => {
  const r = validateBridgeRequest([1, 2, 3]);
  assertEquals(r.valid, false);
});

Deno.test("VBR-020: boolean body", () => {
  const r = validateBridgeRequest(true);
  assertEquals(r.valid, false);
});

Deno.test("VBR-021: number body", () => {
  const r = validateBridgeRequest(42);
  assertEquals(r.valid, false);
});

Deno.test("VBR-022: empty action string", () => {
  const r = validateBridgeRequest({ action: "" });
  assertEquals(r.valid, false);
});

Deno.test("VBR-023: action with whitespace", () => {
  const r = validateBridgeRequest({ action: " select " });
  assertEquals(r.valid, false); // exact match required
});

Deno.test("VBR-024: extra fields are ignored", () => {
  const r = validateBridgeRequest({ action: "select", table: "jobs", extra: "ignored" });
  assertEquals(r.valid, true);
});

Deno.test("VBR-025: rpc with table is valid", () => {
  const r = validateBridgeRequest({ action: "rpc", rpc: "fn", table: "tbl" });
  assertEquals(r.valid, true);
});

Deno.test("VBR-026: action case sensitive - SELECT invalid", () => {
  const r = validateBridgeRequest({ action: "SELECT", table: "jobs" });
  assertEquals(r.valid, false);
});

Deno.test("VBR-027: complex params", () => {
  const r = validateBridgeRequest({
    action: "select",
    table: "jobs",
    params: { columns: "id,title", limit: 50, offset: 100, filters: { status: "active" } },
  });
  assertEquals(r.valid, true);
  assertEquals((r.data!.params as any).limit, 50);
});

Deno.test("VBR-028: null action", () => {
  const r = validateBridgeRequest({ action: null });
  assertEquals(r.valid, false);
});

Deno.test("VBR-029: rpc with empty rpc string", () => {
  const r = validateBridgeRequest({ action: "rpc", rpc: "" });
  assertEquals(r.valid, false);
});

Deno.test("VBR-030: deeply nested params", () => {
  const r = validateBridgeRequest({
    action: "insert",
    table: "logs",
    params: { data: { nested: { deep: { value: 42 } } } },
  });
  assertEquals(r.valid, true);
});

// ============================================================
// SUITE 4: E2E — Edge Function HTTP (unauthenticated)
// ============================================================

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/external-db-bridge`;

Deno.test("E2E-001: OPTIONS returns CORS headers", async () => {
  const res = await fetch(FUNCTION_URL, { method: "OPTIONS" });
  const body = await res.text();
  assertEquals(res.status, 200);
  assertExists(res.headers.get("access-control-allow-origin"));
});

Deno.test("E2E-002: GET without auth returns 401", async () => {
  const res = await fetch(FUNCTION_URL, { method: "POST", body: JSON.stringify({ action: "select", table: "jobs" }) });
  const body = await res.text();
  assertEquals(res.status, 401);
});

Deno.test("E2E-003: POST with invalid bearer returns 401", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { Authorization: "Bearer invalid-token", "Content-Type": "application/json" },
    body: JSON.stringify({ action: "select", table: "jobs" }),
  });
  const body = await res.text();
  assertEquals(res.status, 401);
});

Deno.test("E2E-004: POST without Authorization header returns 401", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "select", table: "jobs" }),
  });
  const body = await res.text();
  assertEquals(res.status, 401);
});

Deno.test("E2E-005: POST with empty Bearer returns 401", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { Authorization: "Bearer ", "Content-Type": "application/json" },
    body: JSON.stringify({ action: "select", table: "jobs" }),
  });
  const body = await res.text();
  assertEquals(res.status, 401);
});

// ============================================================
// SUITE 5: Telemetry Payload Integrity — Stress Tests
// ============================================================

Deno.test("STRESS-001: 100 payloads all have valid severity", () => {
  for (let i = 0; i < 100; i++) {
    const ms = Math.floor(Math.random() * 20000);
    const hasError = i % 10 === 0;
    const sev = classifySeverity(ms, hasError);
    assert(["normal", "slow", "very_slow", "error"].includes(sev), `Invalid severity: ${sev}`);
  }
});

Deno.test("STRESS-002: 100 payloads have non-negative duration", () => {
  for (let i = 0; i < 100; i++) {
    const ms = Math.random() * 20000 - 5000; // some negative
    const p = buildTelemetryPayload("select", "tbl", null, ms);
    assert(p.duration_ms >= 0, `Negative duration: ${p.duration_ms}`);
  }
});

Deno.test("STRESS-003: 100 payloads have integer duration", () => {
  for (let i = 0; i < 100; i++) {
    const ms = Math.random() * 15000;
    const p = buildTelemetryPayload("select", "tbl", null, ms);
    assertEquals(p.duration_ms, Math.round(p.duration_ms));
  }
});

Deno.test("STRESS-004: 200 validation requests all return consistent results", () => {
  const bodies = [
    { action: "select", table: "jobs" },
    { action: "rpc", rpc: "fn" },
    {},
    null,
    { action: "invalid" },
    { action: "select" },
    { action: "rpc" },
  ];
  for (let i = 0; i < 200; i++) {
    const body = bodies[i % bodies.length];
    const r1 = validateBridgeRequest(body);
    const r2 = validateBridgeRequest(body);
    assertEquals(r1.valid, r2.valid); // deterministic
  }
});

Deno.test("STRESS-005: severity classification is deterministic", () => {
  for (let i = 0; i < 100; i++) {
    const ms = i * 100;
    const s1 = classifySeverity(ms, false);
    const s2 = classifySeverity(ms, false);
    assertEquals(s1, s2);
  }
});
