import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TPMCalendar } from './TPMCalendar';

describe('TPMCalendar', () => {
  it('should render calendar', () => {
    render(<TPMCalendar events={[]} />);
    expect(screen.getByText(/calendário|manutenção/i)).toBeInTheDocument();
  });
  it('should have navigation', () => {
    render(<TPMCalendar events={[]} />);
    expect(screen.getByRole('button', { name: /anterior|previous/i })).toBeInTheDocument();
  });
});
