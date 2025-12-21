import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useThrottle } from './useThrottle';

describe('useThrottle', () => {
  it('should be defined', () => { expect(useThrottle).toBeDefined(); });
});
