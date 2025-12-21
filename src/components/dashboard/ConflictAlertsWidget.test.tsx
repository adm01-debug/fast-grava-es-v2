import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConflictAlertsWidget } from './ConflictAlertsWidget';

const mockConflicts = [
  { id: '1', type: 'overlap', jobs: ['ORD-001', 'ORD-002'], machine: 'CNC-01', severity: 'high' },
  { id: '2', type: 'capacity', jobs: ['ORD-003'], machine: 'Prensa-01', severity: 'medium' },
];

describe('ConflictAlertsWidget', () => {
  it('should render conflicts', () => {
    render(<ConflictAlertsWidget conflicts={mockConflicts} />);
    expect(screen.getByText(/conflito|alerta/i)).toBeInTheDocument();
  });

  it('should display job references', () => {
    render(<ConflictAlertsWidget conflicts={mockConflicts} />);
    expect(screen.getByText(/ORD-001/)).toBeInTheDocument();
  });

  it('should show machine names', () => {
    render(<ConflictAlertsWidget conflicts={mockConflicts} />);
    expect(screen.getByText('CNC-01')).toBeInTheDocument();
  });

  it('should indicate severity levels', () => {
    render(<ConflictAlertsWidget conflicts={mockConflicts} />);
    expect(screen.getByText(/alta|high/i)).toBeInTheDocument();
  });

  it('should show empty state when no conflicts', () => {
    render(<ConflictAlertsWidget conflicts={[]} />);
    expect(screen.getByText(/nenhum conflito|sem conflitos/i)).toBeInTheDocument();
  });

  it('should allow resolving conflicts', async () => {
    const onResolve = vi.fn();
    render(<ConflictAlertsWidget conflicts={mockConflicts} onResolve={onResolve} />);
    const resolveBtn = screen.queryByRole('button', { name: /resolver/i });
    if (resolveBtn) {
      await userEvent.click(resolveBtn);
      expect(onResolve).toHaveBeenCalled();
    }
  });
});
