import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSPC } from './useSPC';

describe('useSPC', () => {
  it('should be defined', () => { expect(useSPC).toBeDefined(); });
});
