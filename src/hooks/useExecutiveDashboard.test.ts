import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useExecutiveDashboard } from './useExecutiveDashboard';

describe('useExecutiveDashboard', () => {
  it('should be defined', () => { expect(useExecutiveDashboard).toBeDefined(); });
});
