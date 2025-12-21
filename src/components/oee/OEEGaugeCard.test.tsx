import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OEEGaugeCard } from './OEEGaugeCard';

describe('OEEGaugeCard', () => {
  it('should render gauge', () => {
    render(<OEEGaugeCard value={85} title="OEE" />);
    expect(screen.getByText('OEE')).toBeInTheDocument();
  });

  it('should display percentage', () => {
    render(<OEEGaugeCard value={85} title="OEE" />);
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });

  it('should show status color for good values', () => {
    render(<OEEGaugeCard value={90} title="OEE" />);
    expect(document.querySelector('.text-green, .bg-green')).toBeInTheDocument();
  });

  it('should show status color for bad values', () => {
    render(<OEEGaugeCard value={50} title="OEE" />);
    expect(document.querySelector('.text-red, .bg-red, .text-yellow')).toBeInTheDocument();
  });
});
