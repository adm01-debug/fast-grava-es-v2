import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QRScanner } from './QRScanner';

describe('QRScanner', () => {
  const mockOnScan = vi.fn();
  it('should render scanner', () => {
    render(<QRScanner onScan={mockOnScan} />);
    expect(screen.getByText(/scanner|escaneie/i)).toBeInTheDocument();
  });
  it('should have camera view', () => {
    render(<QRScanner onScan={mockOnScan} />);
    expect(document.querySelector('video, [data-camera]')).toBeInTheDocument();
  });
});
