import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HandoverDetailsModal } from './HandoverDetailsModal';

const mockHandover = { id: '1', fromShift: 'Manhã', toShift: 'Tarde', notes: 'Tudo ok', createdAt: new Date().toISOString() };

describe('HandoverDetailsModal', () => {
  it('should show handover details', () => {
    render(<HandoverDetailsModal handover={mockHandover} isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Tudo ok')).toBeInTheDocument();
  });
  it('should show shifts', () => {
    render(<HandoverDetailsModal handover={mockHandover} isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Manhã/)).toBeInTheDocument();
  });
});
