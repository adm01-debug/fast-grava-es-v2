import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { handler } from "./index.ts";

Deno.test({
  name: "Webhook-Handler: Fuzzing and Validation",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async (t) => {
  
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
      const largeData = "x".repeat(1024 * 512); // 512KB payload
      const req = new Request("http://localhost/functions/v1/webhook-handler", {
        method: "POST",
        body: JSON.stringify({ source: "stripe", event: "checkout.session.completed", data: { largeData } }),
        headers: { "Content-Type": "application/json" }
      });
      Deno.env.set("ENFORCE_WEBHOOK_SIGNATURES", "false");
      const res = await handler(req);
      assertEquals(res.status === 200 || res.status === 500, true);
    });

    await t.step("Fuzz Testing: Script Injection in Payload", async () => {
      // Use a different source that doesn't have a secret set in this test context
      // to bypass signature validation correctly
      Deno.env.set("ENFORCE_WEBHOOK_SIGNATURES", "false");
      
      const req = new Request("http://localhost/functions/v1/webhook-handler", {
        method: "POST",
        body: JSON.stringify({ 
          source: "unprotected_source", 
          event: "ONAPPTEST", 
          data: { script: "<script>alert('XSS')</script>", sql: "'; DROP TABLE users; --" } 
        }),
        headers: { "Content-Type": "application/json" }
      });
      const res = await handler(req);
      // Status should be 200 (processed) or 500 (DB connection fail), but worker must not crash
      assertEquals(res.status === 200 || res.status === 500, true);
    });

    await t.step("Fuzz Testing: Unusual characters in source/event", async () => {
      const req = new Request("http://localhost/functions/v1/webhook-handler", {
        method: "POST",
        body: JSON.stringify({ source: "../../../etc/passwd", event: "\0\x00\n\r", data: {} }),
        headers: { "Content-Type": "application/json" }
      });
      const res = await handler(req);
      assertEquals(res.status === 200 || res.status === 500, true);
    });
  }
});
