import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('should render toggle button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should toggle theme on click', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button'));
    // Theme should change
  });

  it('should show current theme indicator', () => {
    render(<ThemeToggle />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
});
