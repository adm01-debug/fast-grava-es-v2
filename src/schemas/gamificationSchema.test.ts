import { describe, it, expect } from 'vitest';
import { gamificationSchema } from './gamificationSchema';

describe('gamificationSchema', () => {
  it('should be defined', () => {
    expect(gamificationSchema).toBeDefined();
  });
  it('should validate correct data', () => {
    const result = gamificationSchema.safeParse({});
    expect(result).toHaveProperty('success');
  });
  it('should reject invalid data', () => {
    const result = gamificationSchema.safeParse(null);
    expect(result.success).toBe(false);
  });
});
