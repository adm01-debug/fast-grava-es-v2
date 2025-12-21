import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DragOverlayCard } from './DragOverlayCard';

const mockJob = { id: '1', order_number: 'ORD-001', client: 'Cliente', priority: 'high' };

describe('DragOverlayCard', () => {
  it('should render job info', () => {
    render(<DragOverlayCard job={mockJob} />);
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
  });

  it('should show client name', () => {
    render(<DragOverlayCard job={mockJob} />);
    expect(screen.getByText('Cliente')).toBeInTheDocument();
  });

  it('should have overlay styling', () => {
    render(<DragOverlayCard job={mockJob} />);
    expect(document.querySelector('.shadow-lg, .opacity-90')).toBeInTheDocument();
  });
});
