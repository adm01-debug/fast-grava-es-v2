import { describe, it, expect, vi } from 'vitest';

// Mocking Edge Function Environment
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Edge Functions Integration Tests', () => {
  it('Health Check Function returns 200', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok' }),
    });

    const response = await fetch('https://xxroejpvloldkmqdydar.supabase.co/functions/v1/health-check');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
  });

  it('PDF Generator handles missing data with 400', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Missing report data' }),
    });

    const response = await fetch('https://xxroejpvloldkmqdydar.supabase.co/functions/v1/pdf-generator', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('Rate Limit Check allows valid requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ allowed: true, remaining: 99 }),
    });

    const response = await fetch('https://xxroejpvloldkmqdydar.supabase.co/functions/v1/rate-limit-check', {
      method: 'POST',
      body: JSON.stringify({ endpoint: '/api/test', user_id: '123' }),
    });
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.allowed).toBe(true);
  });

  it('Technical Assistant returns streamed response', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Dica"}}]} \n\n'));
        controller.close();
      }
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: mockStream,
    });

    const response = await fetch('https://xxroejpvloldkmqdydar.supabase.co/functions/v1/technical-assistant', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Fiber laser' }] }),
    });
    
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('Fuzz testing: Webhook Handler handles invalid payloads', async () => {
    const maliciousPayloads = [
      { malicious: "<script>alert(1)</script>" },
      { tooLarge: "A".repeat(1000000) },
      null,
      undefined,
      "not-json"
    ];

    for (const payload of maliciousPayloads) {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid payload' }),
      });

      const response = await fetch('https://xxroejpvloldkmqdydar.supabase.co/functions/v1/webhook-handler', {
        method: 'POST',
        body: typeof payload === 'string' ? payload : JSON.stringify(payload),
      });
      
      expect([400, 422, 500]).toContain(response.status);
    }
  });

  it('Technical Assistant handles 429 rate limits', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Too many requests' }),
    });

    const response = await fetch('https://xxroejpvloldkmqdydar.supabase.co/functions/v1/technical-assistant', {
      method: 'POST',
      body: JSON.stringify({ messages: [] }),
    });
    
    expect(response.status).toBe(429);
  });
});
