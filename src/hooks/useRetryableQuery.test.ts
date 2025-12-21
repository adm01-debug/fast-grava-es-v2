import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRetryableQuery } from './useRetryableQuery';

describe('useRetryableQuery', () => {
  it('should be defined', () => { expect(useRetryableQuery).toBeDefined(); });
});
