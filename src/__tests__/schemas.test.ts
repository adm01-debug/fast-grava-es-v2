import { describe, it, expect } from 'vitest';
import { jobSchema, jobFormSchema } from '@/schemas/jobSchema';
import { operatorSchema, operatorFormSchema } from '@/schemas/operatorSchema';

describe('jobSchema', () => {
  const validJob = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    order_number: 'OP-001',
    client: 'Acme Corp',
    product: 'Widget A',
    quantity: 100,
    technique_id: '550e8400-e29b-41d4-a716-446655440001',
    priority: 'medium' as const,
    status: 'pending' as const,
    estimated_duration: 60,
  };

  it('accepts valid job', () => {
    expect(jobSchema.safeParse(validJob).success).toBe(true);
  });

  it('rejects empty order_number', () => {
    const r = jobSchema.safeParse({ ...validJob, order_number: '' });
    expect(r.success).toBe(false);
  });

  it('rejects negative quantity', () => {
    const r = jobSchema.safeParse({ ...validJob, quantity: -1 });
    expect(r.success).toBe(false);
  });

  it('rejects invalid priority', () => {
    const r = jobSchema.safeParse({ ...validJob, priority: 'invalid' });
    expect(r.success).toBe(false);
  });

  it('accepts nullable optional fields', () => {
    const r = jobSchema.safeParse({ ...validJob, machine_id: null, notes: null, gravure_color: null });
    expect(r.success).toBe(true);
  });
});

describe('jobFormSchema', () => {
  it('coerces string quantity to number', () => {
    const r = jobFormSchema.safeParse({
      order_number: 'OP-001',
      client: 'Client',
      product: 'Product',
      quantity: '50',
      technique_id: '550e8400-e29b-41d4-a716-446655440001',
      estimated_duration: '120',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.quantity).toBe(50);
      expect(r.data.estimated_duration).toBe(120);
    }
  });

  it('rejects zero quantity', () => {
    const r = jobFormSchema.safeParse({
      order_number: 'OP-001',
      client: 'Client',
      product: 'Product',
      quantity: '0',
      technique_id: '550e8400-e29b-41d4-a716-446655440001',
    });
    expect(r.success).toBe(false);
  });
});

describe('operatorSchema', () => {
  const validOp = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'João Silva',
    email: 'joao@test.com',
    role: 'operator' as const,
    is_active: true,
  };

  it('accepts valid operator', () => {
    expect(operatorSchema.safeParse(validOp).success).toBe(true);
  });

  it('rejects name shorter than 2 chars', () => {
    const r = operatorSchema.safeParse({ ...validOp, name: 'J' });
    expect(r.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const r = operatorSchema.safeParse({ ...validOp, email: 'not-email' });
    expect(r.success).toBe(false);
  });

  it('rejects invalid role', () => {
    const r = operatorSchema.safeParse({ ...validOp, role: 'admin' });
    expect(r.success).toBe(false);
  });

  it('accepts all valid roles', () => {
    for (const role of ['operator', 'coordinator', 'manager']) {
      expect(operatorSchema.safeParse({ ...validOp, role }).success).toBe(true);
    }
  });
});

describe('operatorFormSchema', () => {
  it('does not require id', () => {
    const r = operatorFormSchema.safeParse({
      name: 'Maria',
      email: 'maria@test.com',
      role: 'operator',
    });
    expect(r.success).toBe(true);
  });
});
