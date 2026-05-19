import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { handler } from "./handler.ts";
import { testContract } from "../_shared/test-utils.ts";

Deno.test({
  name: "erp-api: Create Job - Valid payload",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const payload = {
      order_number: "PO-2024-001",
      client: "Acme Corp",
      product: "Custom Engraving",
      quantity: 100,
      technique_id: crypto.randomUUID(),
      priority: "high",
      scheduled_date: "2024-05-20"
    };
    
    const req = new Request("http://localhost:8000/erp-api/jobs", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    const resp = await handler(req);
    assertEquals(resp.status, 201);
    
    const body = await resp.json();
    assertEquals(body.order_number, payload.order_number);
  }
});

Deno.test({
  name: "erp-api: Create Job - Invalid quantity",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const payload = {
      order_number: "PO-2024-001",
      client: "Acme Corp",
      product: "Custom Engraving",
      quantity: -5, // Invalid
      technique_id: crypto.randomUUID()
    };
    
    const req = new Request("http://localhost:8000/erp-api/jobs", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    const resp = await handler(req);
    assertEquals(resp.status, 400);
    
    const body = await resp.json();
    assertEquals(body.error, "Contract validation failed");
  }
});

Deno.test({
  name: "erp-api: Create Lot - Valid payload",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const payload = {
      job_id: crypto.randomUUID(),
      lot_number: "LOT-A1",
      quantity: 50,
      operator_id: crypto.randomUUID()
    };
    
    const req = new Request("http://localhost:8000/erp-api/lots", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    const resp = await handler(req);
    assertEquals(resp.status, 201);
  }
});

Deno.test({
  name: "erp-api: Create Lot - Missing lot_number",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const payload = {
      job_id: crypto.randomUUID(),
      quantity: 50
    };
    
    const req = new Request("http://localhost:8000/erp-api/lots", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    const resp = await handler(req);
    assertEquals(resp.status, 400);
  }
});
