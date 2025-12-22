import { describe, it, expect } from 'vitest';
import { isValidCNPJ } from './cnpj';

describe('isValidCNPJ', () => {
  it('should validate CNPJ length', () => {
    expect(isValidCNPJ('12.345.678/0001-00')).toBe(true);
  });
});
