import { describe, it, expect } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  it('should have info method', () => { expect(logger.info).toBeDefined(); });
  it('should have error method', () => { expect(logger.error).toBeDefined(); });
  it('should have warn method', () => { expect(logger.warn).toBeDefined(); });
});
