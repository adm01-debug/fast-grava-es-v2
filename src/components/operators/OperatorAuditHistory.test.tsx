import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OperatorAuditHistory } from './OperatorAuditHistory';

const mockLogs = [
  { id: '1', action: 'login', timestamp: new Date().toISOString(), details: 'Login' },
  { id: '2', action: 'production', timestamp: new Date().toISOString(), details: '100 peças' },
];

describe('OperatorAuditHistory', () => {
  it('should render history', () => {
    render(<OperatorAuditHistory logs={mockLogs} />);
    expect(screen.getByText(/histórico|audit/i)).toBeInTheDocument();
  });
  it('should show actions', () => {
    render(<OperatorAuditHistory logs={mockLogs} />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });
});
