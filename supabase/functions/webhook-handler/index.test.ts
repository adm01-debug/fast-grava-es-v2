import { assertEquals } from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { handler } from "./index.ts";
import { testContract } from "../_shared/test-utils.ts";

Deno.test({
  name: "webhook-handler: Valid bitrix24 payload",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const payload = {
      source: "bitrix24",
      event: "ONCRMDEALADD",
      data: { id: "123", title: "New Deal" }
    };
    await testContract(handler, payload, 200, "Should accept valid Bitrix24 payload");
  }
});

Deno.test({
  name: "webhook-handler: Valid stripe payload",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const payload = {
      source: "stripe",
      event: "checkout.session.completed",
      data: { id: "cs_123" }
    };
    await testContract(handler, payload, 200, "Should accept valid Stripe payload");
  }
});

Deno.test({
  name: "webhook-handler: Invalid source",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const payload = {
      source: "invalid_source",
      event: "test",
      data: {}
    };
    const { body } = await testContract(handler, payload, 400, "Should reject unknown source");
    assertEquals(body.error, "Contract validation failed");
  }
});

Deno.test({
  name: "webhook-handler: Missing required fields",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const payload = {
      source: "bitrix24"
      // Missing event and data
    };
    const { body } = await testContract(handler, payload, 400, "Should reject missing required fields");
    assertEquals(body.error, "Contract validation failed");
  }
});

Deno.test({
  name: "webhook-handler: Malformed JSON",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const req = new Request("http://localhost:8000", {
      method: "POST",
      body: "{ malformed json }",
      headers: { "Content-Type": "application/json" }
    });
    const resp = await handler(req);
    assertEquals(resp.status, 400);
    const body = await resp.json();
    assertEquals(body.error, "Invalid JSON payload");
  }
});
