import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JobDetailsModal } from './JobDetailsModal';

const mockJob = {
  id: '1', order_number: 'ORD-001', client: 'Cliente A', product: 'Produto X',
  quantity: 1000, status: 'in_progress', technique: 'Serigrafia',
  created_at: new Date().toISOString()
};

describe('JobDetailsModal', () => {
  const mockOnClose = vi.fn();

  it('should render when open', () => {
    render(<JobDetailsModal job={mockJob} isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<JobDetailsModal job={mockJob} isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('ORD-001')).not.toBeInTheDocument();
  });

  it('should display job details', () => {
    render(<JobDetailsModal job={mockJob} isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Cliente A')).toBeInTheDocument();
    expect(screen.getByText('Produto X')).toBeInTheDocument();
  });

  it('should show quantity', () => {
    render(<JobDetailsModal job={mockJob} isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('1.000')).toBeInTheDocument();
  });

  it('should call onClose when closing', async () => {
    render(<JobDetailsModal job={mockJob} isOpen={true} onClose={mockOnClose} />);
    const closeBtn = screen.getByRole('button', { name: /fechar|close/i });
    await userEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
