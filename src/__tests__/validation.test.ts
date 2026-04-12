import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { safeParse, safeParseArray, uuidSchema, paginationSchema } from '@/lib/validation';

describe('validation utilities', () => {
  const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().int().positive(),
  });

  describe('safeParse', () => {
    it('returns success for valid data', () => {
      const result = safeParse(testSchema, { name: 'Test', age: 25 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test');
      }
    });

    it('returns error for invalid data', () => {
      const result = safeParse(testSchema, { name: '', age: -1 });
      expect(result.success).toBe(false);
    });
  });

  describe('safeParseArray', () => {
    it('filters out invalid items', () => {
      const items = [
        { name: 'A', age: 10 },
        { name: '', age: 5 },  // invalid
        { name: 'B', age: 20 },
      ];
      const result = safeParseArray(testSchema, items);
      expect(result.valid).toHaveLength(2);
      expect(result.rejected).toBe(1);
    });

    it('handles empty array', () => {
      const result = safeParseArray(testSchema, []);
      expect(result.valid).toHaveLength(0);
      expect(result.rejected).toBe(0);
    });
  });

  describe('common schemas', () => {
    it('validates UUID', () => {
      expect(uuidSchema.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true);
      expect(uuidSchema.safeParse('not-a-uuid').success).toBe(false);
    });

    it('validates pagination', () => {
      const result = paginationSchema.safeParse({ page: 1, pageSize: 20 });
      expect(result.success).toBe(true);
    });

    it('rejects invalid pagination', () => {
      expect(paginationSchema.safeParse({ page: 0, pageSize: 200 }).success).toBe(false);
    });
  });
});
