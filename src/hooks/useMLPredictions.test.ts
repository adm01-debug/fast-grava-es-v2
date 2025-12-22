import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMLPredictions } from './useMLPredictions';

describe('useMLPredictions', () => {
  it('should be defined', () => { expect(useMLPredictions).toBeDefined(); });
});
