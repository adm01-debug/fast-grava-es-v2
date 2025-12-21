import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ABCCostPoolsCard } from './ABCCostPoolsCard';
import { ABCCostPool } from '@/hooks/useABCCosts';

const mockCostPools: ABCCostPool[] = [
  {
    id: 'pool-1',
    name: 'Pool de Produção',
    description: 'Custos de produção',
    pool_type: 'machine',
    monthly_budget: 50000,
    total_cost: 45000,
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pool-2',
    name: 'Pool de Mão de Obra',
    description: 'Custos de mão de obra',
    pool_type: 'direct_labor',
    monthly_budget: 30000,
    total_cost: 28000,
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pool-3',
    name: 'Pool Overhead',
    description: 'Custos indiretos',
    pool_type: 'overhead',
    monthly_budget: 20000,
    total_cost: 18000,
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    created_at: '2024-01-01T00:00:00Z',
  },
];

describe('ABCCostPoolsCard', () => {
  const mockOnUpdateBudget = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the card with title', () => {
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      expect(screen.getByText('Pools de Custo')).toBeInTheDocument();
    });

    it('should display total budget', () => {
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      expect(screen.getByText('Orçamento Total')).toBeInTheDocument();
      // 50000 + 30000 + 20000 = 100000
      expect(screen.getByText('R$ 100.000,00')).toBeInTheDocument();
    });

    it('should display total allocated', () => {
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      expect(screen.getByText('Alocado')).toBeInTheDocument();
      expect(screen.getByText('R$ 91.000,00')).toBeInTheDocument();
    });

    it('should render all cost pools', () => {
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      expect(screen.getByText('Pool de Produção')).toBeInTheDocument();
      expect(screen.getByText('Pool de Mão de Obra')).toBeInTheDocument();
      expect(screen.getByText('Pool Overhead')).toBeInTheDocument();
    });

    it('should display pool type labels correctly', () => {
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      expect(screen.getByText('Máquina')).toBeInTheDocument();
      expect(screen.getByText('Mão de Obra')).toBeInTheDocument();
      expect(screen.getByText('Overhead')).toBeInTheDocument();
    });

    it('should display individual pool budgets', () => {
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      expect(screen.getByText('R$ 50.000,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 30.000,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 20.000,00')).toBeInTheDocument();
    });

    it('should display budget percentages', () => {
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      expect(screen.getByText('50.0% do orçamento total')).toBeInTheDocument();
      expect(screen.getByText('30.0% do orçamento total')).toBeInTheDocument();
      expect(screen.getByText('20.0% do orçamento total')).toBeInTheDocument();
    });

    it('should render edit buttons for each pool', () => {
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      const editButtons = screen.getAllByRole('button');
      expect(editButtons).toHaveLength(mockCostPools.length);
    });

    it('should render progress bars', () => {
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars).toHaveLength(mockCostPools.length);
    });
  });

  describe('Edit Mode', () => {
    it('should enter edit mode when clicking edit button', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      const editButtons = screen.getAllByRole('button');
      await user.click(editButtons[0]);

      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('should pre-fill input with current budget value', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      const editButtons = screen.getAllByRole('button');
      await user.click(editButtons[0]);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(50000);
    });

    it('should allow editing the budget value', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      const editButtons = screen.getAllByRole('button');
      await user.click(editButtons[0]);

      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '55000');

      expect(input).toHaveValue(55000);
    });

    it('should call onUpdateBudget when saving', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      const editButtons = screen.getAllByRole('button');
      await user.click(editButtons[0]);

      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '55000');

      // Find save button (second button after edit)
      const allButtons = screen.getAllByRole('button');
      const saveButton = allButtons.find(btn => btn.querySelector('svg'));
      
      if (saveButton) {
        await user.click(saveButton);
      }

      await waitFor(() => {
        expect(mockOnUpdateBudget).toHaveBeenCalledWith('pool-1', 55000);
      });
    });

    it('should exit edit mode after saving', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      const editButtons = screen.getAllByRole('button');
      await user.click(editButtons[0]);

      const allButtons = screen.getAllByRole('button');
      const saveButton = allButtons.find(btn => btn.querySelector('svg'));
      
      if (saveButton) {
        await user.click(saveButton);
      }

      await waitFor(() => {
        expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
      });
    });

    it('should handle empty input as zero', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      const editButtons = screen.getAllByRole('button');
      await user.click(editButtons[0]);

      const input = screen.getByRole('spinbutton');
      await user.clear(input);

      const allButtons = screen.getAllByRole('button');
      const saveButton = allButtons.find(btn => btn.querySelector('svg'));
      
      if (saveButton) {
        await user.click(saveButton);
      }

      await waitFor(() => {
        expect(mockOnUpdateBudget).toHaveBeenCalledWith('pool-1', 0);
      });
    });
  });

  describe('Pool Type Colors', () => {
    it('should apply correct color for machine type', () => {
      render(
        <ABCCostPoolsCard
          costPools={[mockCostPools[0]]}
          totalAllocated={45000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      const colorIndicator = document.querySelector('.bg-emerald-500');
      expect(colorIndicator).toBeInTheDocument();
    });

    it('should apply correct color for direct_labor type', () => {
      render(
        <ABCCostPoolsCard
          costPools={[mockCostPools[1]]}
          totalAllocated={28000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      const colorIndicator = document.querySelector('.bg-blue-500');
      expect(colorIndicator).toBeInTheDocument();
    });

    it('should apply correct color for overhead type', () => {
      render(
        <ABCCostPoolsCard
          costPools={[mockCostPools[2]]}
          totalAllocated={18000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      const colorIndicator = document.querySelector('.bg-amber-500');
      expect(colorIndicator).toBeInTheDocument();
    });

    it('should apply fallback color for unknown type', () => {
      const unknownTypePool: ABCCostPool[] = [{
        ...mockCostPools[0],
        pool_type: 'custom_type' as any,
      }];

      render(
        <ABCCostPoolsCard
          costPools={unknownTypePool}
          totalAllocated={45000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      const colorIndicator = document.querySelector('.bg-gray-500');
      expect(colorIndicator).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render card with zero totals when no pools', () => {
      render(
        <ABCCostPoolsCard
          costPools={[]}
          totalAllocated={0}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      expect(screen.getByText('Pools de Custo')).toBeInTheDocument();
      expect(screen.getByText('R$ 0,00')).toBeInTheDocument();
    });

    it('should not render any edit buttons when no pools', () => {
      render(
        <ABCCostPoolsCard
          costPools={[]}
          totalAllocated={0}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Percentage Calculations', () => {
    it('should calculate percentages correctly', () => {
      const equalPools: ABCCostPool[] = [
        { ...mockCostPools[0], monthly_budget: 25000 },
        { ...mockCostPools[1], monthly_budget: 25000 },
        { ...mockCostPools[2], monthly_budget: 50000 },
      ];

      render(
        <ABCCostPoolsCard
          costPools={equalPools}
          totalAllocated={100000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      expect(screen.getByText('25.0% do orçamento total')).toBeInTheDocument();
      expect(screen.getByText('50.0% do orçamento total')).toBeInTheDocument();
    });

    it('should handle zero total budget gracefully', () => {
      const zeroBudgetPools: ABCCostPool[] = [
        { ...mockCostPools[0], monthly_budget: 0 },
      ];

      render(
        <ABCCostPoolsCard
          costPools={zeroBudgetPools}
          totalAllocated={0}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      expect(screen.getByText('0.0% do orçamento total')).toBeInTheDocument();
    });
  });

  describe('Currency Formatting', () => {
    it('should format large numbers correctly', () => {
      const largeBudgetPool: ABCCostPool[] = [{
        ...mockCostPools[0],
        monthly_budget: 1234567.89,
      }];

      render(
        <ABCCostPoolsCard
          costPools={largeBudgetPool}
          totalAllocated={1000000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      expect(screen.getByText('R$ 1.234.567,89')).toBeInTheDocument();
    });

    it('should format small numbers correctly', () => {
      const smallBudgetPool: ABCCostPool[] = [{
        ...mockCostPools[0],
        monthly_budget: 0.50,
      }];

      render(
        <ABCCostPoolsCard
          costPools={smallBudgetPool}
          totalAllocated={0.25}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      expect(screen.getByText('R$ 0,50')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible heading', () => {
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      expect(screen.getByRole('heading', { name: /pools de custo/i })).toBeInTheDocument();
    });

    it('should have accessible progress bars', () => {
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      const progressBars = screen.getAllByRole('progressbar');
      progressBars.forEach(bar => {
        expect(bar).toBeInTheDocument();
      });
    });

    it('should have accessible input in edit mode', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCCostPoolsCard
          costPools={mockCostPools}
          totalAllocated={91000}
          onUpdateBudget={mockOnUpdateBudget}
        />
      );

      const editButtons = screen.getAllByRole('button');
      await user.click(editButtons[0]);

      const input = screen.getByRole('spinbutton');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'number');
    });
  });
});
