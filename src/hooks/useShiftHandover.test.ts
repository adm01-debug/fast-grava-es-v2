import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useShiftHandover } from './useShiftHandover';

describe('useShiftHandover', () => {
  it('should be defined', () => { expect(useShiftHandover).toBeDefined(); });
});
