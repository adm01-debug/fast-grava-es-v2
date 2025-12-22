import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDashboardLayout } from './useDashboardLayout';

describe('useDashboardLayout', () => {
  it('should be defined', () => { expect(useDashboardLayout).toBeDefined(); });
});
