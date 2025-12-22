import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEmailReports } from './useEmailReports';

describe('useEmailReports', () => {
  it('should be defined', () => { expect(useEmailReports).toBeDefined(); });
});
