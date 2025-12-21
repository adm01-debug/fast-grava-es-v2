import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodayTimeline } from './TodayTimeline';

const mockEvents = [
  { id: '1', time: '08:00', title: 'Início Turno', type: 'shift' },
  { id: '2', time: '08:30', title: 'Setup CNC-01', type: 'setup' },
  { id: '3', time: '09:00', title: 'Produção Lote A', type: 'production' },
  { id: '4', time: '12:00', title: 'Almoço', type: 'break' },
];

describe('TodayTimeline', () => {
  it('should render timeline', () => {
    render(<TodayTimeline events={mockEvents} />);
    expect(screen.getByText(/hoje|timeline/i)).toBeInTheDocument();
  });

  it('should display all events', () => {
    render(<TodayTimeline events={mockEvents} />);
    expect(screen.getByText('Início Turno')).toBeInTheDocument();
    expect(screen.getByText('Setup CNC-01')).toBeInTheDocument();
  });

  it('should show event times', () => {
    render(<TodayTimeline events={mockEvents} />);
    expect(screen.getByText('08:00')).toBeInTheDocument();
    expect(screen.getByText('09:00')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(<TodayTimeline events={[]} />);
    expect(screen.getByText(/nenhum evento|sem eventos/i)).toBeInTheDocument();
  });

  it('should indicate current time', () => {
    render(<TodayTimeline events={mockEvents} showCurrentTime />);
    expect(document.querySelector('[data-current-time]')).toBeInTheDocument();
  });
});
