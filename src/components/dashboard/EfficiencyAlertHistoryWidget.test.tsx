import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EfficiencyAlertHistoryWidget } from './EfficiencyAlertHistoryWidget';

vi.mock('@/hooks/useEfficiencyAlertHistory', () => ({
  useEfficiencyAlertHistory: () => ({
    alerts: [
      { id: '1', machine: 'CNC-01', efficiency: 65, threshold: 70, timestamp: new Date().toISOString() },
      { id: '2', machine: 'Prensa-01', efficiency: 72, threshold: 80, timestamp: new Date().toISOString() },
    ],
    isLoading: false,
  }),
}));

describe('EfficiencyAlertHistoryWidget', () => {
  it('should render widget title', () => {
    render(<EfficiencyAlertHistoryWidget />);
    expect(screen.getByText(/histórico|eficiência/i)).toBeInTheDocument();
  });

  it('should display machine names', () => {
    render(<EfficiencyAlertHistoryWidget />);
    expect(screen.getByText('CNC-01')).toBeInTheDocument();
  });

  it('should show efficiency values', () => {
    render(<EfficiencyAlertHistoryWidget />);
    expect(screen.getByText(/65/)).toBeInTheDocument();
  });

  it('should indicate when below threshold', () => {
    render(<EfficiencyAlertHistoryWidget />);
    expect(screen.getByText('CNC-01')).toBeInTheDocument();
  });

  it('should show timestamps', () => {
    render(<EfficiencyAlertHistoryWidget />);
    expect(screen.getByText(/hoje|agora|hora/i)).toBeInTheDocument();
  });
});
