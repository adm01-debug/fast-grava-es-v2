import { describe, it, expect } from 'vitest';
import { COLORS } from './colors';

describe('COLORS', () => {
  it('should have primary', () => { expect(COLORS.primary).toBe('#3b82f6'); });
  it('should have success', () => { expect(COLORS.success).toBe('#22c55e'); });
});
