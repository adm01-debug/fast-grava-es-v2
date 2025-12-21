import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  it('should be defined', () => { expect(useDebounce).toBeDefined(); });
});
