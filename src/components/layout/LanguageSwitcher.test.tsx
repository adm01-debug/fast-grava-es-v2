import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('should render current language', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText(/pt|en|es/i)).toBeInTheDocument();
  });

  it('should show language options on click', async () => {
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/português|english|español/i)).toBeInTheDocument();
  });
});
