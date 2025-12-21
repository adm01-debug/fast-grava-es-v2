import { describe, it, expect } from 'vitest';
import { reportSchema } from './reportSchema';

describe('reportSchema', () => {
  it('should be defined', () => {
    expect(reportSchema).toBeDefined();
  });
  it('should validate correct data', () => {
    const result = reportSchema.safeParse({});
    expect(result).toHaveProperty('success');
  });
  it('should reject invalid data', () => {
    const result = reportSchema.safeParse(null);
    expect(result.success).toBe(false);
  });
});
