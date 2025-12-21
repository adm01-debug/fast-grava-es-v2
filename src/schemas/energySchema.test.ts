import { describe, it, expect } from 'vitest';
import { energySchema } from './energySchema';

describe('energySchema', () => {
  it('should be defined', () => {
    expect(energySchema).toBeDefined();
  });
  it('should validate correct data', () => {
    const result = energySchema.safeParse({});
    expect(result).toHaveProperty('success');
  });
  it('should reject invalid data', () => {
    const result = energySchema.safeParse(null);
    expect(result.success).toBe(false);
  });
});
