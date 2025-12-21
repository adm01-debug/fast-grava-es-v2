import { describe, it, expect } from 'vitest';
import { initSentry, captureException, captureMessage } from './sentry';

describe('sentry', () => {
  it('initSentry should be defined', () => { expect(initSentry).toBeDefined(); });
  it('captureException should be defined', () => { expect(captureException).toBeDefined(); });
  it('captureMessage should be defined', () => { expect(captureMessage).toBeDefined(); });
});
