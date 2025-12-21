import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOperators } from './useOperators';

describe('useOperators', () => {
  it('should be defined', () => { expect(useOperators).toBeDefined(); });
});
