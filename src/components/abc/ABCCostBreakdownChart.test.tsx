import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ABCCostBreakdownChart } from './ABCCostBreakdownChart';
import { ABCCostPool, ABCJobCost } from '@/hooks/useABCCosts';

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ data, children }: { data: any[]; children: React.ReactNode }) => (
    <div data-testid="pie" data-count={data?.length}>
      {children}
    </div>
  ),
  Cell: ({ fill }: { fill: string }) => <div data-testid="cell" data-fill={fill} />,
  Legend: () => <div data-testid="legend" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

const mockCostPools: ABCCostPool[] = [
  {
    id: 'pool-1',
    name: 'Pool de Produção',
    description: 'Custos de produção',
    total_cost: 50000,
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pool-2',
    name: 'Pool de Qualidade',
    description: 'Custos de qualidade',
    total_cost: 30000,
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pool-3',
    name: 'Pool de Manutenção',
    description: 'Custos de manutenção',
    total_cost: 20000,
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    created_at: '2024-01-01T00:00:00Z',
  },
];

const mockJobCosts: ABCJobCost[] = [
  {
    id: 'cost-1',
    job_id: 'job-1',
    cost_pool_id: 'pool-1',
    activity_id: 'act-1',
    allocated_cost: 15000,
    total_cost: 15000,
    calculation_details: {},
    calculated_at: '2024-01-15T00:00:00Z',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'cost-2',
    job_id: 'job-1',
    cost_pool_id: 'pool-2',
    activity_id: 'act-2',
    allocated_cost: 8000,
    total_cost: 8000,
    calculation_details: {},
    calculated_at: '2024-01-15T00:00:00Z',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'cost-3',
    job_id: 'job-2',
    cost_pool_id: 'pool-1',
    activity_id: 'act-1',
    allocated_cost: 12000,
    total_cost: 12000,
    calculation_details: {},
    calculated_at: '2024-01-16T00:00:00Z',
    created_at: '2024-01-16T00:00:00Z',
  },
  {
    id: 'cost-4',
    job_id: 'job-2',
    cost_pool_id: 'pool-3',
    activity_id: 'act-3',
    allocated_cost: 5000,
    total_cost: 5000,
    calculation_details: {},
    calculated_at: '2024-01-16T00:00:00Z',
    created_at: '2024-01-16T00:00:00Z',
  },
];

