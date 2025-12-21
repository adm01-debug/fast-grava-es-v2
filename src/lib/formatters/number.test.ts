import { describe, it, expect } from 'vitest';
import { formatNumber, formatPercent } from './number';

describe('formatNumber', () => {
  it('should format number', () => {
    expect(formatNumber(1234)).toBe('1.234');
  });
});
describe('formatPercent', () => {
  it('should format percent', () => {
    expect(formatPercent(85)).toContain('85');
  });
});
