import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Bitrix24SyncHistory } from './Bitrix24SyncHistory';

const mockHistory = [
  { id: '1', timestamp: new Date().toISOString(), status: 'success', records: 50, duration: '2s' },
  { id: '2', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'error', records: 0, error: 'Timeout' },
];

describe('Bitrix24SyncHistory', () => {
  it('should render sync history', () => {
    render(<Bitrix24SyncHistory history={mockHistory} />);
    expect(screen.getByText(/histórico|sync/i)).toBeInTheDocument();
  });

  it('should show successful syncs', () => {
    render(<Bitrix24SyncHistory history={mockHistory} />);
    expect(screen.getByText(/sucesso|success/i)).toBeInTheDocument();
  });

  it('should show failed syncs', () => {
    render(<Bitrix24SyncHistory history={mockHistory} />);
    expect(screen.getByText(/erro|error/i)).toBeInTheDocument();
  });

  it('should display record counts', () => {
    render(<Bitrix24SyncHistory history={mockHistory} />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });
});
