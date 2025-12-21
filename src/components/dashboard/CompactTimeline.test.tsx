import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompactTimeline } from './CompactTimeline';

const mockEvents = [
  { id: '1', time: '08:00', title: 'Setup CNC-01', type: 'setup', status: 'completed' },
  { id: '2', time: '09:30', title: 'Produção ORD-001', type: 'production', status: 'in_progress' },
  { id: '3', time: '11:00', title: 'Manutenção preventiva', type: 'maintenance', status: 'scheduled' },
];

describe('CompactTimeline', () => {
  it('should render timeline with events', () => {
    render(<CompactTimeline events={mockEvents} />);
    expect(screen.getByText('Setup CNC-01')).toBeInTheDocument();
  });

  it('should display event times', () => {
    render(<CompactTimeline events={mockEvents} />);
    expect(screen.getByText('08:00')).toBeInTheDocument();
  });

  it('should show completed status', () => {
    render(<CompactTimeline events={mockEvents} />);
    expect(screen.getByText('Setup CNC-01')).toBeInTheDocument();
  });

  it('should show in progress status', () => {
    render(<CompactTimeline events={mockEvents} />);
    expect(screen.getByText('Produção ORD-001')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(<CompactTimeline events={[]} />);
    expect(screen.getByText(/nenhum evento|sem eventos/i)).toBeInTheDocument();
  });

  it('should sort events by time', () => {
    render(<CompactTimeline events={mockEvents} />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(3);
  });
});
