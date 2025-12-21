import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOperatorDashboardData } from './useOperatorDashboardData';

describe('useOperatorDashboardData', () => {
  it('should be defined', () => { expect(useOperatorDashboardData).toBeDefined(); });
});
