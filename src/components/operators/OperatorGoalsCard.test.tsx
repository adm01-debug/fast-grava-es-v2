import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OperatorGoalsCard } from './OperatorGoalsCard';
import { TooltipProvider } from '@/components/ui/tooltip';
import { OperatorProductivityMetrics } from '@/hooks/useOperatorProductivity';
import { OperatorGoal } from '@/hooks/useOperatorGoals';

const mockGoals: OperatorGoal[] = [
  { 
    id: '1', 
    operator_id: 'op1',
    goal_type: 'efficiency',
    target_value: 90,
    period_start: '2025-01-01',
    period_end: '2025-01-31',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    created_by: null,
  },
];

const mockMetrics: OperatorProductivityMetrics = {
  operatorId: 'op1',
  operatorName: 'João',
  avatarUrl: null,
  isActive: true,
  totalJobsCompleted: 10,
  totalJobsInProgress: 2,
  totalPiecesProduced: 750,
  totalPiecesLost: 20,
  lossRate: 2.5,
  totalProductionTimeMinutes: 480,
  averageJobDurationMinutes: 45,
  estimatedVsActualRatio: 0.95,
  efficiencyScore: 85,
  productionVelocity: 100,
  totalScans: 50,
  startActions: 15,
  finishActions: 12,
  pauseActions: 8,
  assignedMachines: 2,
  machineNames: ['Máquina 1', 'Máquina 2'],
};

describe('OperatorGoalsCard', () => {
  it('should render goals', () => {
    render(
      <TooltipProvider>
        <OperatorGoalsCard goals={mockGoals} metrics={mockMetrics} />
      </TooltipProvider>
    );
    expect(screen.getByText(/metas/i)).toBeInTheDocument();
  });
  
  it('should show progress', () => {
    render(
      <TooltipProvider>
        <OperatorGoalsCard goals={mockGoals} metrics={mockMetrics} />
      </TooltipProvider>
    );
    expect(screen.getByText(/atingidas/i)).toBeInTheDocument();
  });
  
  it('should return null for empty goals', () => {
    const { container } = render(
      <TooltipProvider>
        <OperatorGoalsCard goals={[]} metrics={mockMetrics} />
      </TooltipProvider>
    );
    expect(container.firstChild).toBeNull();
  });
});
