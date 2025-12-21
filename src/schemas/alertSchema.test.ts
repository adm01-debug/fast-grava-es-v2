import { describe, it, expect } from 'vitest';
import { alertSchema } from './alertSchema';

describe('alertSchema', () => {
  it('should be defined', () => {
    expect(alertSchema).toBeDefined();
  });
  it('should validate correct data', () => {
    const result = alertSchema.safeParse({});
    expect(result).toHaveProperty('success');
  });
  it('should reject invalid data', () => {
    const result = alertSchema.safeParse(null);
    expect(result.success).toBe(false);
  });
});
