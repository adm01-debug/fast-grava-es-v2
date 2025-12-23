import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreateScheduleModal } from './CreateScheduleModal';

const mockMachines = [
  { id: 'm1', name: 'Máquina 1', code: 'M001' },
  { id: 'm2', name: 'Máquina 2', code: 'M002' },
];

const mockMaintenanceTypes = [
  { id: 'mt1', name: 'Preventiva', description: null, default_interval_days: 30, color: '#00ff00', created_at: '2025-01-01' },
  { id: 'mt2', name: 'Corretiva', description: null, default_interval_days: 7, color: '#ff0000', created_at: '2025-01-01' },
];

describe('CreateScheduleModal', () => {
  it('should render trigger button', () => {
    render(
      <CreateScheduleModal 
        machines={mockMachines} 
        maintenanceTypes={mockMaintenanceTypes} 
        onSubmit={vi.fn()} 
        isSubmitting={false} 
      />
    );
    expect(screen.getByText(/agendar manutenção/i)).toBeInTheDocument();
  });
  
  it('should be disabled when submitting', () => {
    render(
      <CreateScheduleModal 
        machines={mockMachines} 
        maintenanceTypes={mockMaintenanceTypes} 
        onSubmit={vi.fn()} 
        isSubmitting={true} 
      />
    );
    expect(screen.getByText(/agendar manutenção/i)).toBeInTheDocument();
  });
});
