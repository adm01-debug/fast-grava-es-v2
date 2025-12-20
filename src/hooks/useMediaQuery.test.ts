import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const matchMediaMock = vi.fn((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', { writable: true, value: matchMediaMock });

import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    matchMediaMock.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('should return false when query does not match', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('should return true when query matches', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('should handle mobile query', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(typeof result.current).toBe('boolean');
  });

  it('should handle desktop query', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(typeof result.current).toBe('boolean');
  });
});
