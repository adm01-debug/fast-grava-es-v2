import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ABCJobCostsTable } from './ABCJobCostsTable';
import { JobCostSummary } from '@/hooks/useABCCosts';

const mockJobSummaries: JobCostSummary[] = [
  {
    job_id: 'job-1',
    order_number: 'ORD-001',
    client: 'Cliente ABC Ltda',
    product: 'Produto Premium X',
    quantity: 1000,
    total_cost: 25000,
    unit_cost: 25,
  },
  {
    job_id: 'job-2',
    order_number: 'ORD-002',
    client: 'Cliente XYZ S.A.',
    product: 'Produto Standard Y',
    quantity: 500,
    total_cost: 15000,
    unit_cost: 30,
  },
  {
    job_id: 'job-3',
    order_number: 'ORD-003',
    client: 'Cliente 123 ME',
    product: 'Produto Basic Z',
    quantity: 2000,
    total_cost: 10000,
    unit_cost: 5,
  },
];

describe('ABCJobCostsTable', () => {
  const mockOnRecalculate = vi.fn();
  const mockOnRecalculateAll = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the card with title', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      expect(screen.getByText('Custos por Job')).toBeInTheDocument();
    });

    it('should render recalculate all button', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      expect(screen.getByRole('button', { name: /recalcular todos/i })).toBeInTheDocument();
    });

    it('should render table headers', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      expect(screen.getByText('Pedido')).toBeInTheDocument();
      expect(screen.getByText('Cliente')).toBeInTheDocument();
      expect(screen.getByText('Produto')).toBeInTheDocument();
      expect(screen.getByText('Qtd')).toBeInTheDocument();
      expect(screen.getByText('Custo Total')).toBeInTheDocument();
      expect(screen.getByText('Custo Unit.')).toBeInTheDocument();
      expect(screen.getByText('Ações')).toBeInTheDocument();
    });

    it('should render all job summaries', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      expect(screen.getByText('ORD-001')).toBeInTheDocument();
      expect(screen.getByText('ORD-002')).toBeInTheDocument();
      expect(screen.getByText('ORD-003')).toBeInTheDocument();
    });

    it('should display client names', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      expect(screen.getByText('Cliente ABC Ltda')).toBeInTheDocument();
      expect(screen.getByText('Cliente XYZ S.A.')).toBeInTheDocument();
    });

    it('should display product names', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      expect(screen.getByText('Produto Premium X')).toBeInTheDocument();
      expect(screen.getByText('Produto Standard Y')).toBeInTheDocument();
    });

    it('should format quantities with locale', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      expect(screen.getByText('1.000')).toBeInTheDocument();
      expect(screen.getByText('2.000')).toBeInTheDocument();
    });

    it('should format total costs as currency', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      expect(screen.getByText('R$ 25.000,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 15.000,00')).toBeInTheDocument();
    });

    it('should format unit costs with 4 decimal places', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      expect(screen.getByText('R$ 25,0000')).toBeInTheDocument();
      expect(screen.getByText('R$ 30,0000')).toBeInTheDocument();
    });

    it('should render recalculate button for each row', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      // 3 individual recalculate buttons + 1 recalculate all
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
    });
  });

  describe('Sorting', () => {
    it('should sort jobs by total cost descending', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      const rows = screen.getAllByRole('row');
      // First data row (after header) should have highest cost
      expect(within(rows[1]).getByText('ORD-001')).toBeInTheDocument(); // 25000
      expect(within(rows[2]).getByText('ORD-002')).toBeInTheDocument(); // 15000
      expect(within(rows[3]).getByText('ORD-003')).toBeInTheDocument(); // 10000
    });
  });

  describe('Interactions', () => {
    it('should call onRecalculateAll when clicking recalculate all button', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      const recalculateAllButton = screen.getByRole('button', { name: /recalcular todos/i });
      await user.click(recalculateAllButton);

      expect(mockOnRecalculateAll).toHaveBeenCalledTimes(1);
    });

    it('should call onRecalculate with correct job id when clicking row button', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      // Get all row action buttons (excluding header button)
      const rows = screen.getAllByRole('row');
      const firstDataRow = rows[1];
      const recalculateButton = within(firstDataRow).getByRole('button');
      
      await user.click(recalculateButton);

      expect(mockOnRecalculate).toHaveBeenCalledWith('job-1');
    });

    it('should disable recalculate all button when isRecalculating is true', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={true}
        />
      );

      const recalculateAllButton = screen.getByRole('button', { name: /recalcular todos/i });
      expect(recalculateAllButton).toBeDisabled();
    });

    it('should show spinning icon when isRecalculating is true', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={true}
        />
      );

      const recalculateAllButton = screen.getByRole('button', { name: /recalcular todos/i });
      const icon = recalculateAllButton.querySelector('.animate-spin');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no job summaries', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={[]}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      expect(screen.getByText('Nenhum custo calculado ainda')).toBeInTheDocument();
    });

    it('should show calculate button in empty state', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={[]}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      expect(screen.getByRole('button', { name: /calcular custos/i })).toBeInTheDocument();
    });

    it('should call onRecalculateAll from empty state button', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCJobCostsTable
          jobSummaries={[]}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      const calculateButton = screen.getByRole('button', { name: /calcular custos/i });
      await user.click(calculateButton);

      expect(mockOnRecalculateAll).toHaveBeenCalledTimes(1);
    });

    it('should disable empty state button when isRecalculating', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={[]}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={true}
        />
      );

      const calculateButton = screen.getByRole('button', { name: /calcular custos/i });
      expect(calculateButton).toBeDisabled();
    });

    it('should not render table in empty state', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={[]}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('Pagination/Limit', () => {
    it('should limit display to 20 items', () => {
      const manyJobs: JobCostSummary[] = Array.from({ length: 25 }, (_, i) => ({
        job_id: `job-${i}`,
        order_number: `ORD-${String(i).padStart(3, '0')}`,
        client: `Cliente ${i}`,
        product: `Produto ${i}`,
        quantity: 100,
        total_cost: 1000 - i, // Decreasing to ensure order
        unit_cost: 10,
      }));

      render(
        <ABCJobCostsTable
          jobSummaries={manyJobs}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      const rows = screen.getAllByRole('row');
      // 1 header row + 20 data rows = 21
      expect(rows).toHaveLength(21);
    });
  });

  describe('Currency Formatting', () => {
    it('should format large costs correctly', () => {
      const largeCostJob: JobCostSummary[] = [{
        job_id: 'job-1',
        order_number: 'ORD-001',
        client: 'Cliente',
        product: 'Produto',
        quantity: 1,
        total_cost: 1234567.89,
        unit_cost: 1234567.89,
      }];

      render(
        <ABCJobCostsTable
          jobSummaries={largeCostJob}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      expect(screen.getByText('R$ 1.234.567,89')).toBeInTheDocument();
    });

    it('should format small unit costs correctly', () => {
      const smallCostJob: JobCostSummary[] = [{
        job_id: 'job-1',
        order_number: 'ORD-001',
        client: 'Cliente',
        product: 'Produto',
        quantity: 10000,
        total_cost: 1,
        unit_cost: 0.0001,
      }];

      render(
        <ABCJobCostsTable
          jobSummaries={smallCostJob}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      expect(screen.getByText('R$ 0,0001')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible table structure', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('rowgroup')).toHaveLength(2); // thead and tbody
      expect(screen.getAllByRole('columnheader')).toHaveLength(7);
    });

    it('should have accessible heading', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      expect(screen.getByRole('heading', { name: /custos por job/i })).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeEnabled();
      });
    });
  });

  describe('Order Number Badge', () => {
    it('should render order numbers as badges', () => {
      render(
        <ABCJobCostsTable
          jobSummaries={mockJobSummaries}
          onRecalculate={mockOnRecalculate}
          onRecalculateAll={mockOnRecalculateAll}
          isRecalculating={false}
        />
      );

      const orderBadge = screen.getByText('ORD-001');
      expect(orderBadge).toBeInTheDocument();
    });
  });
});
