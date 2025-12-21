import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuickFavorites } from './useQuickFavorites';

describe('useQuickFavorites', () => {
  it('should be defined', () => { expect(useQuickFavorites).toBeDefined(); });
});
