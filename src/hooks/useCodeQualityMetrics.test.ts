import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCodeQualityMetrics } from './useCodeQualityMetrics';

describe('useCodeQualityMetrics', () => {
  it('should be defined', () => { expect(useCodeQualityMetrics).toBeDefined(); });
});
