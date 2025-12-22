import { describe, it, expect } from 'vitest';
import { isValidPhone } from './phone';

describe('isValidPhone', () => {
  it('should validate phone', () => {
    expect(isValidPhone('(11) 99999-9999')).toBe(true);
  });
});
