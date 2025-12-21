import { describe, it, expect, vi } from 'vitest';
import { trackEvent, trackPageView, setUserId } from './analytics';

describe('analytics', () => {
  it('trackEvent should be defined', () => { expect(trackEvent).toBeDefined(); });
  it('trackPageView should be defined', () => { expect(trackPageView).toBeDefined(); });
  it('setUserId should be defined', () => { expect(setUserId).toBeDefined(); });
});
