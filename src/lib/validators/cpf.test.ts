import { describe, it, expect } from 'vitest';
import { isValidCPF } from './cpf';

describe('isValidCPF', () => {
  it('should validate CPF length', () => {
    expect(isValidCPF('123.456.789-00')).toBe(true);
  });
  it('should reject short CPF', () => {
    expect(isValidCPF('123')).toBe(false);
  });
});
