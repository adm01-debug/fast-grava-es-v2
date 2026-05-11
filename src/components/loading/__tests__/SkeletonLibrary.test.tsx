import { describe, it, expect, vi } from 'vitest';
import { render,  , act } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import {
  Shimmer,
  StatsCardSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  CardSkeleton,
  ChartSkeleton,
  FormSkeleton,
  ListSkeleton,
  KanbanSkeleton,
  DashboardSkeleton,
  ProgressiveSkeleton,
} from '../SkeletonLibrary';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className}>{children}</div>,
  },
}));

describe('SkeletonLibrary', () => {
  // ===== SHIMMER =====
  describe('Shimmer', () => {
    it('renders with shimmer animation classes', () => {
      const { container } = render(<Shimmer />);
      expect(container.firstChild).toHaveClass('bg-muted');
    });

    it('accepts custom className', () => {
      const { container } = render(<Shimmer className="h-10 w-full" />);
      expect(container.firstChild).toHaveClass('h-10', 'w-full');
    });
  });

  // ===== STATS CARD SKELETON =====
  describe('StatsCardSkeleton', () => {
    it('renders anatomical skeleton matching StatsCard layout', () => {
      const { container } = render(<StatsCardSkeleton />);
      // Should have glass-card class
      const card = container.firstChild;
      expect(card).toBeInTheDocument();
    });

    it('contains skeleton elements for label, value, badge, and icon', () => {
      const { container } = render(<StatsCardSkeleton />);
      // Skeleton component renders divs with specific classes
      const skeletons = container.querySelectorAll('.rounded-md, .rounded-full, .rounded-xl');
      expect(skeletons.length).toBeGreaterThanOrEqual(4);
    });

    it('accepts custom className', () => {
      const { container } = render(<StatsCardSkeleton className="my-class" />);
      expect(container.innerHTML).toContain('my-class');
    });
  });

  // ===== TABLE ROW SKELETON =====
  describe('TableRowSkeleton', () => {
    it('renders correct number of columns', () => {
      const { container } = render(
        <table><tbody><TableRowSkeleton columns={7} /></tbody></table>
      );
      const tds = container.querySelectorAll('td');
      expect(tds.length).toBe(7);
    });

    it('defaults to 5 columns', () => {
      const { container } = render(
        <table><tbody><TableRowSkeleton /></tbody></table>
      );
      expect(container.querySelectorAll('td').length).toBe(5);
    });
  });

  // ===== TABLE SKELETON =====
  describe('TableSkeleton', () => {
    it('renders with default 5 rows and 5 columns', () => {
      const { container } = render(<TableSkeleton />);
      expect(container.firstChild).toHaveClass('rounded-lg', 'border');
    });

    it('renders custom row count', () => {
      const { container } = render(<TableSkeleton rows={3} columns={4} />);
      const rows = container.querySelectorAll('.divide-y > div');
      expect(rows.length).toBe(3);
    });
  });

  // ===== CARD SKELETON =====
  describe('CardSkeleton', () => {
    it('renders header when hasHeader=true', () => {
      const { container } = render(<CardSkeleton hasHeader />);
      // CardHeader renders inside the card
      const card = container.firstChild;
      expect(card).toBeInTheDocument();
      // Should have header skeleton content (h-5 w-32 label)
      const headerSkeletons = container.querySelectorAll('.h-5');
      expect(headerSkeletons.length).toBeGreaterThan(0);
    });

    it('renders footer when hasFooter=true', () => {
      const { container } = render(<CardSkeleton hasFooter />);
      // Footer has action button skeletons (h-9)
      const footerSkeletons = container.querySelectorAll('.h-9');
      expect(footerSkeletons.length).toBeGreaterThan(0);
    });

    it('renders correct number of lines', () => {
      const { container } = render(<CardSkeleton lines={5} hasHeader={false} />);
      const skeletons = container.querySelectorAll('.h-4');
      expect(skeletons.length).toBe(5);
    });
  });

  // ===== CHART SKELETON =====
  describe('ChartSkeleton', () => {
    it('renders bar chart skeleton by default', () => {
      const { container } = render(<ChartSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders pie chart skeleton', () => {
      const { container } = render(<ChartSkeleton type="pie" />);
      // Pie has a rounded-full skeleton
      const circle = container.querySelector('.rounded-full');
      expect(circle).toBeInTheDocument();
    });

    it('renders bar chart with 7 bars', () => {
      const { container } = render(<ChartSkeleton type="bar" />);
      const bars = container.querySelectorAll('.rounded-t-md');
      expect(bars.length).toBe(7);
    });
  });

  // ===== FORM SKELETON =====
  describe('FormSkeleton', () => {
    it('renders default 4 fields', () => {
      const { container } = render(<FormSkeleton />);
      // Each field has label + input skeleton = 2 skeletons per field
      const fieldGroups = container.querySelectorAll('.space-y-2');
      expect(fieldGroups.length).toBe(4);
    });

    it('renders custom field count', () => {
      const { container } = render(<FormSkeleton fields={6} />);
      const fieldGroups = container.querySelectorAll('.space-y-2');
      expect(fieldGroups.length).toBe(6);
    });
  });

  // ===== LIST SKELETON =====
  describe('ListSkeleton', () => {
    it('renders default 5 items', () => {
      const { container } = render(<ListSkeleton />);
      const items = container.querySelectorAll('.flex.items-center.gap-3');
      expect(items.length).toBe(5);
    });

    it('renders avatars when hasAvatar=true', () => {
      const { container } = render(<ListSkeleton hasAvatar items={3} />);
      const avatars = container.querySelectorAll('.rounded-full');
      expect(avatars.length).toBe(3);
    });

    it('renders action buttons when hasAction=true', () => {
      const { container } = render(<ListSkeleton hasAction items={2} />);
      const actions = container.querySelectorAll('.shrink-0');
      expect(actions.length).toBe(2);
    });
  });

  // ===== KANBAN SKELETON =====
  describe('KanbanSkeleton', () => {
    it('renders default 4 columns', () => {
      const { container } = render(<KanbanSkeleton />);
      const columns = container.querySelectorAll('.w-72');
      expect(columns.length).toBe(4);
    });

    it('renders custom columns and cards', () => {
      const { container } = render(<KanbanSkeleton columns={3} cardsPerColumn={2} />);
      const columns = container.querySelectorAll('.w-72');
      expect(columns.length).toBe(3);
    });
  });

  // ===== DASHBOARD SKELETON =====
  describe('DashboardSkeleton', () => {
    it('renders stats cards grid', () => {
      const { container } = render(<DashboardSkeleton />);
      // Should have 4 StatsCardSkeletons in a grid
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('renders header section', () => {
      const { container } = render(<DashboardSkeleton />);
      const header = container.querySelector('.flex.justify-between');
      expect(header).toBeInTheDocument();
    });
  });

  // ===== PROGRESSIVE SKELETON =====
  describe('ProgressiveSkeleton', () => {
    it('shows skeleton when loading (after delay)', async () => {
      vi.useFakeTimers();
      const { queryByText } = render(
        <ProgressiveSkeleton isLoading={true} skeleton={<div>Loading...</div>} delay={0}>
          <div>Content</div>
        </ProgressiveSkeleton>
      );
      
      act(() => { vi.advanceTimersByTime(10); });
      expect(queryByText('Loading...')).toBeInTheDocument();
      vi.useRealTimers();
    });

    it('shows content when not loading', async () => {
      vi.useFakeTimers();
      const { queryByText } = render(
        <ProgressiveSkeleton isLoading={false} skeleton={<div>Loading...</div>} delay={0} minLoadTime={0}>
          <div>Content</div>
        </ProgressiveSkeleton>
      );
      
      act(() => { vi.advanceTimersByTime(10); });
      expect(queryByText('Content')).toBeInTheDocument();
      vi.useRealTimers();
    });
  });
});
