import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useJobs } from './useJobs';

describe('useJobs', () => {
  it('should be defined', () => { expect(useJobs).toBeDefined(); });
});
