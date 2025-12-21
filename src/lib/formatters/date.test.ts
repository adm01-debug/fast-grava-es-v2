import { describe, it, expect } from 'vitest';
import { formatDate } from './date';

describe('formatDate', () => {
  it('should format date', () => {
    expect(formatDate('2024-01-15')).toBe('15/01/2024');
  });
});
