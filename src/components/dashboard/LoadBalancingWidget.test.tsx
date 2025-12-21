import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadBalancingWidget } from './LoadBalancingWidget';

vi.mock('@/hooks/useLoadBalancing', () => ({
  useLoadBalancing: () => ({
    machines: [
      { id: '1', name: 'CNC-01', load: 85, capacity: 100, status: 'high' },
      { id: '2', name: 'CNC-02', load: 45, capacity: 100, status: 'normal' },
      { id: '3', name: 'Prensa-01', load: 20, capacity: 100, status: 'low' },
    ],
    isLoading: false,
  }),
}));

describe('LoadBalancingWidget', () => {
  it('should render widget', () => {
    render(<LoadBalancingWidget />);
    expect(screen.getByText(/balanceamento|carga/i)).toBeInTheDocument();
  });

  it('should display machine names', () => {
    render(<LoadBalancingWidget />);
    expect(screen.getByText('CNC-01')).toBeInTheDocument();
    expect(screen.getByText('CNC-02')).toBeInTheDocument();
  });

  it('should show load percentages', () => {
    render(<LoadBalancingWidget />);
    expect(screen.getByText(/85/)).toBeInTheDocument();
    expect(screen.getByText(/45/)).toBeInTheDocument();
  });

  it('should indicate high load machines', () => {
    render(<LoadBalancingWidget />);
    const cnc01 = screen.getByText('CNC-01').closest('div');
    expect(cnc01).toBeInTheDocument();
  });

  it('should indicate low load machines', () => {
    render(<LoadBalancingWidget />);
    const prensa = screen.getByText('Prensa-01').closest('div');
    expect(prensa).toBeInTheDocument();
  });

  it('should render progress bars', () => {
    render(<LoadBalancingWidget />);
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);
  });
});
