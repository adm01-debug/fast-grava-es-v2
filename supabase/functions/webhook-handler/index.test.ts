import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { handler } from "./index.ts";

Deno.test("Webhook-Handler: Fuzzing and Validation", async (t) => {
  
  await t.step("Invalid JSON should return 400", async () => {
    const req = new Request("http://localhost/functions/v1/webhook-handler", {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "application/json" }
    });
    const res = await handler(req);
    assertEquals(res.status, 400);
    const body = await res.json();
    assertEquals(body.error, "Invalid JSON payload");
  });

  await t.step("Missing source/event should return 400", async () => {
    const req = new Request("http://localhost/functions/v1/webhook-handler", {
      method: "POST",
      body: JSON.stringify({ data: {} }),
      headers: { "Content-Type": "application/json" }
    });
    const res = await handler(req);
    assertEquals(res.status, 400);
    const body = await res.json();
    assertEquals(body.error, "Source and event are required");
  });

  await t.step("Security: Invalid signature should return 401 if enforced", async () => {
    Deno.env.set("ENFORCE_WEBHOOK_SIGNATURES", "true");
    Deno.env.set("WEBHOOK_SECRET_BITRIX24", "my-secret-key");
    
    const req = new Request("http://localhost/functions/v1/webhook-handler", {
      method: "POST",
      body: JSON.stringify({ source: "bitrix24", event: "TEST", data: {} }),
      headers: { 
        "Content-Type": "application/json",
        "x-webhook-signature": "deadbeef" 
      }
    });
    const res = await handler(req);
    assertEquals(res.status, 401);
    const body = await res.json();
    assertEquals(body.error, "Invalid signature");
  });

  await t.step("Security: Missing secret returns 401 if enforced", async () => {
    Deno.env.set("ENFORCE_WEBHOOK_SIGNATURES", "true");
    Deno.env.set("WEBHOOK_SECRET_UNKNOWN", "");
    
    const req = new Request("http://localhost/functions/v1/webhook-handler", {
      method: "POST",
      body: JSON.stringify({ source: "unknown", event: "TEST", data: {} }),
      headers: { "Content-Type": "application/json" }
    });
    const res = await handler(req);
    assertEquals(res.status, 401);
    const body = await res.json();
    assertEquals(body.error, "Security enforcement active: missing secret");
  });
  await t.step("Fuzz Testing: Large payload should be handled", async () => {
    const largeData = "x".repeat(1024 * 1024); // 1MB payload
    const req = new Request("http://localhost/functions/v1/webhook-handler", {
      method: "POST",
      body: JSON.stringify({ source: "stripe", event: "checkout.session.completed", data: { largeData } }),
      headers: { "Content-Type": "application/json" }
    });
    // Signature checking is disabled for unknown source by default unless ENFORCE_WEBHOOK_SIGNATURES is true
    Deno.env.set("ENFORCE_WEBHOOK_SIGNATURES", "false");
    const res = await handler(req);
    // Even if it fails due to DB connection, it shouldn't crash the worker
    assertEquals(res.status === 200 || res.status === 500, true);
  });

  await t.step("Fuzz Testing: Unusual characters in source/event", async () => {
    const req = new Request("http://localhost/functions/v1/webhook-handler", {
      method: "POST",
      body: JSON.stringify({ source: "../../../etc/passwd", event: "\0\x00\n\r", data: {} }),
      headers: { "Content-Type": "application/json" }
    });
    const res = await handler(req);
    // Should handle gracefully (probably return 200 with unknown source or 500 on DB fail, but not crash)
    assertEquals(res.status === 200 || res.status === 500, true);
  });
});
