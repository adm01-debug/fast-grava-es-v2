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
  it('escapes & < > " \' / `', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
    expect(escapeHtml("it's")).toBe("it&#x27;s");
    expect(escapeHtml('/path')).toBe('&#x2F;path');
    expect(escapeHtml('`code`')).toBe('&#96;code&#96;');
  });

  it('leaves safe strings unchanged', () => {
    expect(escapeHtml('hello world 123')).toBe('hello world 123');
  });
});

describe('stripTags', () => {
  it('removes HTML tags', () => {
    expect(stripTags('<b>bold</b>')).toBe('bold');
    expect(stripTags('<script>alert(1)</script>')).toBe('alert(1)');
    expect(stripTags('no tags here')).toBe('no tags here');
  });
});

describe('sanitizeUrl', () => {
  it('allows http and https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('allows relative URLs', () => {
    expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
    expect(sanitizeUrl('#anchor')).toBe('#anchor');
    expect(sanitizeUrl('./relative')).toBe('./relative');
  });

  it('allows mailto and tel', () => {
    expect(sanitizeUrl('mailto:user@example.com')).toBe('mailto:user@example.com');
    expect(sanitizeUrl('tel:+5511999999999')).toBe('tel:+5511999999999');
  });

  it('blocks javascript: protocol', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('');
  });

  it('blocks data: protocol', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  it('blocks vbscript:', () => {
    expect(sanitizeUrl('vbscript:MsgBox(1)')).toBe('');
  });

  it('blocks unknown protocols', () => {
    expect(sanitizeUrl('ftp://files.example.com')).toBe('');
  });
});

describe('sanitizeControlChars', () => {
  it('removes null bytes', () => {
    expect(sanitizeControlChars('hello\x00world')).toBe('helloworld');
  });

  it('removes control characters but keeps newlines and tabs', () => {
    const input = 'line1\nline2\ttabbed\x01hidden';
    const result = sanitizeControlChars(input);
    expect(result).toBe('line1\nline2\ttabbed');
  });
});

describe('sanitizeInput (full pipeline)', () => {
  it('strips tags, escapes HTML, removes control chars', () => {
    const input = '<b>Hello</b>\x00 & world';
    const result = sanitizeInput(input);
    expect(result).toBe('Hello &amp; world');
  });
});
