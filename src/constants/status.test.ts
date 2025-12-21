import { describe, it, expect } from 'vitest';
import { JOB_STATUS, MACHINE_STATUS } from './status';

describe('JOB_STATUS', () => {
  it('should have PENDING', () => { expect(JOB_STATUS.PENDING).toBe('pending'); });
});
describe('MACHINE_STATUS', () => {
  it('should have ACTIVE', () => { expect(MACHINE_STATUS.ACTIVE).toBe('active'); });
});
