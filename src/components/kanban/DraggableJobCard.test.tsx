import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DraggableJobCard } from './DraggableJobCard';

const mockJob = { id: '1', order_number: 'ORD-001', client: 'Cliente A', status: 'pending', priority: 'high' };

describe('DraggableJobCard', () => {
  it('should render job card', () => {
    render(<DraggableJobCard job={mockJob} />);
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
  });

  it('should show client name', () => {
    render(<DraggableJobCard job={mockJob} />);
    expect(screen.getByText('Cliente A')).toBeInTheDocument();
  });

  it('should indicate priority', () => {
    render(<DraggableJobCard job={mockJob} />);
    expect(screen.getByText(/alta|high/i)).toBeInTheDocument();
  });

  it('should be draggable', () => {
    render(<DraggableJobCard job={mockJob} />);
    expect(document.querySelector('[draggable]')).toBeInTheDocument();
  });
});
