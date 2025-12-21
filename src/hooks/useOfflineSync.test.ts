import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOfflineSync } from './useOfflineSync';

describe('useOfflineSync', () => {
  it('should be defined', () => { expect(useOfflineSync).toBeDefined(); });
});
