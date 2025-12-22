import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSchedulingData } from './useSchedulingData';

describe('useSchedulingData', () => {
  it('should be defined', () => { expect(useSchedulingData).toBeDefined(); });
});
