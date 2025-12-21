import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MTBFMTTRWidget } from './MTBFMTTRWidget';

describe('MTBFMTTRWidget', () => {
  it('should render widget', () => {
    render(<MTBFMTTRWidget mtbf={120} mttr={15} />);
    expect(screen.getByText(/MTBF|MTTR/i)).toBeInTheDocument();
  });
  it('should show MTBF value', () => {
    render(<MTBFMTTRWidget mtbf={120} mttr={15} />);
    expect(screen.getByText(/120/)).toBeInTheDocument();
  });
  it('should show MTTR value', () => {
    render(<MTBFMTTRWidget mtbf={120} mttr={15} />);
    expect(screen.getByText(/15/)).toBeInTheDocument();
  });
});
