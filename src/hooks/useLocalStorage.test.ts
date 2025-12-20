import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

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

describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should return stored value from localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));
    expect(result.current[0]).toBe('stored');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));
    act(() => { result.current[1]('updated'); });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('key', JSON.stringify('updated'));
    expect(result.current[0]).toBe('updated');
  });

  it('should support function updater', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0));
    act(() => { result.current[1](prev => prev + 1); });
    expect(result.current[0]).toBe(1);
  });

  it('should remove value from localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));
    act(() => { result.current[1]('value'); });
    act(() => { result.current[2](); });
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('key');
    expect(result.current[0]).toBe('initial');
  });

  it('should handle objects', () => {
    const initialObj = { name: 'Test', count: 0 };
    const { result } = renderHook(() => useLocalStorage('obj', initialObj));
    act(() => { result.current[1]({ name: 'Updated', count: 5 }); });
    expect(result.current[0]).toEqual({ name: 'Updated', count: 5 });
  });

  it('should handle arrays', () => {
    const { result } = renderHook(() => useLocalStorage('arr', [1, 2, 3]));
    act(() => { result.current[1]([4, 5, 6]); });
    expect(result.current[0]).toEqual([4, 5, 6]);
  });
});
