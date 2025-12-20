import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should return initial value when no stored value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should return stored value', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('stored');
  });

  it('should update localStorage on setValue', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('updated'));
  });

  it('should handle function updater', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));
    
    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('should remove value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[2](); // remove function
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
  });

  it('should handle objects', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', { name: 'test' }));
    
    act(() => {
      result.current[1]({ name: 'updated' });
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify({ name: 'updated' }));
  });

  it('should handle arrays', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', [1, 2, 3]));
    
    act(() => {
      result.current[1]([4, 5, 6]);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify([4, 5, 6]));
  });
});
