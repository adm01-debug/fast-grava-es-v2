import { describe, it, expect } from 'vitest';
import { validatePhone } from './phone';

describe('validatePhone', () => {
  it('should validate phone', () => {
    expect(validatePhone('(11) 99999-9999')).toBe(true);
  });
  it('should reject short phone', () => {
    expect(validatePhone('123')).toBe(false);
  });
});
