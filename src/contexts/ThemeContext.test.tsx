import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';
import React from 'react';

const TestComponent = () => {
  const { theme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => { localStorage.clear(); });

  it('provides theme context with default value', () => {
    render(<ThemeProvider><TestComponent /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('changes theme', () => {
    render(<ThemeProvider><TestComponent /></ThemeProvider>);
    act(() => screen.getByText('Dark').click());
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('toggles theme', () => {
    render(<ThemeProvider><TestComponent /></ThemeProvider>);
    act(() => screen.getByText('Toggle').click());
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });
});
