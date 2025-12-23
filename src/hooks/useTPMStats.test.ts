import { describe, it, expect } from 'vitest';
import { useTPMStats } from './tpm/useTPMStats';

describe('useTPMStats', () => {
  it('should be defined', () => { expect(useTPMStats).toBeDefined(); });
});
