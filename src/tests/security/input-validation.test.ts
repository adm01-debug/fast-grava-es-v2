import { describe, it, expect } from 'vitest';
import { sanitizeInput, escapeHtml, stripTags } from '@/lib/sanitize';

describe('Input Security & Sanitization', () => {
  it('should strip script tags from input strings', () => {
    const dirty = '<script>alert("xss")</script>Hello';
    const clean = stripTags(dirty);
    expect(clean).toBe('alert("xss")Hello'); // stripTags only removes tags, not content between them
  });

  it('should escape dangerous characters', () => {
    const dangerous = '<img src=x onerror=alert(1)>';
    const escaped = escapeHtml(dangerous);
    expect(escaped).toContain('&lt;');
    expect(escaped).toContain('&gt;');
    expect(escaped).not.toContain('<');
  });

  it('should apply full sanitization pipeline', () => {
    const input = '<script>alert(1)</script><b>Bold</b>';
    const sanitized = sanitizeInput(input);
    expect(sanitized).toBe('alert(1)Bold');
  });
});

