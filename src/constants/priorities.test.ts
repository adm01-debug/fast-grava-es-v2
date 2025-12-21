import { describe, it, expect } from 'vitest';
import { PRIORITIES, PRIORITY_COLORS } from './priorities';

describe('PRIORITIES', () => {
  it('should have URGENT', () => { expect(PRIORITIES.URGENT).toBe('urgent'); });
});
describe('PRIORITY_COLORS', () => {
  it('should have urgent color', () => { expect(PRIORITY_COLORS.urgent).toBe('#ef4444'); });
});
