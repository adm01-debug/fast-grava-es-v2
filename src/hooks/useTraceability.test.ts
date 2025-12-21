import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTraceability } from './useTraceability';

describe('useTraceability', () => {
  it('should be defined', () => { expect(useTraceability).toBeDefined(); });
});
