import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OEEMachineTable } from './OEEMachineTable';

const mockMachines = [
  { id: '1', name: 'CNC-01', oee: 85, availability: 90, performance: 95, quality: 99 },
  { id: '2', name: 'CNC-02', oee: 75, availability: 80, performance: 90, quality: 95 },
];

describe('OEEMachineTable', () => {
  it('should render table', () => {
    render(<OEEMachineTable machines={mockMachines} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should display machine names', () => {
    render(<OEEMachineTable machines={mockMachines} />);
    expect(screen.getByText('CNC-01')).toBeInTheDocument();
  });

  it('should show OEE values', () => {
    render(<OEEMachineTable machines={mockMachines} />);
    expect(screen.getByText(/85/)).toBeInTheDocument();
  });

  it('should have headers for all OEE components', () => {
    render(<OEEMachineTable machines={mockMachines} />);
    expect(screen.getByText(/disponibilidade/i)).toBeInTheDocument();
    expect(screen.getByText(/performance/i)).toBeInTheDocument();
    expect(screen.getByText(/qualidade/i)).toBeInTheDocument();
  });
});
