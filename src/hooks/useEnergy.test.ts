import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEnergy } from './useEnergy';

describe('useEnergy', () => {
  it('should be defined', () => { expect(useEnergy).toBeDefined(); });
});
