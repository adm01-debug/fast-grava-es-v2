import { describe, it, expect } from 'vitest';
import { validateCNPJ } from './cnpj';

describe('validateCNPJ', () => {
  it('should validate CNPJ format', () => {
    expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
    expect(validateCNPJ('00.000.000/0000-00')).toBe(false);
  });
});
