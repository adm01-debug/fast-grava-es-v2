import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTPMData } from './useTPMData';

describe('useTPMData', () => {
  it('should be defined', () => { expect(useTPMData).toBeDefined(); });
});
