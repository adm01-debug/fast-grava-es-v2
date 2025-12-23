import { describe, it, expect } from 'vitest';
import { validateCPF } from './cpf';

describe('validateCPF', () => {
  it('should validate correct CPF', () => {
    expect(validateCPF('529.982.247-25')).toBe(true);
  });
  it('should reject invalid CPF', () => {
    expect(validateCPF('123')).toBe(false);
    expect(validateCPF('000.000.000-00')).toBe(false);
  });
});
