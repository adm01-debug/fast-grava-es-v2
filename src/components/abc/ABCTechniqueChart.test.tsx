import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ABCTechniqueChart } from './ABCTechniqueChart';
import { TechniqueCostSummary } from '@/hooks/useABCCosts';

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children, data }: { children: React.ReactNode; data: any[] }) => (
    <div data-testid="bar-chart" data-count={data?.length}>
      {children}
    </div>
  ),
  Bar: ({ children, dataKey }: { children: React.ReactNode; dataKey: string }) => (
    <div data-testid="bar" data-key={dataKey}>
      {children}
    </div>
  ),
  Cell: ({ fill }: { fill: string }) => <div data-testid="cell" data-fill={fill} />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

const mockTechniqueSummaries: TechniqueCostSummary[] = [
  {
    technique_id: 'tech-1',
    technique_name: 'Serigrafia',
    total_jobs: 50,
    total_quantity: 10000,
    total_cost: 25000,
    avg_unit_cost: 2.5,
  },
  {
    technique_id: 'tech-2',
    technique_name: 'Tampografia',
    total_jobs: 30,
    total_quantity: 5000,
    total_cost: 20000,
    avg_unit_cost: 4.0,
  },
  {
    technique_id: 'tech-3',
    technique_name: 'Laser',
    total_jobs: 20,
    total_quantity: 2000,
    total_cost: 15000,
    avg_unit_cost: 7.5,
  },
  {
    technique_id: 'tech-4',
    technique_name: 'Bordado',
    total_jobs: 15,
    total_quantity: 1000,
    total_cost: 10000,
    avg_unit_cost: 10.0,
  },
  {
    technique_id: 'tech-5',
    technique_name: 'Transfer',
    total_jobs: 25,
    total_quantity: 8000,
    total_cost: 12000,
    avg_unit_cost: 1.5,
  },
];

