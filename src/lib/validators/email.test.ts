import { describe, it, expect } from 'vitest';
import { isValidEmail } from './email';

describe('isValidEmail', () => {
  it('should validate correct email', () => {
    expect(isValidEmail('test@test.com')).toBe(true);
  });
  it('should reject invalid email', () => {
    expect(isValidEmail('invalid')).toBe(false);
  });
});
