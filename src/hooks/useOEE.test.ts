import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOEE } from './useOEE';

describe('useOEE', () => {
  it('should be defined', () => { expect(useOEE).toBeDefined(); });
});