describe('ABCTechniqueChart', () => {
  describe('Rendering', () => {
    it('should render the card with title', () => {
      render(<ABCTechniqueChart data={mockTechniqueSummaries} />);

      expect(screen.getByText('Custo Unitário por Técnica')).toBeInTheDocument();
    });

    it('should render chart components when data is provided', () => {
      render(<ABCTechniqueChart data={mockTechniqueSummaries} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar')).toBeInTheDocument();
      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should render cells for each data point', () => {
      render(<ABCTechniqueChart data={mockTechniqueSummaries} />);

      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(mockTechniqueSummaries.length);
    });

    it('should use custo_unitario as the bar dataKey', () => {
      render(<ABCTechniqueChart data={mockTechniqueSummaries} />);

      const bar = screen.getByTestId('bar');
      expect(bar).toHaveAttribute('data-key', 'custo_unitario');
    });
  });

  describe('Data Sorting', () => {
    it('should sort data by avg_unit_cost descending', () => {
      render(<ABCTechniqueChart data={mockTechniqueSummaries} />);

      const barChart = screen.getByTestId('bar-chart');
      expect(barChart).toHaveAttribute('data-count', '5');
    });

    it('should limit data to 10 items', () => {
      const manyTechniques: TechniqueCostSummary[] = Array.from({ length: 15 }, (_, i) => ({
        technique_id: `tech-${i}`,
        technique_name: `Technique ${i}`,
        total_jobs: 10,
        total_quantity: 1000,
        total_cost: 5000,
        avg_unit_cost: 15 - i,
      }));

      render(<ABCTechniqueChart data={manyTechniques} />);

      const barChart = screen.getByTestId('bar-chart');
      expect(barChart).toHaveAttribute('data-count', '10');
    });
  });

  describe('Empty State', () => {
    it('should display empty message when no data', () => {
      render(<ABCTechniqueChart data={[]} />);

      expect(screen.getByText('Nenhum dado de custo disponível')).toBeInTheDocument();
    });

    it('should not render chart components when no data', () => {
      render(<ABCTechniqueChart data={[]} />);

      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });
  });

  describe('Name Truncation', () => {
    it('should truncate long technique names', () => {
      const longNameTechnique: TechniqueCostSummary[] = [{
        technique_id: 'tech-1',
        technique_name: 'Serigrafia Especial com Acabamento Premium',
        total_jobs: 10,
        total_quantity: 1000,
        total_cost: 5000,
        avg_unit_cost: 5.0,
      }];

      render(<ABCTechniqueChart data={longNameTechnique} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should keep short names unchanged', () => {
      const shortNameTechnique: TechniqueCostSummary[] = [{
        technique_id: 'tech-1',
        technique_name: 'Laser',
        total_jobs: 10,
        total_quantity: 1000,
        total_cost: 5000,
        avg_unit_cost: 5.0,
      }];

      render(<ABCTechniqueChart data={shortNameTechnique} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Color Assignment', () => {
    it('should assign colors to cells', () => {
      render(<ABCTechniqueChart data={mockTechniqueSummaries} />);

      const cells = screen.getAllByTestId('cell');
      cells.forEach(cell => {
        expect(cell).toHaveAttribute('data-fill');
        expect(cell.getAttribute('data-fill')).toBeTruthy();
      });
    });

    it('should cycle colors for more than 5 items', () => {
      const manyTechniques: TechniqueCostSummary[] = Array.from({ length: 7 }, (_, i) => ({
        technique_id: `tech-${i}`,
        technique_name: `Technique ${i}`,
        total_jobs: 10,
        total_quantity: 1000,
        total_cost: 5000,
        avg_unit_cost: 10 - i,
      }));

      render(<ABCTechniqueChart data={manyTechniques} />);

      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(7);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible heading', () => {
      render(<ABCTechniqueChart data={mockTechniqueSummaries} />);

      expect(screen.getByRole('heading', { name: /custo unitário por técnica/i })).toBeInTheDocument();
    });

    it('should render accessible container', () => {
      render(<ABCTechniqueChart data={mockTechniqueSummaries} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single data point', () => {
      const singleTechnique: TechniqueCostSummary[] = [{
        technique_id: 'tech-1',
        technique_name: 'Serigrafia',
        total_jobs: 10,
        total_quantity: 1000,
        total_cost: 5000,
        avg_unit_cost: 5.0,
      }];

      render(<ABCTechniqueChart data={singleTechnique} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(1);
    });

    it('should handle zero avg_unit_cost', () => {
      const zeroCostTechnique: TechniqueCostSummary[] = [{
        technique_id: 'tech-1',
        technique_name: 'Free Technique',
        total_jobs: 10,
        total_quantity: 1000,
        total_cost: 0,
        avg_unit_cost: 0,
      }];

      render(<ABCTechniqueChart data={zeroCostTechnique} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should handle very large costs', () => {
      const largeCostTechnique: TechniqueCostSummary[] = [{
        technique_id: 'tech-1',
        technique_name: 'Expensive Technique',
        total_jobs: 10,
        total_quantity: 1000,
        total_cost: 1000000000,
        avg_unit_cost: 1000000,
      }];

      render(<ABCTechniqueChart data={largeCostTechnique} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should handle very small costs', () => {
      const smallCostTechnique: TechniqueCostSummary[] = [{
        technique_id: 'tech-1',
        technique_name: 'Cheap Technique',
        total_jobs: 10,
        total_quantity: 1000000,
        total_cost: 1,
        avg_unit_cost: 0.000001,
      }];

      render(<ABCTechniqueChart data={smallCostTechnique} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should handle techniques with same avg_unit_cost', () => {
      const sameCostTechniques: TechniqueCostSummary[] = [
        {
          technique_id: 'tech-1',
          technique_name: 'Technique A',
          total_jobs: 10,
          total_quantity: 1000,
          total_cost: 5000,
          avg_unit_cost: 5.0,
        },
        {
          technique_id: 'tech-2',
          technique_name: 'Technique B',
          total_jobs: 20,
          total_quantity: 2000,
          total_cost: 10000,
          avg_unit_cost: 5.0,
        },
      ];

      render(<ABCTechniqueChart data={sameCostTechniques} />);

      const cells = screen.getAllByTestId('cell');
      expect(cells).toHaveLength(2);
    });
  });

  describe('Data Transformation', () => {
    it('should correctly transform data for chart', () => {
      render(<ABCTechniqueChart data={mockTechniqueSummaries} />);

      const barChart = screen.getByTestId('bar-chart');
      expect(barChart).toBeInTheDocument();
    });

    it('should preserve full name in payload for tooltip', () => {
      const longNameTechnique: TechniqueCostSummary[] = [{
        technique_id: 'tech-1',
        technique_name: 'Serigrafia Especial com Acabamento Premium e Alta Qualidade',
        total_jobs: 10,
        total_quantity: 1000,
        total_cost: 5000,
        avg_unit_cost: 5.0,
      }];

      render(<ABCTechniqueChart data={longNameTechnique} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });
});
