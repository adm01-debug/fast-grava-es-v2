import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });
  it('should handle undefined', () => {
    expect(cn('a', undefined)).toBe('a');
  });
});
