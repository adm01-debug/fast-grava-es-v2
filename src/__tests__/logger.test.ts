import { describe, it, expect, vi } from 'vitest';
import { logger } from '@/lib/logger';

describe('logger', () => {
  it('has all log methods', () => {
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('debug logs in dev mode', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    logger.debug('test message', { key: 'value' }, 'TestContext');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('info logs in dev mode', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('test info');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('warn logs in dev mode', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('test warning');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('error logs in dev mode', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('test error', new Error('boom'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('includes context in formatted output', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    logger.debug('msg', undefined, 'MyModule');
    const call = spy.mock.calls[0]?.[0] as string;
    expect(call).toContain('[MyModule]');
    spy.mockRestore();
  });

  it('handles undefined data gracefully', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    expect(() => logger.info('no data')).not.toThrow();
    spy.mockRestore();
  });
});
