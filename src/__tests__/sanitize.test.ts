import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  stripTags,
  sanitizeText,
  sanitizeUrl,
  sanitizeControlChars,
  sanitizeInput,
} from '@/lib/sanitize';

describe('escapeHtml', () => {
  it('escapes all dangerous characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
    );
  });

  it('leaves safe strings unchanged', () => {
    expect(escapeHtml('Hello World 123')).toBe('Hello World 123');
  });

  it('escapes backticks and single quotes', () => {
    expect(escapeHtml("it's `code`")).toBe("it&#x27;s &#96;code&#96;");
  });
});

describe('stripTags', () => {
  it('removes HTML tags', () => {
    expect(stripTags('<b>bold</b> text')).toBe('bold text');
  });

  it('handles nested tags', () => {
    expect(stripTags('<div><p>hello</p></div>')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(stripTags('')).toBe('');
  });
});

describe('sanitizeText', () => {
  it('strips tags and escapes remaining', () => {
    expect(sanitizeText('<img onerror="alert(1)">safe & sound')).toBe('safe &amp; sound');
  });
});

describe('sanitizeUrl', () => {
  it('allows https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('allows relative URLs', () => {
    expect(sanitizeUrl('/dashboard')).toBe('/dashboard');
  });

  it('blocks javascript: protocol', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
  });

  it('blocks data: protocol', () => {
    expect(sanitizeUrl('data:text/html,<h1>XSS</h1>')).toBe('');
  });

  it('blocks vbscript: protocol', () => {
    expect(sanitizeUrl('vbscript:MsgBox("XSS")')).toBe('');
  });

  it('is case-insensitive for protocol checks', () => {
    expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('');
  });

  it('allows mailto and tel', () => {
    expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890');
  });
});

describe('sanitizeControlChars', () => {
  it('removes null bytes', () => {
    expect(sanitizeControlChars('hel\x00lo')).toBe('hello');
  });

  it('preserves newlines and tabs', () => {
    expect(sanitizeControlChars('line1\nline2\ttab')).toBe('line1\nline2\ttab');
  });
});

describe('sanitizeInput', () => {
  it('applies full pipeline', () => {
    const malicious = '<script>alert(\x00"xss")</script>Normal text & stuff';
    const result = sanitizeInput(malicious);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('\x00');
    expect(result).toContain('Normal text');
  });
});
