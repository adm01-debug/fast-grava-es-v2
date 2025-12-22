import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePushSubscription } from './usePushSubscription';

describe('usePushSubscription', () => {
  it('should be defined', () => { expect(usePushSubscription).toBeDefined(); });
});
