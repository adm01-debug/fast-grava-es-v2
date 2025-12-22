import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKPIs } from './useKPIs';

describe('useKPIs', () => {
  it('should be defined', () => { expect(useKPIs).toBeDefined(); });
});
