import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductionRegistrationModal } from './ProductionRegistrationModal';

describe('ProductionRegistrationModal', () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  it('should render when open', () => {
    render(<ProductionRegistrationModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.getByText(/registro|produção/i)).toBeInTheDocument();
  });

  it('should have quantity input', () => {
    render(<ProductionRegistrationModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/quantidade/i)).toBeInTheDocument();
  });

  it('should have submit button', () => {
    render(<ProductionRegistrationModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('button', { name: /registrar|salvar/i })).toBeInTheDocument();
  });

  it('should call onSubmit when submitting', async () => {
    render(<ProductionRegistrationModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    await userEvent.type(screen.getByLabelText(/quantidade/i), '100');
    await userEvent.click(screen.getByRole('button', { name: /registrar|salvar/i }));
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should call onClose when canceling', async () => {
    render(<ProductionRegistrationModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
