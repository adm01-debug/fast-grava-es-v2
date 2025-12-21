import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TPMAlertsPanel } from './TPMAlertsPanel';

const mockAlerts = [
  { id: '1', machine: 'CNC-01', type: 'overdue', message: 'Manutenção atrasada' },
];

describe('TPMAlertsPanel', () => {
  it('should render alerts', () => {
    render(<TPMAlertsPanel alerts={mockAlerts} />);
    expect(screen.getByText(/alertas|TPM/i)).toBeInTheDocument();
  });
  it('should show machine name', () => {
    render(<TPMAlertsPanel alerts={mockAlerts} />);
    expect(screen.getByText('CNC-01')).toBeInTheDocument();
  });
});
