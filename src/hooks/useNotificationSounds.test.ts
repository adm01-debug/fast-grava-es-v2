import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNotificationSounds } from './useNotificationSounds';

describe('useNotificationSounds', () => {
  it('should be defined', () => { expect(useNotificationSounds).toBeDefined(); });
});
