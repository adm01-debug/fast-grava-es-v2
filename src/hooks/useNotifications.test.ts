import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNotifications } from './useNotifications';

describe('useNotifications', () => {
  it('should be defined', () => { expect(useNotifications).toBeDefined(); });
});
