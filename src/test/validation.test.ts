import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { safeParse, safeParseArray } from '@/lib/validation';

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  age: z.number().positive().int(),
  email: z.string().email(),
});

describe('safeParse', () => {
  it('returns success:true with parsed data for valid input', () => {
    const input = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Alice',
      age: 30,
      email: 'alice@example.com',
    };
    const result = safeParse(UserSchema, input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it('returns success:false with ZodError for invalid input', () => {
    const result = safeParse(UserSchema, { id: 'not-uuid', name: '', age: -1, email: 'bad' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it('captures missing required fields', () => {
    const result = safeParse(UserSchema, { name: 'Bob' });
    expect(result.success).toBe(false);
  });

  it('captures wrong types', () => {
    const result = safeParse(UserSchema, {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Alice',
      age: 'thirty',
      email: 'a@b.com',
    });
    expect(result.success).toBe(false);
  });

  it('accepts context string without throwing', () => {
    expect(() => safeParse(UserSchema, {}, 'test-context')).not.toThrow();
  });

  it('handles null input gracefully', () => {
    const result = safeParse(UserSchema, null);
    expect(result.success).toBe(false);
  });

  it('handles array instead of object', () => {
    const result = safeParse(UserSchema, []);
    expect(result.success).toBe(false);
  });

  const edgeCases = [
    ['empty object', {}],
    ['undefined', undefined],
    ['number', 42],
    ['string', 'hello'],
  ] as const;

  it.each(edgeCases)('rejects %s', (_, input) => {
    const result = safeParse(UserSchema, input);
    expect(result.success).toBe(false);
  });
});

describe('safeParseArray', () => {
  const validUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Alice',
    age: 30,
    email: 'alice@example.com',
  };
  const validUser2 = {
    id: '223e4567-e89b-12d3-a456-426614174001',
    name: 'Bob',
    age: 25,
    email: 'bob@example.com',
  };

  it('returns all valid items with 0 rejected', () => {
    const result = safeParseArray(UserSchema, [validUser, validUser2]);
    expect(result.valid).toHaveLength(2);
    expect(result.rejected).toBe(0);
  });

  it('filters out invalid items and counts rejections', () => {
    const result = safeParseArray(UserSchema, [validUser, { bad: true }, null, validUser2]);
    expect(result.valid).toHaveLength(2);
    expect(result.rejected).toBe(2);
  });

  it('returns empty valid with full rejection count for all-bad input', () => {
    const result = safeParseArray(UserSchema, [null, undefined, 42, 'str']);
    expect(result.valid).toHaveLength(0);
    expect(result.rejected).toBe(4);
  });

  it('handles empty array', () => {
    const result = safeParseArray(UserSchema, []);
    expect(result.valid).toHaveLength(0);
    expect(result.rejected).toBe(0);
  });

  it('preserves data fidelity for valid items', () => {
    const result = safeParseArray(UserSchema, [validUser]);
    expect(result.valid[0]).toEqual(validUser);
  });
});
