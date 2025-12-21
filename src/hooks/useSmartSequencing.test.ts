import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSmartSequencing } from './useSmartSequencing';

describe('useSmartSequencing', () => {
  it('should be defined', () => { expect(useSmartSequencing).toBeDefined(); });
});
