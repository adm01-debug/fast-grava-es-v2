import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTPM } from './useTPM';

describe('useTPM', () => {
  it('should be defined', () => { expect(useTPM).toBeDefined(); });
});
