import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('schemas', () => {
  describe('email schema', () => {
    const emailSchema = z.string().email();

    it('should validate correct email', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(emailSchema.safeParse('invalid').success).toBe(false);
    });
  });

  describe('job schema', () => {
    const jobSchema = z.object({
      id: z.string().uuid(),
      title: z.string().min(1),
      status: z.enum(['pending', 'in_progress', 'completed']),
    });

    it('should validate correct job', () => {
      const job = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Job',
        status: 'pending',
      };
      expect(jobSchema.safeParse(job).success).toBe(true);
    });

    it('should reject invalid status', () => {
      const job = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test',
        status: 'invalid',
      };
      expect(jobSchema.safeParse(job).success).toBe(false);
    });
  });

  describe('operator schema', () => {
    const operatorSchema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      role: z.string(),
    });

    it('should validate operator', () => {
      const op = { name: 'John', email: 'john@example.com', role: 'operator' };
      expect(operatorSchema.safeParse(op).success).toBe(true);
    });
  });
});
