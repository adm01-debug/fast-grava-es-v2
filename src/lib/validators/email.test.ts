import { describe, it, expect } from 'vitest';
import { validateEmail } from './email';

describe('validateEmail', () => {
  it('should validate correct email', () => {
    expect(validateEmail('test@test.com')).toBe(true);
  });
  it('should reject invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
});
