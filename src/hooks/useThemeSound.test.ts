import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useThemeSound } from './useThemeSound';

describe('useThemeSound', () => {
  it('should be defined', () => { expect(useThemeSound).toBeDefined(); });
});
