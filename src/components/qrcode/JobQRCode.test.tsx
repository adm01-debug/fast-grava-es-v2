import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JobQRCode } from './JobQRCode';

describe('JobQRCode', () => {
  it('should render QR code', () => {
    render(<JobQRCode jobId="job-123" orderNumber="ORD-001" />);
    expect(document.querySelector('svg, canvas')).toBeInTheDocument();
  });
  it('should show order number', () => {
    render(<JobQRCode jobId="job-123" orderNumber="ORD-001" />);
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
  });
});
