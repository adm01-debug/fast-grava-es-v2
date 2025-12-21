import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreateScheduleModal } from './CreateScheduleModal';

describe('CreateScheduleModal', () => {
  it('should render when open', () => {
    render(<CreateScheduleModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);
    expect(screen.getByText(/agendar|manutenção/i)).toBeInTheDocument();
  });
  it('should have machine selection', () => {
    render(<CreateScheduleModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);
    expect(screen.getByLabelText(/máquina/i)).toBeInTheDocument();
  });
});
