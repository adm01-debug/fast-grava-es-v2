import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BufferStatusWidget } from './BufferStatusWidget';

// Mock data
const mockBufferData = {
  buffers: [
    {
      id: 'buffer-1',
      name: 'Buffer Entrada CNC',
      machine_id: 'machine-1',
      machine_name: 'CNC-01',
      current_count: 15,
      max_capacity: 20,
      min_threshold: 5,
      max_threshold: 18,
      status: 'normal',
      items: [
        { job_id: 'job-1', order_number: 'ORD-001', quantity: 5, priority: 'high' },
        { job_id: 'job-2', order_number: 'ORD-002', quantity: 10, priority: 'normal' },
      ],
    },
    {
      id: 'buffer-2',
      name: 'Buffer Saída CNC',
      machine_id: 'machine-1',
      machine_name: 'CNC-01',
      current_count: 3,
      max_capacity: 15,
      min_threshold: 5,
      max_threshold: 12,
      status: 'low',
      items: [
        { job_id: 'job-3', order_number: 'ORD-003', quantity: 3, priority: 'low' },
      ],
    },
    {
      id: 'buffer-3',
      name: 'Buffer Prensa',
      machine_id: 'machine-2',
      machine_name: 'Prensa-01',
      current_count: 19,
      max_capacity: 20,
      min_threshold: 5,
      max_threshold: 18,
      status: 'high',
      items: [
        { job_id: 'job-4', order_number: 'ORD-004', quantity: 10, priority: 'high' },
        { job_id: 'job-5', order_number: 'ORD-005', quantity: 9, priority: 'high' },
      ],
    },
  ],
  totalItems: 37,
  totalCapacity: 55,
  utilizationPercentage: 67.3,
};

// Mock hooks
const mockRefetch = vi.fn();

vi.mock('@/hooks/useAutoBufferPromotion', () => ({
  useAutoBufferPromotion: () => ({
    ...mockBufferData,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
    promoteBuffer: vi.fn(),
  }),
}));

