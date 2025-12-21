import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

describe('ThemeContext', () => {
  it('should provide theme state', () => {
    const wrapper = ({ children }: any) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current).toHaveProperty('theme');
  });
  it('should provide toggleTheme function', () => {
    const wrapper = ({ children }: any) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(typeof result.current.toggleTheme).toBe('function');
  });
});
