import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { handler } from "./index.ts";

const mockUrl = "http://localhost:8000";

Deno.test({
  name: "webhook-handler: should accept valid payload",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const payload = {
      source: "bitrix24",
      event: "ONCRMDEALADD",
      data: { id: 123 }
    };
    
    const req = new Request(mockUrl, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    const resp = await handler(req);
    assertEquals(resp.status, 200);
    
    const body = await resp.json();
    assertEquals(body.processed, true);
  }
});

Deno.test({
  name: "webhook-handler: should reject missing source",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const payload = {
      event: "ONCRMDEALADD",
      data: { id: 123 }
    };
    
    const req = new Request(mockUrl, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    const resp = await handler(req);
    assertEquals(resp.status, 400);
    
    const body = await resp.json();
    assertEquals(body.error, "Validation failed");
  }
});

Deno.test({
  name: "webhook-handler: should reject invalid JSON",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const req = new Request(mockUrl, {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "application/json" }
    });

    const resp = await handler(req);
    assertEquals(resp.status, 400);
    
    const body = await resp.json();
    assertEquals(body.error, "Invalid JSON payload");
  }
});
