import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentJobsTable } from './RecentJobsTable';

const mockJobs = [
  { id: '1', order_number: 'ORD-001', client: 'Cliente A', product: 'Produto X', status: 'in_progress', quantity: 100 },
  { id: '2', order_number: 'ORD-002', client: 'Cliente B', product: 'Produto Y', status: 'completed', quantity: 200 },
  { id: '3', order_number: 'ORD-003', client: 'Cliente C', product: 'Produto Z', status: 'pending', quantity: 50 },
];

describe('RecentJobsTable', () => {
  it('should render table with jobs', () => {
    render(<RecentJobsTable jobs={mockJobs} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should display order numbers', () => {
    render(<RecentJobsTable jobs={mockJobs} />);
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText('ORD-002')).toBeInTheDocument();
  });

  it('should display client names', () => {
    render(<RecentJobsTable jobs={mockJobs} />);
    expect(screen.getByText('Cliente A')).toBeInTheDocument();
  });

  it('should display product names', () => {
    render(<RecentJobsTable jobs={mockJobs} />);
    expect(screen.getByText('Produto X')).toBeInTheDocument();
  });

  it('should show status badges', () => {
    render(<RecentJobsTable jobs={mockJobs} />);
    expect(screen.getByText(/em andamento|in progress/i)).toBeInTheDocument();
  });

  it('should display quantities', () => {
    render(<RecentJobsTable jobs={mockJobs} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(<RecentJobsTable jobs={[]} />);
    expect(screen.getByText(/nenhum job|sem jobs/i)).toBeInTheDocument();
  });

  it('should have table headers', () => {
    render(<RecentJobsTable jobs={mockJobs} />);
    expect(screen.getByText(/pedido|order/i)).toBeInTheDocument();
    expect(screen.getByText(/cliente/i)).toBeInTheDocument();
  });
});
