import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScanHistory } from './ScanHistory';

const mockScans = [
  { id: '1', orderNumber: 'ORD-001', timestamp: new Date().toISOString(), action: 'start' },
  { id: '2', orderNumber: 'ORD-002', timestamp: new Date().toISOString(), action: 'complete' },
];

describe('ScanHistory', () => {
  it('should render history', () => {
    render(<ScanHistory scans={mockScans} />);
    expect(screen.getByText(/histórico/i)).toBeInTheDocument();
  });
  it('should show scanned orders', () => {
    render(<ScanHistory scans={mockScans} />);
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
  });
});
