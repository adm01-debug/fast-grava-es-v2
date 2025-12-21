import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboard } from './useKeyboard';

describe('useKeyboard', () => {
  it('should be defined', () => { expect(useKeyboard).toBeDefined(); });
});
