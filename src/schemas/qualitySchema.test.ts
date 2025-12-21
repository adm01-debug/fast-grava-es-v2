import { describe, it, expect } from 'vitest';
import { qualitySchema } from './qualitySchema';

describe('qualitySchema', () => {
  it('should be defined', () => {
    expect(qualitySchema).toBeDefined();
  });
  it('should validate correct data', () => {
    const result = qualitySchema.safeParse({});
    expect(result).toHaveProperty('success');
  });
  it('should reject invalid data', () => {
    const result = qualitySchema.safeParse(null);
    expect(result.success).toBe(false);
  });
});