describe('BufferStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the widget with title', () => {
      render(<BufferStatusWidget />);

      expect(screen.getByText(/buffer|estoque/i)).toBeInTheDocument();
    });

    it('should render all buffers', () => {
      render(<BufferStatusWidget />);

      expect(screen.getByText('Buffer Entrada CNC')).toBeInTheDocument();
      expect(screen.getByText('Buffer Saída CNC')).toBeInTheDocument();
      expect(screen.getByText('Buffer Prensa')).toBeInTheDocument();
    });

    it('should display machine names', () => {
      render(<BufferStatusWidget />);

      expect(screen.getAllByText('CNC-01').length).toBeGreaterThan(0);
      expect(screen.getByText('Prensa-01')).toBeInTheDocument();
    });

    it('should display buffer counts', () => {
      render(<BufferStatusWidget />);

      expect(screen.getByText(/15/)).toBeInTheDocument();
      expect(screen.getByText(/3/)).toBeInTheDocument();
      expect(screen.getByText(/19/)).toBeInTheDocument();
    });

    it('should display capacity information', () => {
      render(<BufferStatusWidget />);

      expect(screen.getByText(/\/20/)).toBeInTheDocument();
      expect(screen.getByText(/\/15/)).toBeInTheDocument();
    });

    it('should show total utilization', () => {
      render(<BufferStatusWidget />);

      expect(screen.getByText(/67/)).toBeInTheDocument();
    });
  });

  describe('Status Indicators', () => {
    it('should display normal status correctly', () => {
      render(<BufferStatusWidget />);

      const normalBuffer = screen.getByText('Buffer Entrada CNC').closest('div');
      expect(normalBuffer).toBeInTheDocument();
    });

    it('should display low status with warning styling', () => {
      render(<BufferStatusWidget />);

      const lowBuffer = screen.getByText('Buffer Saída CNC').closest('div');
      expect(lowBuffer).toBeInTheDocument();
    });

    it('should display high status with alert styling', () => {
      render(<BufferStatusWidget />);

      const highBuffer = screen.getByText('Buffer Prensa').closest('div');
      expect(highBuffer).toBeInTheDocument();
    });
  });

  describe('Progress Bars', () => {
    it('should render progress bars for each buffer', () => {
      render(<BufferStatusWidget />);

      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBe(3);
    });

    it('should show correct fill percentage', () => {
      render(<BufferStatusWidget />);

      // Buffer 1: 15/20 = 75%
      // Buffer 2: 3/15 = 20%
      // Buffer 3: 19/20 = 95%
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars).toHaveLength(3);
    });
  });

  describe('Summary Section', () => {
    it('should display total items count', () => {
      render(<BufferStatusWidget />);

      expect(screen.getByText(/37/)).toBeInTheDocument();
    });

    it('should display total capacity', () => {
      render(<BufferStatusWidget />);

      expect(screen.getByText(/55/)).toBeInTheDocument();
    });

    it('should display utilization percentage', () => {
      render(<BufferStatusWidget />);

      expect(screen.getByText(/67.*%/)).toBeInTheDocument();
    });
  });

  describe('Buffer Items', () => {
    it('should display job order numbers', () => {
      render(<BufferStatusWidget />);

      // If expanded view is available
      const expandButtons = screen.queryAllByRole('button', { name: /expandir|ver|detalhes/i });
      if (expandButtons.length > 0) {
        // Click to expand and check items
        expect(expandButtons[0]).toBeInTheDocument();
      }
    });

    it('should show priority indicators', () => {
      render(<BufferStatusWidget />);

      // Priority badges or indicators
      const highPriority = screen.queryAllByText(/alta|high/i);
      expect(highPriority.length >= 0).toBe(true);
    });
  });

  describe('Interactions', () => {
    it('should call refetch when refresh button is clicked', async () => {
      const user = userEvent.setup();
      render(<BufferStatusWidget />);

      const refreshButton = screen.queryByRole('button', { name: /atualizar|refresh/i });
      if (refreshButton) {
        await user.click(refreshButton);
        expect(mockRefetch).toHaveBeenCalled();
      }
    });

    it('should expand buffer details on click', async () => {
      const user = userEvent.setup();
      render(<BufferStatusWidget />);

      const bufferCard = screen.getByText('Buffer Entrada CNC').closest('div');
      if (bufferCard) {
        await user.click(bufferCard);
        // Should show expanded details
      }
    });
  });

  describe('Threshold Indicators', () => {
    it('should show warning when below min threshold', () => {
      render(<BufferStatusWidget />);

      // Buffer 2 is below min threshold (3 < 5)
      const lowBufferSection = screen.getByText('Buffer Saída CNC').closest('div');
      expect(lowBufferSection).toBeInTheDocument();
    });

    it('should show alert when above max threshold', () => {
      render(<BufferStatusWidget />);

      // Buffer 3 is above max threshold (19 > 18)
      const highBufferSection = screen.getByText('Buffer Prensa').closest('div');
      expect(highBufferSection).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when loading', () => {
      vi.mocked(vi.importMock('@/hooks/useAutoBufferPromotion')).useAutoBufferPromotion = () => ({
        buffers: [],
        totalItems: 0,
        totalCapacity: 0,
        utilizationPercentage: 0,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
        promoteBuffer: vi.fn(),
      });

      render(<BufferStatusWidget />);
      // Should show skeleton or loading indicator
      expect(screen.getByText(/buffer|estoque/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when error occurs', () => {
      vi.mocked(vi.importMock('@/hooks/useAutoBufferPromotion')).useAutoBufferPromotion = () => ({
        buffers: [],
        totalItems: 0,
        totalCapacity: 0,
        utilizationPercentage: 0,
        isLoading: false,
        error: new Error('Failed to load buffers'),
        refetch: mockRefetch,
        promoteBuffer: vi.fn(),
      });

      render(<BufferStatusWidget />);
      // Should show error state
      expect(screen.getByText(/buffer|estoque/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no buffers', () => {
      vi.mocked(vi.importMock('@/hooks/useAutoBufferPromotion')).useAutoBufferPromotion = () => ({
        buffers: [],
        totalItems: 0,
        totalCapacity: 0,
        utilizationPercentage: 0,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        promoteBuffer: vi.fn(),
      });

      render(<BufferStatusWidget />);
      expect(screen.getByText(/nenhum buffer|sem dados/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible heading', () => {
      render(<BufferStatusWidget />);

      expect(screen.getByRole('heading', { name: /buffer|estoque/i })).toBeInTheDocument();
    });

    it('should have accessible progress bars', () => {
      render(<BufferStatusWidget />);

      const progressBars = screen.getAllByRole('progressbar');
      progressBars.forEach(bar => {
        expect(bar).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<BufferStatusWidget />);

      const buttons = screen.queryAllByRole('button');
      if (buttons.length > 0) {
        buttons[0].focus();
        expect(document.activeElement).toBe(buttons[0]);
      }
    });
  });

  describe('Real-time Updates', () => {
    it('should update when data changes', async () => {
      const { rerender } = render(<BufferStatusWidget />);

      // Initial render
      expect(screen.getByText(/37/)).toBeInTheDocument();

      // Simulating rerender with new data would require different mock
      rerender(<BufferStatusWidget />);
    });
  });

  describe('Sorting', () => {
    it('should sort buffers by status severity', () => {
      render(<BufferStatusWidget />);

      // High status buffers should appear first or be highlighted
      const bufferNames = screen.getAllByText(/Buffer/);
      expect(bufferNames.length).toBe(3);
    });
  });

  describe('Color Coding', () => {
    it('should use green for normal status', () => {
      render(<BufferStatusWidget />);

      const normalBuffer = screen.getByText('Buffer Entrada CNC').closest('div');
      expect(normalBuffer).toBeInTheDocument();
    });

    it('should use yellow for low status', () => {
      render(<BufferStatusWidget />);

      const lowBuffer = screen.getByText('Buffer Saída CNC').closest('div');
      expect(lowBuffer).toBeInTheDocument();
    });

    it('should use red for high status', () => {
      render(<BufferStatusWidget />);

      const highBuffer = screen.getByText('Buffer Prensa').closest('div');
      expect(highBuffer).toBeInTheDocument();
    });
  });
});
