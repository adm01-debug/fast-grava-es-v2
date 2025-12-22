import { describe, it, expect } from 'vitest';
import { formatCurrency } from './currency';

describe('formatCurrency', () => {
  it('should format BRL', () => {
    expect(formatCurrency(1000)).toContain('1.000');
  });
});