describe('ABCCostBreakdownChart', () => {
  describe('Rendering', () => {
    it('should render the card with title', () => {
      render(
        <ABCCostBreakdownChart
          costPools={mockCostPools}
          jobCosts={mockJobCosts}
        />
      );

      expect(screen.getByText('Distribuição de Custos')).toBeInTheDocument();
    });

    it('should display total allocated cost', () => {
      render(
        <ABCCostBreakdownChart
          costPools={mockCostPools}
          jobCosts={mockJobCosts}
        />
      );

      // Total: 15000 + 8000 + 12000 + 5000 = 40000
      expect(screen.getByText('Custo Total Alocado')).toBeInTheDocument();
      expect(screen.getByText('R$ 40.000,00')).toBeInTheDocument();
    });

    it('should render pie chart components', () => {
      render(
        <ABCCostBreakdownChart
          costPools={mockCostPools}
          jobCosts={mockJobCosts}
        />
      );

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie')).toBeInTheDocument();
      expect(screen.getByTestId('legend')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should render correct number of cells based on pools with costs', () => {
      render(
        <ABCCostBreakdownChart
          costPools={mockCostPools}
          jobCosts={mockJobCosts}
        />
      );

      // Pools with costs: pool-1 (27000), pool-2 (8000), pool-3 (5000) = 3 cells
      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(3);
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no job costs', () => {
      render(
        <ABCCostBreakdownChart
          costPools={mockCostPools}
          jobCosts={[]}
        />
      );

      expect(screen.getByText('Nenhum custo alocado ainda')).toBeInTheDocument();
    });

    it('should display empty state when no cost pools', () => {
      render(
        <ABCCostBreakdownChart
          costPools={[]}
          jobCosts={mockJobCosts}
        />
      );

      expect(screen.getByText('Nenhum custo alocado ainda')).toBeInTheDocument();
    });

    it('should not render pie chart in empty state', () => {
      render(
        <ABCCostBreakdownChart
          costPools={mockCostPools}
          jobCosts={[]}
        />
      );

      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
    });
  });

  describe('Cost Aggregation', () => {
    it('should aggregate costs by cost pool correctly', () => {
      const singlePoolCosts: ABCJobCost[] = [
        {
          id: 'cost-1',
          job_id: 'job-1',
          cost_pool_id: 'pool-1',
          activity_id: 'act-1',
          allocated_cost: 1000,
          total_cost: 1000,
          calculation_details: {},
          calculated_at: '2024-01-15T00:00:00Z',
          created_at: '2024-01-15T00:00:00Z',
        },
        {
          id: 'cost-2',
          job_id: 'job-2',
          cost_pool_id: 'pool-1',
          activity_id: 'act-1',
          allocated_cost: 2000,
          total_cost: 2000,
          calculation_details: {},
          calculated_at: '2024-01-15T00:00:00Z',
          created_at: '2024-01-15T00:00:00Z',
        },
      ];

      render(
        <ABCCostBreakdownChart
          costPools={mockCostPools}
          jobCosts={singlePoolCosts}
        />
      );

      // Total should be 3000
      expect(screen.getByText('R$ 3.000,00')).toBeInTheDocument();
    });

    it('should filter out pools with zero costs', () => {
      const singlePoolCosts: ABCJobCost[] = [
        {
          id: 'cost-1',
          job_id: 'job-1',
          cost_pool_id: 'pool-1',
          activity_id: 'act-1',
          allocated_cost: 5000,
          total_cost: 5000,
          calculation_details: {},
          calculated_at: '2024-01-15T00:00:00Z',
          created_at: '2024-01-15T00:00:00Z',
        },
      ];

      render(
        <ABCCostBreakdownChart
          costPools={mockCostPools}
          jobCosts={singlePoolCosts}
        />
      );

      // Only 1 cell for pool-1
      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(1);
    });
  });

  describe('Color Assignment', () => {
    it('should assign different colors to different pools', () => {
      render(
        <ABCCostBreakdownChart
          costPools={mockCostPools}
          jobCosts={mockJobCosts}
        />
      );

      const cells = screen.getAllByTestId('cell');
      const fills = cells.map(cell => cell.getAttribute('data-fill'));
      
      // Each cell should have a color
      fills.forEach(fill => {
        expect(fill).toBeTruthy();
      });

      // All colors should be different (for 3 pools)
      const uniqueFills = new Set(fills);
      expect(uniqueFills.size).toBe(fills.length);
    });

    it('should cycle through colors for many pools', () => {
      const manyPools: ABCCostPool[] = Array.from({ length: 8 }, (_, i) => ({
        id: `pool-${i}`,
        name: `Pool ${i}`,
        description: `Description ${i}`,
        total_cost: 10000,
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        created_at: '2024-01-01T00:00:00Z',
      }));

      const manyCosts: ABCJobCost[] = manyPools.map((pool, i) => ({
        id: `cost-${i}`,
        job_id: 'job-1',
        cost_pool_id: pool.id,
        activity_id: 'act-1',
        allocated_cost: 1000,
        total_cost: 1000,
        calculation_details: {},
        calculated_at: '2024-01-15T00:00:00Z',
        created_at: '2024-01-15T00:00:00Z',
      }));

      render(
        <ABCCostBreakdownChart
          costPools={manyPools}
          jobCosts={manyCosts}
        />
      );

      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(8);
    });
  });

  describe('Currency Formatting', () => {
    it('should format large numbers correctly', () => {
      const largeCosts: ABCJobCost[] = [
        {
          id: 'cost-1',
          job_id: 'job-1',
          cost_pool_id: 'pool-1',
          activity_id: 'act-1',
          allocated_cost: 1234567.89,
          total_cost: 1234567.89,
          calculation_details: {},
          calculated_at: '2024-01-15T00:00:00Z',
          created_at: '2024-01-15T00:00:00Z',
        },
      ];

      render(
        <ABCCostBreakdownChart
          costPools={mockCostPools}
          jobCosts={largeCosts}
        />
      );

      expect(screen.getByText('R$ 1.234.567,89')).toBeInTheDocument();
    });

    it('should format small numbers correctly', () => {
      const smallCosts: ABCJobCost[] = [
        {
          id: 'cost-1',
          job_id: 'job-1',
          cost_pool_id: 'pool-1',
          activity_id: 'act-1',
          allocated_cost: 0.50,
          total_cost: 0.50,
          calculation_details: {},
          calculated_at: '2024-01-15T00:00:00Z',
          created_at: '2024-01-15T00:00:00Z',
        },
      ];

      render(
        <ABCCostBreakdownChart
          costPools={mockCostPools}
          jobCosts={smallCosts}
        />
      );

      expect(screen.getByText('R$ 0,50')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible heading', () => {
      render(
        <ABCCostBreakdownChart
          costPools={mockCostPools}
          jobCosts={mockJobCosts}
        />
      );

      expect(screen.getByRole('heading', { name: /distribuição de custos/i })).toBeInTheDocument();
    });

    it('should have descriptive text for screen readers', () => {
      render(
        <ABCCostBreakdownChart
          costPools={mockCostPools}
          jobCosts={mockJobCosts}
        />
      );

      expect(screen.getByText('Custo Total Alocado')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle job costs with string total_cost', () => {
      const stringCosts: ABCJobCost[] = [
        {
          id: 'cost-1',
          job_id: 'job-1',
          cost_pool_id: 'pool-1',
          activity_id: 'act-1',
          allocated_cost: 5000,
          total_cost: '5000' as any,
          calculation_details: {},
          calculated_at: '2024-01-15T00:00:00Z',
          created_at: '2024-01-15T00:00:00Z',
        },
      ];

      render(
        <ABCCostBreakdownChart
          costPools={mockCostPools}
          jobCosts={stringCosts}
        />
      );

      expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument();
    });

    it('should handle undefined job costs gracefully', () => {
      render(
        <ABCCostBreakdownChart
          costPools={mockCostPools}
          jobCosts={undefined as any}
        />
      );

      // Should show empty state or handle gracefully
      expect(screen.getByText('Distribuição de Custos')).toBeInTheDocument();
    });
  });
});
