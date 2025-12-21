import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  it('should be defined', () => { expect(useLocalStorage).toBeDefined(); });
});
