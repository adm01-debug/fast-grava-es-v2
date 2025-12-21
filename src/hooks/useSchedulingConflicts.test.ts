import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSchedulingConflicts } from './useSchedulingConflicts';

describe('useSchedulingConflicts', () => {
  it('should be defined', () => { expect(useSchedulingConflicts).toBeDefined(); });
});
