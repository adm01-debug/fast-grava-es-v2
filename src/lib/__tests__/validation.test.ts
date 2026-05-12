import { describe, it, expect } from 'vitest';
import { safeParse, safeParseArray, dateRangeSchema } from '../validation';
import { z } from 'zod';

describe('validation utilities', () => {
  const userSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    age: z.number().int().positive(),
  });

  describe('safeParse', () => {
    it('returns success for valid data', () => {
      const data = { id: '550e8400-e29b-41d4-a716-446655440000', name: 'John', age: 30 };
      const result = safeParse(userSchema, data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('returns error for invalid data', () => {
      const data = { id: 'invalid', name: '', age: -5 };
      const result = safeParse(userSchema, data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('safeParseArray', () => {
    it('filters out invalid items and returns valid ones', () => {
      const items = [
        { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Valid 1', age: 20 },
        { id: 'invalid', name: 'Invalid', age: 30 },
        { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Valid 2', age: 40 },
      ];
      const result = safeParseArray(userSchema, items);
      expect(result.valid).toHaveLength(2);
      expect(result.rejected).toBe(1);
      expect(result.valid[0].name).toBe('Valid 1');
      expect(result.valid[1].name).toBe('Valid 2');
    });

    it('handles empty array', () => {
      const result = safeParseArray(userSchema, []);
      expect(result.valid).toHaveLength(0);
      expect(result.rejected).toBe(0);
    });
  });

  describe('dateRangeSchema', () => {
    it('validates correct ranges', () => {
      const range = {
        start: '2024-01-01T08:00:00Z',
        end: '2024-01-01T09:00:00Z',
      };
      const result = dateRangeSchema.safeParse(range);
      expect(result.success).toBe(true);
    });

    it('fails when end is before start', () => {
      const range = {
        start: '2024-01-01T10:00:00Z',
        end: '2024-01-01T09:00:00Z',
      };
      const result = dateRangeSchema.safeParse(range);
      expect(result.success).toBe(false);
    });
  });
});
