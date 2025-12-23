import { describe, it, expect } from 'vitest';
import { formatNumber, formatPercentage } from './number';

describe('formatNumber', () => {
  it('should format number', () => {
    expect(formatNumber(1234)).toBe('1.234');
  });
});
describe('formatPercentage', () => {
  it('should format percentage', () => {
    expect(formatPercentage(0.85)).toContain('85');
  });
});
