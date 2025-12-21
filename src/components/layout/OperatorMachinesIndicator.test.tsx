import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OperatorMachinesIndicator } from './OperatorMachinesIndicator';

describe('OperatorMachinesIndicator', () => {
  it('should show machine count', () => {
    render(<OperatorMachinesIndicator machines={['CNC-01', 'CNC-02']} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should list machine names', () => {
    render(<OperatorMachinesIndicator machines={['CNC-01', 'CNC-02']} />);
    expect(screen.getByText(/CNC-01/)).toBeInTheDocument();
  });

  it('should show empty state', () => {
    render(<OperatorMachinesIndicator machines={[]} />);
    expect(screen.getByText(/nenhuma máquina|sem máquinas/i)).toBeInTheDocument();
  });
});
