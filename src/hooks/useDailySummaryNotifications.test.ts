import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDailySummaryNotifications } from './useDailySummaryNotifications';

describe('useDailySummaryNotifications', () => {
  it('should be defined', () => { expect(useDailySummaryNotifications).toBeDefined(); });
});
