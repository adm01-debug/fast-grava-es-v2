import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SmartSequencingWidget } from './SmartSequencingWidget';

vi.mock('@/hooks/useSmartSequencing', () => ({
  useSmartSequencing: () => ({
    suggestions: [
      { id: '1', job: 'ORD-001', priority: 1, reason: 'Prazo crítico', savings: '2h' },
      { id: '2', job: 'ORD-002', priority: 2, reason: 'Mesma técnica', savings: '30min' },
    ],
    isLoading: false,
  }),
}));

describe('SmartSequencingWidget', () => {
  it('should render widget title', () => {
    render(<SmartSequencingWidget />);
    expect(screen.getByText(/sequenciamento|sequência/i)).toBeInTheDocument();
  });

  it('should display job suggestions', () => {
    render(<SmartSequencingWidget />);
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText('ORD-002')).toBeInTheDocument();
  });

  it('should show priority order', () => {
    render(<SmartSequencingWidget />);
    expect(screen.getByText(/1|primeiro/i)).toBeInTheDocument();
  });

  it('should display reasons', () => {
    render(<SmartSequencingWidget />);
    expect(screen.getByText(/prazo crítico/i)).toBeInTheDocument();
  });

  it('should show time savings', () => {
    render(<SmartSequencingWidget />);
    expect(screen.getByText(/2h/)).toBeInTheDocument();
  });
});
