import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LotDetailsModal } from './LotDetailsModal';

const mockLot = { id: '1', lotNumber: 'LOT-001', product: 'Produto X', quantity: 500, status: 'active', createdAt: new Date().toISOString() };

describe('LotDetailsModal', () => {
  it('should show lot number', () => {
    render(<LotDetailsModal lot={mockLot} isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('LOT-001')).toBeInTheDocument();
  });
  it('should show product', () => {
    render(<LotDetailsModal lot={mockLot} isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Produto X')).toBeInTheDocument();
  });
});
