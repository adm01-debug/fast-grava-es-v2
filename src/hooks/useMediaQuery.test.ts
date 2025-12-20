import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery, useIsMobile, useIsDesktop, useBreakpoint } from './useMediaQuery';

const createMatchMedia = (matches: boolean) => ({
  matches,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when media query matches', () => {
    window.matchMedia = vi.fn().mockImplementation(() => createMatchMedia(true));
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('should return false when media query does not match', () => {
    window.matchMedia = vi.fn().mockImplementation(() => createMatchMedia(false));
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('should update when media query changes', () => {
    let callback: any;
    const matchMedia = {
      matches: false,
      addEventListener: vi.fn((_, cb) => { callback = cb; }),
      removeEventListener: vi.fn(),
    };
    window.matchMedia = vi.fn().mockImplementation(() => matchMedia);

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    act(() => {
      matchMedia.matches = true;
      callback();
    });
  });
});

describe('useIsMobile', () => {
  it('should return true for mobile viewport', () => {
    window.matchMedia = vi.fn().mockImplementation(() => createMatchMedia(true));
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });
});

describe('useIsDesktop', () => {
  it('should return true for desktop viewport', () => {
    window.matchMedia = vi.fn().mockImplementation(() => createMatchMedia(true));
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(true);
  });
});

describe('useBreakpoint', () => {
  it('should return mobile for small screens', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => {
      if (query.includes('max-width: 767px')) return createMatchMedia(true);
      return createMatchMedia(false);
    });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('mobile');
  });
});
