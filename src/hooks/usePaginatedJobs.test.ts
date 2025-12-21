import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePaginatedJobs } from './usePaginatedJobs';

describe('usePaginatedJobs', () => {
  it('should be defined', () => { expect(usePaginatedJobs).toBeDefined(); });
});
