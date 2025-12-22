import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTPMStats } from './useTPMStats';

describe('useTPMStats', () => {
  it('should be defined', () => { expect(useTPMStats).toBeDefined(); });
});
